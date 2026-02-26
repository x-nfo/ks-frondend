import type { Route } from "./+types/account._index";
import { CheckIcon, PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  data,
  redirect,
  Form,
} from "react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Button } from "~/components/Button";
import { ErrorMessage } from "~/components/ErrorMessage";
import { HighlightedButton } from "~/components/HighlightedButton";
import { Input } from "~/components/Input";
import Modal from "~/components/modal/Modal";
import {
  requestUpdateCustomerEmailAddress,
  updateCustomer,
} from "~/providers/account/account";
import { getActiveCustomerDetails } from "~/providers/customer/customer";
import useToggleState from "~/utils/use-toggle-state";
import { replaceEmptyString } from "~/utils/validation";

import { useForm, getFormProps, getInputProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";

enum FormIntent {
  UpdateEmail = "updateEmail",
  UpdateDetails = "updateDetails",
}

const detailsSchema = z.object({
  title: z.string().optional(),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  phoneNumber: z.string().optional(),
});

const changeEmailSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email("Must be a valid email"),
  password: z.string().min(1, { message: "Password is required" }),
});

export async function loader({ request, context }: Route.LoaderArgs) {
  const apiUrl =
    (context?.cloudflare?.env as any)?.VENDURE_API_URL ||
    process.env.VENDURE_API_URL ||
    "http://localhost:3000/shop-api";
  const customerData = await getActiveCustomerDetails({ request, apiUrl });
  if (!customerData?.activeCustomer) {
    return redirect("/sign-in");
  }
  return { activeCustomer: customerData.activeCustomer };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as FormIntent | null;

  if (intent === FormIntent.UpdateEmail) {
    const submission = parseWithZod(formData, { schema: changeEmailSchema });

    if (submission.status !== "success") {
      return data({ intent, payload: submission.reply() }, { status: 400 });
    }

    const { password: requestPassword, email: newEmailAddress } =
      submission.value;

    const updateResult = await requestUpdateCustomerEmailAddress(
      requestPassword,
      newEmailAddress,
      { request },
    );

    if (updateResult?.__typename !== "Success") {
      const errorMsg =
        updateResult && "message" in updateResult
          ? updateResult.message
          : "An unexpected error occurred while requesting email update.";
      return data(
        {
          intent,
          payload: submission.reply({ formErrors: [errorMsg] }),
        },
        { status: 400 },
      );
    }

    return data(
      {
        intent,
        payload: submission.reply({ resetForm: true }),
        success: true,
        newEmailAddress: newEmailAddress,
      },
      { status: 200 },
    );
  }

  if (intent === FormIntent.UpdateDetails) {
    const submission = parseWithZod(formData, { schema: detailsSchema });

    if (submission.status !== "success") {
      return data({ intent, payload: submission.reply() }, { status: 400 });
    }

    const { title, firstName, lastName, phoneNumber } = submission.value;
    try {
      const result = await updateCustomer(
        {
          title,
          firstName,
          lastName,
          phoneNumber,
        },
        { request },
      );

      if (!result || result.id === undefined) {
        return data(
          {
            intent,
            payload: submission.reply({
              formErrors: ["Failed to update account details."],
            }),
          },
          { status: 400 },
        );
      }

      return data({
        intent,
        payload: submission.reply(),
        success: true,
      });
    } catch (error: any) {
      console.error("Update details error:", error);
      return data(
        {
          intent,
          payload: submission.reply({
            formErrors: [
              error?.message || "An error occurred while updating details.",
            ],
          }),
        },
        { status: 500 },
      );
    }
  }

  return data({ message: "No valid form intent" }, { status: 401 });
}

