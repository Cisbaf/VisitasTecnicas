import { internalErrorResponse, proxyBodyWithAuth } from "@/lib/apiProxy";

export async function POST(req: Request) {
    try {
        return await proxyBodyWithAuth(req, "/avaliacao/form/saveForm", "POST");
    } catch (err) {
        console.error("api/forms/saveForm POST proxy error:", err);
        return internalErrorResponse(err);
    }
}
