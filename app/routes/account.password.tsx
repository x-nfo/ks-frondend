import type { Route } from "./+types/account.password";
import { PencilIcon } from "@heroicons/react/24/outline";
import { useActionData, useNavigation, data, Form } from "react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "~/components/Button";
import { ErrorMessage } from "~/components/ErrorMessage";
import { HighlightedButton } from "~/components/HighlightedButton";
import { Input } from "~/components/Input";
import { SuccessMessage } from "~/components/SuccessMessage";
import { updateCustomerPassword } from "~/providers/account/account";

import { useForm, getFormProps, getInputProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Password is required" }),
    newPassword: z.string().min(1, { message: "Password is required" }),
    confirmPassword: z.string().min(1, { message: "Password is required" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: passwordSchema });

  if (submission.status !== "success") {
    return data(submission.reply(), { status: 400 });
  }

  const { currentPassword, newPassword } = submission.value;

  const res = await updateCustomerPassword(
    { currentPassword, newPassword },
    { request },
  );

  if (res.__typename !== "Success") {
    return data(submission.reply({ formErrors: [res.message] }), {
      status: 401,
    });
  }

  return data(submission.reply({ resetForm: true }), { status: 200 });
}

export default function AccountPassword() {
  const [editing, setEditing] = useState(false);
  const actionData = useActionData<typeof action>(); // Expect SubmissionResult
  const navigation = useNavigation();
  const state = navigation.state;

  const [form, fields] = useForm({
    id: "password-form",
    lastResult: actionData,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: passwordSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const isSaved = actionData?.status === "success";

  return (
    <Form method="post" {...getFormProps(form)}>
      <div className="p-4 space-y-4 text-left font-sans">
        {editing && (
          <>
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
              <div>
                <Input
                  {...getInputProps(fields.currentPassword, {
                    type: "password",
                  })}
                  required
                  label="Current Password"
                  error={fields.currentPassword.errors?.join(", ")}
                />
              </div>
            </div>
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
              <div>
                <Input
                  {...getInputProps(fields.newPassword, { type: "password" })}
                  required
                  label="New Password"
                  error={fields.newPassword.errors?.join(", ")}
                />
              </div>
              <div>
                <Input
                  {...getInputProps(fields.confirmPassword, {
                    type: "password",
                  })}
                  required
                  label="Confirm Password"
                  error={fields.confirmPassword.errors?.join(", ")}
                />
              </div>
            </div>
          </>
        )}
        {isSaved && !editing && (
          <SuccessMessage
            heading="Success!"
            message="Your password has been updated."
          />
        )}
        {form.errors && (
          <ErrorMessage
            heading="Your password has been updated."
            message={form.errors.join(", ")}
          />
        )}
        <div className="mt-4">
          {editing ? (
            <div className="flex gap-3">
              <HighlightedButton
                type="submit"
                isSubmitting={state === "submitting"}
              >
                Save Password
              </HighlightedButton>
              <Button type="reset" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <HighlightedButton type="button" onClick={() => setEditing(true)}>
                <PencilIcon className="w-4 h-4" /> Change Password
              </HighlightedButton>
            </>
          )}
        </div>
      </div>
    </Form>
  );
}
