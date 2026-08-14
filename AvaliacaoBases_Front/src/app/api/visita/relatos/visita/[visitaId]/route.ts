import { internalErrorResponse, proxyWithAuth } from "@/lib/apiProxy";

export async function GET(req: Request, { params }: { params: Promise<{ visitaId: string }> }) {
    try {
        const { visitaId } = await params;
        return await proxyWithAuth(`/avaliacao/relatos/visita/${encodeURIComponent(visitaId)}`, {
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/visita/relatos/visita/[visitaId] GET proxy error:", err);
        return internalErrorResponse(err);
    }
}
