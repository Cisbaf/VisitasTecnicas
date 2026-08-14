import { internalErrorResponse, proxyBodyWithAuth, proxyWithAuth } from "@/lib/apiProxy";

export async function GET() {
    try {
        return await proxyWithAuth("/avaliacao/form", {
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/forms GET proxy error:", err);
        return internalErrorResponse(err);
    }
}

export async function POST(req: Request) {
    try {
        return await proxyBodyWithAuth(req, "/avaliacao/form/saveForm", "POST");
    } catch (err) {
        console.error("api/forms POST proxy error:", err);
        return internalErrorResponse(err);
    }
}
