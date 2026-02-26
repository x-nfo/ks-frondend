import { PlusIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router";

export default function AddAddressCard() {
  return (
    <>
      <Link
        preventScrollReset
        className="border border-karima-base hover:border-karima-brand/50 transition-colors p-5 min-h-[220px] h-full w-full flex flex-col justify-between text-karima-ink"
        to="/account/addresses/new"
      >
        <span className="text-base-semi">Add New Address</span>
        <PlusIcon className="w-6 h-6 text-karima-brand"></PlusIcon>
      </Link>
    </>
  );
}
