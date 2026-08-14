import { internalErrorResponse, proxyStreamWithAuth, proxyWithAuth } from "@/lib/apiProxy";

export async function GET(req: Request) {
    try {
        return await proxyWithAuth("/avaliacao/midias", {
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/arquivo GET proxy error:", err);
        return internalErrorResponse(err);
    }
}

export async function POST(req: Request) {
    try {
        return await proxyStreamWithAuth(req, "/avaliacao/midias", "POST");
    } catch (err) {
        console.error("api/arquivo POST proxy error:", err);
        return internalErrorResponse(err);
    }
}
