import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { Header } from "./components/header/Header";
import Footer from "./components/footer/Footer";
import { FeaturesBar } from "./components/FeaturesBar";
import { CartTray } from "./components/cart/CartTray";
import { useActiveOrder } from "./utils/use-active-order";
import { getCollections } from "./providers/collections/collections";
import { activeChannel } from "./providers/channel/channel";
import { getActiveCustomer } from "./providers/customer/customer";
import { setApiUrl, DEMO_API_URL, APP_META_TITLE, APP_META_TAGLINE, APP_META_DESCRIPTION } from "./constants";
import { getSiteSettings } from "./providers/site/site-settings";
import UnderConstruction from "./routes/under-construction";

export const meta: MetaFunction = () => {
  return [
    { title: `${APP_META_TITLE} | ${APP_META_TAGLINE}` },
    { name: "description", content: APP_META_DESCRIPTION },
  ];
};
import "./app.css";
export const links = () => [
  { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
  { rel: "apple-touch-icon", sizes: "180x180", href: "/images/favicon/apple-touch-icon.png" },
  { rel: "icon", type: "image/png", sizes: "32x32", href: "/images/favicon/favicon-32x32.png" },
  { rel: "icon", type: "image/png", sizes: "16x16", href: "/images/favicon/favicon-16x16.png" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600&family=Marcellus&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap",
  },
];
export async function loader({ request, context }: LoaderFunctionArgs) {
  const kv = context.cloudflare?.env?.KV_CACHE;
  const options = { request, kv };

  // @ts-ignore - Cloudflare env is in context
  const envVars = context.cloudflare?.env || process.env;
  const apiUrl = envVars.VENDURE_API_URL || DEMO_API_URL;

  setApiUrl(apiUrl);

  // siteSettings must NOT go through KV cache so the under construction
  // toggle takes effect immediately on every request.
  const siteSettingsOptions = { request, apiUrl }; // intentionally no `kv`

  const [collections, activeCustomer, channel, siteSettings] = await Promise.all([
    getCollections({ take: 20 }, options).catch((e) => {
      console.error('[root loader] getCollections error:', e?.message);
      return null;
    }),
    getActiveCustomer(options).catch((e) => {
      console.error('[root loader] getActiveCustomer error:', e?.message);
      return null;
    }),
    activeChannel(options).catch((e) => {
      console.error('[root loader] activeChannel error:', e?.message);
      return null;
    }),
    getSiteSettings(siteSettingsOptions).catch((e) => {
      console.error('[root loader] getSiteSettings error:', e?.message);
      return { underConstruction: false };
    }),
  ]);

  const topLevelCollections = (Array.isArray(collections) ? collections : []).filter(
    (collection: any) => collection.parent?.name === "__root_collection__"
  );

  const underConstruction = siteSettings?.underConstruction ?? false;
  const countdownDate = siteSettings?.countdownDate ?? null;

  return {
    activeCustomer,
    activeChannel: channel,
    collections: topLevelCollections,
    underConstruction,
    countdownDate,
    env: {
      VENDURE_API_URL: apiUrl,
    },
  };
}

export function Layout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en" dir="ltr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isCheckout = location.pathname.startsWith("/checkout");

  const loaderData = useLoaderData<typeof loader>();
  const { collections, env, underConstruction, countdownDate } = loaderData;

  const {
    activeOrderFetcher,
    activeOrder,
    adjustOrderLine,
    removeItem,
    refresh,
    applyCoupon,
    removeCoupon,
  } = useActiveOrder();

  useEffect(() => {
    if (env?.VENDURE_API_URL) {
      setApiUrl(env.VENDURE_API_URL);
    }
  }, [loaderData]);

  // If under construction mode is enabled, show the under construction page
  // for ALL routes so no real content leaks through.
  if (underConstruction) {
    return <UnderConstruction />;
  }

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.ENV = ${JSON.stringify(env)};`,
        }}
      />
      {!isCheckout && (
        <Header
          onCartIconClick={() => setOpen(!open)}
          cartQuantity={activeOrder?.totalQuantity ?? 0}
        />
      )}
      <main>
        <Outlet context={{ activeOrderFetcher, activeOrder, adjustOrderLine, removeItem, applyCoupon, removeCoupon }} />
      </main>
      <CartTray
        open={open}
        onClose={setOpen}
        activeOrder={activeOrder}
        adjustOrderLine={adjustOrderLine}
        removeItem={removeItem}
      />
      {!isCheckout && <FeaturesBar />}
      {!isCheckout && <Footer />}
    </>
  );
}

export function ErrorBoundary({ error }: any) {
  console.error('[root ErrorBoundary] caught error:', error);
  console.error('[root ErrorBoundary] error type:', typeof error, error?.constructor?.name);
  console.error('[root ErrorBoundary] isRouteErrorResponse:', isRouteErrorResponse(error));
  console.error('[root ErrorBoundary] error.message:', error?.message);
  console.error('[root ErrorBoundary] error.stack:', error?.stack);

  // NetworkError from aborted fetcher during navigation — ignore and let the new page load
  const isNetworkError = error?.message?.includes('NetworkError') ||
    error?.message?.includes('Failed to fetch') ||
    error?.message?.includes('network') ||
    error?.message?.includes('Load failed') ||
    error?.name === 'TypeError';

  if (isNetworkError && !isRouteErrorResponse(error)) {
    console.warn('[root ErrorBoundary] Suppressing NetworkError (likely aborted fetch during navigation)');
    return null;
  }

  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
