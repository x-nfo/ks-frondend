import { Outlet, useOutletContext } from "react-router";

export default function CheckoutLayout() {
  const context = useOutletContext();
  return <Outlet context={context} />;
}
