import { internalErrorResponse, proxyBodyWithAuth } from "@/lib/apiProxy";

export async function DELETE(req: Request, { params }: { params: Promise<{ relatoId: string }> }) {
    try {
        const { relatoId } = await params;
        return await proxyBodyWithAuth(req, `/avaliacao/relatos/${encodeURIComponent(relatoId)}`, "DELETE");
    } catch (err) {
        console.error("api/visita/relatos/[relatoId] DELETE proxy error:", err);
        return internalErrorResponse(err);
    }
}
export async function PUT(req: Request, { params }: { params: Promise<{ relatoId: string }> }) {
    try {
        const { relatoId } = await params;
        return await proxyBodyWithAuth(req, `/avaliacao/relatos/${encodeURIComponent(relatoId)}`, "PUT");
    } catch (err) {
        console.error("api/avaliacao/relatos/[relatoId] PUT proxy error:", err);
        return internalErrorResponse(err);
    }
}
