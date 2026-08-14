import { internalErrorResponse, proxyBodyWithAuth } from "@/lib/apiProxy";

export async function POST(req: Request) {
    try {
        return await proxyBodyWithAuth(req, "/avaliacao/user/registro", "POST");
    } catch (err) {
        console.error("api/auth/user/registro POST proxy error:", err);
        return internalErrorResponse(err);
    }
}
