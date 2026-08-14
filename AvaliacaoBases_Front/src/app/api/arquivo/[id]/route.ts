import { internalErrorResponse, proxyBodyWithAuth, proxyWithAuth } from "@/lib/apiProxy";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        return await proxyWithAuth(`/avaliacao/midias/${encodeURIComponent(id)}`, {
            method: "DELETE",
        });
    } catch (err) {
        console.error("api/arquivo/[id] DELETE proxy error:", err);
        return internalErrorResponse(err);
    }
}
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        return await proxyBodyWithAuth(req, `/avaliacao/midias/${encodeURIComponent(id)}`, "PUT");
    } catch (err) {
        console.error("api/arquivo/[id] PUT proxy error:", err);
        return internalErrorResponse(err);
    }
}
