import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  data,
  redirect,
} from "react-router"; // React Router 7
import {
  addToWishlist,
  removeFromWishlist,
  getActiveCustomerWishlist,
} from "../../providers/wishlist/wishlist";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action");
  const productVariantId = formData.get("productVariantId") as string;
  const itemId = formData.get("itemId") as string;
  const referer = request.headers.get("Referer") || "/";

  // Check if this is a fetcher request (JavaScript enabled)
  // Using explicit flag from client instead of unreliable header sniffing
  const isFetchRequest = formData.get("_fetcher") === "true";

  try {
    if (action === "add" && productVariantId) {
      const result = await addToWishlist(productVariantId, { request });
      if (isFetchRequest) {
        return data(
          { success: true, item: result.addToWishlist },
          { headers: (result as any)._headers },
        );
      }
      return redirect(referer, { headers: (result as any)._headers });
    } else if (action === "remove") {
      let finalHeaders = new Headers();

      // If we have an itemId, we can remove it directly without fetching the wishlist first
      if (itemId) {
        const removeResult = await removeFromWishlist(itemId, { request });
        if ((removeResult as any)._headers) {
          (removeResult as any)._headers.forEach((v: string, k: string) =>
            finalHeaders.set(k, v),
          );
        }
      } else if (productVariantId) {
        // Background fetch required only if itemId is not provided
        const wishlist = await getActiveCustomerWishlist({ request });
        const item = wishlist.activeCustomerWishlist.find(
          (i: any) => i.productVariant.id === productVariantId,
        );
        if (wishlist._headers) {
          wishlist._headers.forEach((v: string, k: string) =>
            finalHeaders.set(k, v),
          );
        }
        if (item) {
          const removeResult = await removeFromWishlist((item as any).id, {
            request,
          });
          if ((removeResult as any)._headers) {
            (removeResult as any)._headers.forEach((v: string, k: string) =>
              finalHeaders.set(k, v),
            );
          }
        }
      }

      if (isFetchRequest) {
        return data({ success: true }, { headers: finalHeaders });
      }
      return redirect(referer, { headers: finalHeaders });
    }
  } catch (error: any) {
    console.error("Wishlist API Error (Full):", error);

    let errorMessage = "Failed to update wishlist";
    let isAuthError = false;

    try {
      // Check if error message is a JSON string (from graphqlWrapper)
      const parsedError = JSON.parse(error.message);
      errorMessage = parsedError.message || errorMessage;
      if (
        parsedError.extensions?.code === "FORBIDDEN" ||
        errorMessage.toLowerCase().includes("forbidden") ||
        errorMessage.toLowerCase().includes("authorized")
      ) {
        isAuthError = true;
      }
    } catch (e) {
      // Fallback to string matching if not JSON
      errorMessage = error?.message || errorMessage;
      isAuthError =
        errorMessage.toLowerCase().includes("forbidden") ||
        errorMessage.toLowerCase().includes("authorized");
    }

    if (!isFetchRequest) {
      if (isAuthError) {
        const redirectTo = encodeURIComponent(referer);
        return redirect(`/sign-in?redirectTo=${redirectTo}`);
      }
      return redirect(referer);
    }

    return data(
      {
        success: false,
        error: isAuthError ? "auth_required" : errorMessage,
        rawError: error?.message, // Always include for now to help the user debug
        redirectTo: isAuthError ? referer : undefined,
      },
      { status: isAuthError ? 401 : 500 },
    );
  }

  if (!isFetchRequest) {
    return redirect(referer);
  }
  return data({ success: false, error: "Invalid action" }, { status: 400 });
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const wishlist = await getActiveCustomerWishlist({ request });
    return data({
      items: wishlist.activeCustomerWishlist,
      totalItems: wishlist.activeCustomerWishlist.length,
      variantIds: wishlist.activeCustomerWishlist.map(
        (i: any) => i.productVariant.id,
      ),
    });
  } catch (error) {
    return data({ items: [], totalItems: 0, variantIds: [] });
  }
}
