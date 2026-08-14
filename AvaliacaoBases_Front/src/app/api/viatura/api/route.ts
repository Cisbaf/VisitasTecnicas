import { internalErrorResponse, proxyWithAuth } from "@/lib/apiProxy";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.toString();

        return await proxyWithAuth(`/avaliacao/viaturas/api${query ? `?${query}` : ""}`, {
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/viatura/api GET proxy error:", err);
        return internalErrorResponse(err);
    }
}
