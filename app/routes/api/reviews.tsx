import type { ActionFunctionArgs } from "react-router"; // React Router 7
import { data } from "react-router";
import { submitReview } from "../../providers/reviews/reviews";

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const productId = formData.get("productId") as string;
    const rating = parseInt(formData.get("rating") as string, 10);
    const summary = formData.get("summary") as string;
    const body = formData.get("body") as string;

    const cookie = request.headers.get("Cookie");

    if (!productId || !rating || !summary || !body) {
        return data({ success: false, error: "All fields are required" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
        return data({ success: false, error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    try {
        const result = await submitReview(
            { productId, rating, summary, body },
            { request }
        );
        console.log("Review submitted successfully:", result);
        // ExecutionResult has structure: { submitReview: {...}, _headers: Headers }
        return data({ success: true, review: result.submitReview }, { headers: result._headers });
    } catch (error: any) {
        console.error("Failed to submit review:", error);

        let message = "";
        let errorCode = "";

        try {
            const parsed = JSON.parse(error?.message || "{}");
            message = parsed.message || error?.message || "Failed to submit review. Please try again.";
            errorCode = parsed.extensions?.code || "";
        } catch {
            message = error?.message || "Failed to submit review. Please try again.";
        }

        const isAuthError =
            errorCode === "FORBIDDEN" ||
            message.includes("authorized") ||
            message.includes("Forbidden") ||
            message.includes("Unauthorized");

        if (isAuthError) {
            return data({ success: false, error: "auth_required" }, { status: 401 });
        }
        return data({ success: false, error: message }, { status: 500 });
    }
}
