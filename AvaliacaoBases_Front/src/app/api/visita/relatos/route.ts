import { internalErrorResponse, proxyBodyWithAuth, proxyWithAuth } from "@/lib/apiProxy";

export async function GET() {
    try {
        return await proxyWithAuth("/avaliacao/relatos", {
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/avaliacao/relatos GET proxy error:", err);
        return internalErrorResponse(err);
    }
}

export async function POST(req: Request) {
    try {
        return await proxyBodyWithAuth(req, "/avaliacao/relatos", "POST");
    } catch (err) {
        console.error("api/avaliacao/relatos POST proxy error:", err);
        return internalErrorResponse(err);
    }
}
