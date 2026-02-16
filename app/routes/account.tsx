import type { Route } from "./+types/account";
import {
    HashtagIcon,
    HeartIcon,
    MapPinIcon,
    ShoppingBagIcon,
    UserCircleIcon,
} from '@heroicons/react/24/solid';
import { Form, Outlet, useLoaderData, redirect } from "react-router";
import type { TabProps } from '~/components/tabs/Tab';
import { TabsContainer } from '~/components/tabs/TabsContainer';
import { getActiveCustomerDetails } from '~/providers/customer/customer';


export async function loader({ request }: Route.LoaderArgs) {
    const customerData = await getActiveCustomerDetails({ request });
    if (!customerData?.activeCustomer) {
        return redirect('/sign-in');
    }
    return { activeCustomer: customerData.activeCustomer };
}

export default function AccountDashboard() {
    const { activeCustomer } = useLoaderData<typeof loader>();
    const { firstName, lastName } = activeCustomer!;

    const tabs: TabProps[] = [
        {
            Icon: UserCircleIcon,
            text: "Account Details",
            to: './',
        },
        {
            Icon: ShoppingBagIcon,
            text: "Purchase History",
            to: './history',
        },
        {
            Icon: HeartIcon,
            text: "Wishlist",
            to: './wishlist',
        },
        {
            Icon: MapPinIcon,
            text: "Addresses",
            to: './addresses',
        },
        {
            Icon: HashtagIcon,
            text: "Password",
            to: './password',
        },
    ];

    return (
        <div className="pt-32 max-w-6xl xl:mx-auto px-4">
            <h2 className="text-3xl sm:text-5xl font-serif text-karima-brand my-8">
                My Account
            </h2>
            <p className="text-karima-ink text-lg -mt-4 mb-4 font-light">
                Welcome back, {firstName} {lastName}
            </p>
            <Form method="post" action="/api/logout">
                <button
                    type="submit"
                    className="underline text-karima-accent hover:text-karima-brand transition-colors duration-300 font-light"
                >
                    Sign out
                </button>
            </Form>
            <TabsContainer tabs={tabs}>
                <Outlet />
            </TabsContainer>
        </div>
    );
}
