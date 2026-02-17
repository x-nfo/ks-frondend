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
} from "react-router";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { Header } from "./components/header/Header";
import Footer from "./components/footer/Footer";
import { FeaturesBar } from "./components/FeaturesBar";
import { CartTray } from "./components/cart/CartTray";
import { useActiveOrder } from "./utils/use-active-order";
import { getCollections } from "./providers/collections/collections"; // Assuming this is ported or referenced correctly
import { activeChannel } from "./providers/channel/channel";
import { getActiveCustomer } from "./providers/customer/customer";
import { setApiUrl, DEMO_API_URL } from "./constants";
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
  // @ts-ignore - Cloudflare env is in context
  const envVars = context.cloudflare?.env || process.env;
  const apiUrl = envVars.VENDURE_API_URL || DEMO_API_URL;

  setApiUrl(apiUrl);

  const collections = await getCollections(request, { take: 20 });
  const topLevelCollections = collections?.filter(
    (collection: any) => collection.parent?.name === "__root_collection__"
  ) || [];
  const activeCustomer = await getActiveCustomer({ request });
  const channel = await activeChannel({ request });

  return {
    activeCustomer,
    activeChannel: channel,
    collections: topLevelCollections,
    env: {
      VENDURE_API_URL: apiUrl,
    },
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    }, observerOptions);

    const observeElements = () => {
      const elements = document.querySelectorAll(".reveal-on-scroll");
      elements.forEach((el) => observer.observe(el));
    };

    observeElements();

    // Re-observe when DOM changes (for client-side navigation)
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

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
  const { collections, env } = loaderData;

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
    refresh();
  }, [loaderData]);

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
