import type { Route } from "./+types/account.addresses";
import { Outlet, useLoaderData, data } from "react-router";
import AddAddressCard from "~/components/account/AddAddressCard";
import EditAddressCard from "~/components/account/EditAddressCard";
import type { Address } from "~/generated/graphql";
import { ErrorCode } from "~/generated/graphql";
import {
  deleteCustomerAddress,
  updateCustomerAddress,
} from "~/providers/account/account";
import { getActiveCustomerAddresses } from "~/providers/customer/customer";

export async function loader({ request, context }: Route.LoaderArgs) {
  const apiUrl =
    (context?.cloudflare?.env as any)?.VENDURE_API_URL ||
    process.env.VENDURE_API_URL ||
    "http://localhost:3000/shop-api";
  const res = await getActiveCustomerAddresses({ request, apiUrl });
  if (!res?.activeCustomer) {
    return { activeCustomerAddresses: { addresses: [] } };
  }
  const activeCustomerAddresses = res.activeCustomer;
  return { activeCustomerAddresses };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const id = formData.get("id") as string | null;
  const _action = formData.get("_action");

  if (!id || id.length === 0) {
    return data(
      {
        errorCode: ErrorCode.IdentifierChangeTokenInvalidError,
        message: "Invalid Address ID",
      },
      { status: 400 },
    );
  }

  if (_action === "setDefaultShipping") {
    await updateCustomerAddress(
      { id, defaultShippingAddress: true },
      { request },
    );
    return null;
  }

  if (_action === "setDefaultBilling") {
    await updateCustomerAddress(
      { id, defaultBillingAddress: true },
      { request },
    );
    return null;
  }

  if (_action === "deleteAddress") {
    const { success } = await deleteCustomerAddress(id, { request });
    return data(null, { status: success ? 200 : 400 });
  }

  return data(
    {
      message: "An unknown error occurred",
      errorCode: ErrorCode.UnknownError,
    },
    { status: 400 },
  );
}

export default function AccountAddresses() {
  const { activeCustomerAddresses } = useLoaderData<typeof loader>();

  return (
    <>
      <Outlet />
      <div className="w-full text-left font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 mt-4 font-sans">
          <AddAddressCard />
          {activeCustomerAddresses?.addresses!.map((address) => {
            return (
              <EditAddressCard address={address as Address} key={address.id} />
            );
          })}
        </div>
      </div>
    </>
  );
}
