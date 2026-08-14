import { internalErrorResponse, proxyBodyWithAuth, proxyWithAuth } from "@/lib/apiProxy";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const baseId = url.searchParams.get("baseId");
        const path = baseId ? `/avaliacao/viaturas?baseId=${encodeURIComponent(baseId)}` : "/avaliacao/viaturas";

        return await proxyWithAuth(path, {
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/viatura GET proxy error:", err);
        return internalErrorResponse(err);
    }
}

export async function POST(req: Request) {
    try {
        return await proxyBodyWithAuth(req, "/avaliacao/viaturas", "POST");
    } catch (err) {
        console.error("api/avaliacao/viaturas POST proxy error:", err);
        return internalErrorResponse(err);
    }
}
