import { useLoaderData, data, redirect } from "react-router";

import { useState } from "react";
import { getActiveCustomerWishlist } from "~/providers/wishlist/wishlist";
import { WishlistItem } from "~/components/wishlist/WishlistItem";

// Define the loader type since the build might not have generated +types yet
interface LoaderArgs {
  request: Request;
}

export async function loader({ request }: LoaderArgs) {
  try {
    const res = await getActiveCustomerWishlist({ request });
    if (!res) {
      return redirect("/sign-in");
    }
    return data(
      {
        wishlist: res.activeCustomerWishlist,
      },
      { headers: (res as any)._headers },
    );
  } catch (error) {
    console.error("Failed to load wishlist:", error);
    return redirect("/sign-in");
  }
}

export default function AccountWishlist() {
  const { wishlist: initialWishlist } = useLoaderData<typeof loader>();
  const [wishlist, setWishlist] = useState(initialWishlist);

  const handleRemoved = (itemId: string) => {
    setWishlist((prev: any[]) =>
      prev.filter((item: any) => item.id !== itemId),
    );
  };

  return (
    <div className="pt-10 relative text-left">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold font-serif text-karima-brand mb-6">
          My Wishlist
        </h1>

        {wishlist.length === 0 ? (
          <div className="py-20 text-center bg-karima-base/20 rounded-2xl border-2 border-dashed border-karima-base">
            <div className="text-5xl mb-4 text-karima-brand/40">❤️</div>
            <h3 className="text-xl font-medium text-karima-ink">
              Your wishlist is empty
            </h3>
            <p className="mt-2 text-karima-ink/60 max-w-sm mx-auto">
              Browse products and click the heart icon to add items to your
              wishlist.
            </p>
            <div className="mt-8">
              <a
                href="/"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-none shadow-sm text-white bg-karima-brand hover:bg-karima-accent transition-colors"
              >
                Browse all categories
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {wishlist.map((item: any) => (
              <WishlistItem
                key={item.id}
                item={item}
                onRemoved={handleRemoved}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
