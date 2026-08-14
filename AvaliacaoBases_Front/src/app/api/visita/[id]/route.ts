import { internalErrorResponse, proxyBodyWithAuth, proxyWithAuth } from "@/lib/apiProxy";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        return await proxyWithAuth(`/avaliacao/visitas/${encodeURIComponent(id)}`, {
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/visita/[id] GET proxy error:", err);
        return internalErrorResponse(err);
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        return await proxyBodyWithAuth(req, `/avaliacao/visitas/${encodeURIComponent(id)}`, "PUT");
    } catch (err) {
        console.error("api/visita/[id] PUT proxy error:", err);
        return internalErrorResponse(err);
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        return await proxyWithAuth(`/avaliacao/visitas/${encodeURIComponent(id)}`, {
            method: "DELETE",
        });
    } catch (err) {
        console.error("api/visita/[id] DELETE proxy error:", err);
        return internalErrorResponse(err);
    }
}
