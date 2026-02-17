import type { Route } from "./+types/account.addresses.new";
import {
    useActionData,
    useLoaderData,
    useNavigate,
    useNavigation,
    useSubmit,
    data,
    Form
} from "react-router";
import { useRef, useEffect } from 'react';
import { Button } from '~/components/Button';
import Modal from '~/components/modal/Modal';
import { HighlightedButton } from '~/components/HighlightedButton';
import useToggleState from '~/utils/use-toggle-state';
import CustomerAddressForm, {
    addressSchema,
} from '~/components/account/CustomerAddressForm';
import { createCustomerAddress } from '~/providers/account/account';
import { getAvailableCountries } from '~/providers/checkout/checkout';

import { useForm, getFormProps } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { z } from 'zod';

export async function loader({ request, context }: Route.LoaderArgs) {
    const apiUrl = (context?.cloudflare?.env as any)?.VENDURE_API_URL || process.env.VENDURE_API_URL || 'http://localhost:3000/shop-api';
    const { availableCountries } = (await getAvailableCountries({ request, apiUrl })) as any;
    return { availableCountries };
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema: addressSchema });

    if (submission.status !== 'success') {
        return data(submission.reply(), { status: 400 });
    }

    const { city, company, countryCode, fullName, phone, postalCode, province, streetLine1, streetLine2 } = submission.value;

    try {
        await createCustomerAddress(
            {
                city,
                company,
                countryCode,
                fullName,
                phoneNumber: phone,
                postalCode,
                province,
                streetLine1,
                streetLine2,
            },
            { request },
        );

        return data(submission.reply({ resetForm: true }), {
            status: 200,
            headers: {
                // Add any necessary headers or handle redirect if needed, 
                // but existing code returned just data({ saved: true }).
            }
        });
        // The original returned data({ saved: true }). 
        // I can append that to the submission reply?
        // submission.reply() returns SubmissionResult. 
        // useActionData<typeof action>() will receive SubmissionResult.
        // The component checks for 'saved' property.
        // I might need to return a custom object combined with submission?
        // OR just return data({ saved: true }) if successful.
        // If I return data({ saved: true }), then lastResult in useForm will be { saved: true }, which is NOT a SubmissionResult.
        // Conform handles this gracefully?
        // If I want to verify success in component, I can check submission.status BUT if I return { saved: true }, it's not a submission.
        // I should return { ...submission.reply(), saved: true }?
    } catch (e) {
        return data(submission.reply({ formErrors: ["Failed to save address"] }), { status: 500 });
    }
}

// I need to adapt the return type for useForm and the component logic.
// The component checks: if (actionData && ... && actionData.saved) close();
// So I should return { ...submission.reply(), saved: true }.
// BUT submission.reply() return type is strict.
// I can cast it or just return an object.
// Let's modify the action to return a composite object if successful.
// AND useForm expects lastResult to be SubmissionResult.
// If I return { ...submission, saved: true }, it satisfies SubmissionResult (mostly, extra props ignored).

export default function NewAddress() {
    const { availableCountries } = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const actionData = useActionData<any>(); // Use any to accept updated return type
    const navigate = useNavigate();
    const { state, close } = useToggleState(true);

    const formRef = useRef<HTMLFormElement>(null);
    const submit = useSubmit();

    const [form, fields] = useForm({
        id: 'new-address-form',
        lastResult: actionData, // if actionData has saved: true, it might not be a valid submission result but it's ok if status is success?
        onValidate({ formData }) {
            return parseWithZod(formData, { schema: addressSchema });
        },
        shouldValidate: 'onBlur',
        shouldRevalidate: 'onInput',
    });

    useEffect(() => {
        if (actionData?.status === 'success') {
            close();
        }
    }, [actionData, close]);

    const submitForm = () => {
        if (formRef.current) {
            submit(formRef.current);
        }
    };

    const afterClose = () => {
        navigate(-1);
    };

    return (
        <div>
            <Modal isOpen={state} close={close} afterClose={afterClose}>
                <Modal.Title>New address</Modal.Title>
                <Modal.Body>
                    {/* We need a Form here. The previous code used ValidatedForm which rendered a form. */}
                    {/* The parent uses useSubmit on formRef. So we need a standard Form or fetcher.Form */}
                    {/* Since useActionData is used, we use <Form> */}
                    {/* Wait, imports: import { Form } from 'react-router'? No, not imported. I should import it. */}
                    {/* Imports has 'useActionData', etc. but not 'Form'. I'll add it. */}
                    <form method="post" {...getFormProps(form)} ref={formRef}>
                        <CustomerAddressForm
                            availableCountries={availableCountries}
                            fields={fields}
                        />
                        {/* Hidden submit button to allow implicit submission if needed, but submitForm uses explicit submit */}
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button type="button" onClick={close}>
                        Cancel
                    </Button>
                    <HighlightedButton
                        isSubmitting={navigation.state === 'submitting'}
                        type="submit"
                        onClick={submitForm}
                    >
                        Save
                    </HighlightedButton>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
