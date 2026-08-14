import { internalErrorResponse, proxyBodyWithAuth, proxyWithAuth } from "@/lib/apiProxy";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        return await proxyWithAuth(`/avaliacao/viaturas/${encodeURIComponent(id)}`, {
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/viatura/[id] GET proxy error:", err);
        return internalErrorResponse(err);
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        return await proxyBodyWithAuth(req, `/avaliacao/viaturas/${encodeURIComponent(id)}`, "PUT");
    } catch (err) {
        console.error("api/viatura/[id] PUT proxy error:", err);
        return internalErrorResponse(err);
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        return await proxyWithAuth(`/avaliacao/viaturas/${encodeURIComponent(id)}`, {
            method: "DELETE",
        });
    } catch (err) {
        console.error("api/viatura/[id] DELETE proxy error:", err);
        return internalErrorResponse(err);
    }
}
