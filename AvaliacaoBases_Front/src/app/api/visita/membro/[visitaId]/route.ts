import { internalErrorResponse, proxyBodyWithAuth, proxyWithAuth } from "@/lib/apiProxy";

export async function GET(req: Request, { params }: { params: Promise<{ visitaId: string }> }) {
    try {
        const { visitaId } = await params;
        return await proxyWithAuth(`/avaliacao/visitas/membro/${encodeURIComponent(visitaId)}`, {
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/visita/membros/[visitaId] GET proxy error:", err);
        return internalErrorResponse(err);
    }
}
export async function POST(req: Request, { params }: { params: Promise<{ visitaId: string }> }) {
    try {
        const { visitaId } = await params;
        return await proxyBodyWithAuth(req, `/avaliacao/visitas/membro/${encodeURIComponent(visitaId)}`, "POST");
    } catch (err) {
        console.error("api/visita/membro/[visitaId] POST proxy error:", err);
        return internalErrorResponse(err);
    }
}
export async function DELETE(req: Request, { params }: { params: Promise<{ visitaId: string }> }) {
    try {
        const { visitaId } = await params;
        return await proxyBodyWithAuth(req, `/avaliacao/visitas/membro/${encodeURIComponent(visitaId)}`, "DELETE");
    } catch (err) {
        console.error("api/visita/membro/[visitaId] DELETE proxy error:", err);
        return internalErrorResponse(err);
    }
}
