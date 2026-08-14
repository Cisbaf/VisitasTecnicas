import { internalErrorResponse, proxyBodyWithAuth, proxyWithAuth } from "@/lib/apiProxy";

export async function GET() {
    try {
        return await proxyWithAuth("/avaliacao/visitas", {
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/visita GET proxy error:", err);
        return internalErrorResponse(err);
    }
}

export async function POST(req: Request) {
    try {
        return await proxyBodyWithAuth(req, "/avaliacao/visitas", "POST");
    } catch (err) {
        console.error("api/visita POST proxy error:", err);
        return internalErrorResponse(err);
    }
}
