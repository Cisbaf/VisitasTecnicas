import { internalErrorResponse, proxyWithAuth } from "@/lib/apiProxy";

export async function GET(req: Request) {
    try {
        return await proxyWithAuth("/avaliacao/user", {
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/auth/user GET proxy error:", err);
        return internalErrorResponse(err);
    }
}