export default function AccountDetails() {
  const { activeCustomer } = useLoaderData<typeof loader>();
  const actionData = useActionData<any>(); // using any for convenience with discriminated union

  const { firstName, lastName, title, phoneNumber, emailAddress } =
    activeCustomer;
  const fullName = `${title ? title + " " : ""}${firstName} ${lastName}`;

  const navigation = useNavigation();
  const state = navigation.state;

  // UI state
  const [showChangeEmailModal, openChangeEmailModal, closeChangeEmailModal] =
    useToggleState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Refs
  // const emailInputRef = useRef<HTMLInputElement>(null); // We can rely on autoFocus prop
  // const formRef = useRef<HTMLFormElement>(null); // We don't necessarily need refs if we rely on state reset

  // Forms
  const [emailForm, emailFields] = useForm({
    id: "email-form",
    lastResult:
      actionData?.intent === FormIntent.UpdateEmail ? actionData.payload : null,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: changeEmailSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const [detailsForm, detailsFields] = useForm({
    id: "details-form",
    lastResult:
      actionData?.intent === FormIntent.UpdateDetails
        ? actionData.payload
        : null,
    defaultValue: {
      title: title ?? "",
      firstName,
      lastName,
      phoneNumber: phoneNumber ?? "",
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: detailsSchema });
    },
  });

  // Effects
  useEffect(() => {
    if (actionData?.intent === FormIntent.UpdateEmail && actionData.success) {
      closeChangeEmailModal();
    }
    if (actionData?.intent === FormIntent.UpdateDetails && actionData.success) {
      setIsEditing(false);
    }
  }, [actionData, closeChangeEmailModal]);

  // Derived
  const emailSavedResponse =
    actionData?.intent === FormIntent.UpdateEmail && actionData.success
      ? { newEmailAddress: actionData.newEmailAddress }
      : null;

  return (
    <>
      <Modal
        isOpen={showChangeEmailModal}
        close={() => closeChangeEmailModal()}
        // afterOpen={() => emailInputRef.current?.focus()} // removed for simplicity, rely on autoFocus
        size="small"
      >
        <Form method="post" {...getFormProps(emailForm)}>
          <Modal.Title>Change Email Address</Modal.Title>
          <Modal.Body>
            <div className="space-y-4 my-8 text-left">
              <p>
                We will send a verification email to your new email address.
              </p>
              <p>
                Your current email address: <strong>{emailAddress}</strong>
              </p>

              <div className="space-y-1">
                <input
                  type="hidden"
                  name="intent"
                  value={FormIntent.UpdateEmail}
                />
                <Input
                  {...getInputProps(emailFields.email, { type: "email" })}
                  autoFocus
                  label="New Email Address"
                  required
                  error={emailFields.email.errors?.join(", ")}
                />
                <Input
                  {...getInputProps(emailFields.password, { type: "password" })}
                  label="Password"
                  required
                  error={emailFields.password.errors?.join(", ")}
                />
              </div>
              {emailForm.errors && (
                <ErrorMessage
                  heading="We ran into a problem changing your E-Mail!"
                  message={emailForm.errors.join(", ")}
                />
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button type="reset" onClick={() => closeChangeEmailModal()}>
              Cancel
            </Button>
            <HighlightedButton
              type="submit"
              isSubmitting={state === "submitting"}
            >
              Save
            </HighlightedButton>
          </Modal.Footer>
        </Form>
      </Modal>

      <div className="space-y-10 p-4 mt-5 text-left font-sans">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <h3 className="text-sm text-karima-ink/60">E-mail</h3>
            {emailSavedResponse ? (
              <span>
                <span className="italic text-karima-ink">
                  {emailSavedResponse.newEmailAddress}
                </span>
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                  awaiting confirmation
                </span>
              </span>
            ) : (
              <span>{emailAddress}</span>
            )}
          </div>
          <div className="col-span-2">
            <HighlightedButton
              type="button"
              onClick={() => openChangeEmailModal()}
            >
              <PencilIcon className="w-4 h-4" /> Change Email
            </HighlightedButton>
          </div>
        </div>
        <div className="border-t border-karima-base pt-10">
          <Form method="post" {...getFormProps(detailsForm)}>
            <input
              type="hidden"
              name="intent"
              value={FormIntent.UpdateDetails}
            />
            <div className="gap-4 grid sm:grid-cols-2">
              {isEditing && (
                <div className="col-span-2">
                  <Input
                    {...getInputProps(detailsFields.title, { type: "text" })}
                    label="Title"
                    className="sm:w-1/4"
                    error={detailsFields.title.errors?.join(", ")}
                  />
                </div>
              )}
              {isEditing ? (
                <>
                  <div>
                    <Input
                      {...getInputProps(detailsFields.firstName, {
                        type: "text",
                      })}
                      label="First Name"
                      required
                      error={detailsFields.firstName.errors?.join(", ")}
                    />
                  </div>
                  <div>
                    <Input
                      {...getInputProps(detailsFields.lastName, {
                        type: "text",
                      })}
                      label="Last Name"
                      required
                      error={detailsFields.lastName.errors?.join(", ")}
                    />
                  </div>
                </>
              ) : (
                <div>
                  <h3 className="text-sm text-karima-ink/60">Full Name</h3>
                  {replaceEmptyString(fullName)}
                </div>
              )}

              <div>
                {isEditing ? (
                  <Input
                    {...getInputProps(detailsFields.phoneNumber, {
                      type: "tel",
                    })}
                    label="Phone Nr."
                    error={detailsFields.phoneNumber.errors?.join(", ")}
                  />
                ) : (
                  <div>
                    <h3 className="text-sm text-karima-ink/60">Phone Nr.</h3>
                    {replaceEmptyString(phoneNumber)}
                  </div>
                )}
              </div>
              <div className="col-span-2 mt-4 text-left">
                {isEditing ? (
                  <>
                    {detailsForm.errors && (
                      <ErrorMessage
                        heading="We ran into a problem updating your details!"
                        message={detailsForm.errors.join(", ")}
                      />
                    )}

                    <div className="flex gap-x-4">
                      <HighlightedButton
                        type="submit"
                        isSubmitting={state === "submitting"}
                      >
                        <CheckIcon className="w-4 h-4" /> Save
                      </HighlightedButton>

                      <Button type="reset" onClick={() => setIsEditing(false)}>
                        <XMarkIcon className="w-4 h-4" /> Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <HighlightedButton
                    type="button"
                    onClick={() => setIsEditing(true)}
                  >
                    <PencilIcon className="w-4 h-4" /> Edit
                  </HighlightedButton>
                )}
              </div>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
}
