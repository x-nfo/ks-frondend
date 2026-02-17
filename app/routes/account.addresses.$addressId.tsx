import type { Route } from "./+types/account.addresses.$addressId";
import {
    useActionData,
    useNavigate,
    useSubmit,
    useNavigation,
    redirect,
    useLoaderData,
    data,
    Form
} from "react-router";
import { Outlet } from "react-router";
import { useRef, useEffect } from 'react';
import { Button } from '~/components/Button';
import Modal from '~/components/modal/Modal';
import { HighlightedButton } from '~/components/HighlightedButton';
import type { Address, AvailableCountriesQuery } from '~/generated/graphql';
import { ErrorCode } from '~/generated/graphql';
import useToggleState from '~/utils/use-toggle-state';
import CustomerAddressForm, {
    addressSchema,
} from '~/components/account/CustomerAddressForm';
import { updateCustomerAddress } from '~/providers/account/account';
import { getAvailableCountries } from '~/providers/checkout/checkout';
import { getActiveCustomerAddresses } from '~/providers/customer/customer';

import { useForm, getFormProps } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { z } from 'zod';

export async function loader({ request, params, context }: Route.LoaderArgs) {
    const apiUrl = (context?.cloudflare?.env as any)?.VENDURE_API_URL || process.env.VENDURE_API_URL || 'http://localhost:3000/shop-api';
    const { activeCustomer } = (await getActiveCustomerAddresses({ request, apiUrl })) as any;
    const address = activeCustomer?.addresses?.find(
        (address: any) => address.id === params.addressId,
    );

    if (!address) {
        return redirect('/account/addresses');
    }

    const { availableCountries } = await getAvailableCountries({ request });

    return { address, availableCountries };
}

export async function action({ request, params }: Route.ActionArgs) {
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema: addressSchema });

    if (submission.status !== 'success') {
        return data(submission.reply(), { status: 400 });
    }

    const { city, company, countryCode, fullName, phone, postalCode, province, streetLine1, streetLine2 } = submission.value;

    try {
        await updateCustomerAddress(
            {
                id: params.addressId!,
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
            status: 200, // or standard redirect? Original code returned data({ saved: true }).
        });
        // We'll mimic expected behavior

    } catch (error) {
        // Log error?
        return data(submission.reply({ formErrors: ["Failed to update address"] }), { status: 500 });
    }
}

export default function EditAddress() {
    const { address, availableCountries } = useLoaderData<typeof loader>();
    const actionData = useActionData<any>();
    const navigation = useNavigation();
    const navigate = useNavigate();
    const { state, close } = useToggleState(true);
    const formRef = useRef<HTMLFormElement>(null);

    const submit = useSubmit();

    const [form, fields] = useForm({
        id: 'edit-address-form',
        lastResult: actionData,
        defaultValue: {
            fullName: address?.fullName,
            city: address?.city,
            streetLine1: address?.streetLine1,
            streetLine2: address?.streetLine2,
            countryCode: address?.country?.code,
            postalCode: address?.postalCode,
            phone: address?.phoneNumber,
            company: address?.company,
            province: address?.province,
        },
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
                <Modal.Title>Edit address</Modal.Title>
                <Modal.Body>
                    <Form method="post" {...getFormProps(form)} ref={formRef}>
                        <CustomerAddressForm
                            availableCountries={availableCountries}
                            fields={fields}
                        />
                    </Form>
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
