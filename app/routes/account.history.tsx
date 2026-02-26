import type { Route } from "./+types/account.history";
import {
  useLoaderData,
  useNavigation,
  useSubmit,
  data,
  redirect,
  Form,
} from "react-router";
import OrderHistoryItem from "~/components/account/OrderHistoryItem";
import { getActiveCustomerOrderList } from "~/providers/customer/customer";
import type { OrderListOptions } from "~/generated/graphql";
import { SortOrder } from "~/generated/graphql";
import { Pagination } from "~/components/Pagination";
import {
  translatePaginationFrom,
  translatePaginationTo,
  paginationValidationSchema,
} from "~/utils/pagination";

const paginationLimitMinimumDefault = 10;
const allowedPaginationLimits = new Set<number>([
  paginationLimitMinimumDefault,
  20,
  30,
]);
const orderPaginationSchema = paginationValidationSchema(
  allowedPaginationLimits,
);

export async function loader({ request, context }: Route.LoaderArgs) {
  const apiUrl =
    (context?.cloudflare?.env as any)?.VENDURE_API_URL ||
    process.env.VENDURE_API_URL ||
    "http://localhost:3000/shop-api";
  const url = new URL(request.url);
  const limit = parseInt(
    url.searchParams.get("limit") ?? paginationLimitMinimumDefault.toString(),
  );
  const page = parseInt(url.searchParams.get("page") ?? "1");

  const zodResult = orderPaginationSchema.safeParse({ limit, page });
  if (!zodResult.success) {
    url.search = "";
    return redirect(url.href);
  }

  const orderListOptions: OrderListOptions = {
    take: zodResult.data.limit,
    skip: (zodResult.data.page - 1) * zodResult.data.limit,
    sort: { createdAt: SortOrder.Desc },
    filter: { active: { eq: false } },
  };

  const res = await getActiveCustomerOrderList(orderListOptions, {
    request,
    apiUrl,
  });
  if (!res?.activeCustomer) {
    return redirect("/sign-in");
  }
  return {
    orderList: res.activeCustomer.orders,
    appliedPaginationLimit: zodResult.data.limit,
    appliedPaginationPage: zodResult.data.page,
  };
}

export default function AccountHistory() {
  const { orderList, appliedPaginationLimit, appliedPaginationPage } =
    useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const showingOrdersFrom = translatePaginationFrom(
    appliedPaginationPage,
    appliedPaginationLimit,
  );
  const showingOrdersTo = translatePaginationTo(
    appliedPaginationPage,
    appliedPaginationLimit,
    orderList.items.length,
  );

  return (
    <div className="pt-10 relative text-left">
      {navigation.state !== "idle" && (
        <div className="absolute top-0 left-0 w-full h-full z-10 bg-white bg-opacity-75"></div>
      )}

      {orderList.items.length === 0 && (
        <div className="py-16 text-3xl text-center italic text-karima-ink/40 select-none flex justify-center items-center">
          {orderList.totalItems === 0
            ? "Your future orders will appear here"
            : "No more orders, end reached"}
        </div>
      )}

      {orderList?.items.map((item: any) => (
        <OrderHistoryItem order={item} key={item.id} />
      ))}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 font-sans">
        <span className="self-start text-karima-ink/60 text-sm ml-4 lg:ml-6">
          Showing orders {showingOrdersFrom} to {showingOrdersTo} of{" "}
          {orderList.totalItems}
        </span>

        <Form
          method="get"
          onChange={(e: React.FormEvent<HTMLFormElement>) => {
            submit(e.currentTarget, { preventScrollReset: true });
          }}
          preventScrollReset
        >
          <Pagination
            appliedPaginationLimit={appliedPaginationLimit}
            allowedPaginationLimits={allowedPaginationLimits}
            totalItems={orderList.totalItems}
            appliedPaginationPage={appliedPaginationPage}
          />
        </Form>
      </div>
    </div>
  );
}
