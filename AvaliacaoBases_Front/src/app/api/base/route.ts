import { internalErrorResponse, proxyBodyWithAuth, proxyWithAuth } from "@/lib/apiProxy";

export async function GET() {
    try {
        return await proxyWithAuth("/avaliacao/bases", {
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/avaliacao/bases GET proxy error:", err);
        return internalErrorResponse(err);
    }
}
export async function POST(req: Request) {
    try {
        return await proxyBodyWithAuth(req, "/avaliacao/bases", "POST");
    } catch (err) {
        console.error("api/base POST proxy error:", err);
        return internalErrorResponse(err);
    }
}
