import { internalErrorResponse, proxyBodyWithAuth } from "@/lib/apiProxy";

export async function POST(req: Request) {
    try {
        return await proxyBodyWithAuth(req, "/avaliacao/field/saveField", "POST");
    } catch (err) {
        console.error("api/forms/saveField POST proxy error:", err);
        return internalErrorResponse(err);
    }
}
