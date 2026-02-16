import { redirect, type ActionFunctionArgs } from "react-router";
import { logout } from "../../providers/account/account";

export async function action({ request }: ActionFunctionArgs) {
    const result = await logout({}, { request });
    return redirect("/", {
        headers: result._headers,
    });
}
