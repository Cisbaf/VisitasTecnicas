import { internalErrorResponse, proxyWithAuth } from "@/lib/apiProxy";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const mes = searchParams.get("mes");
        const query = mes ? `?mes=${encodeURIComponent(mes)}` : "";

        return await proxyWithAuth(`/avaliacao/inspecao/prontidao/media${query}`, {
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/inspecao/prontidao/media GET proxy error:", err);
        return internalErrorResponse(err);
    }
}
