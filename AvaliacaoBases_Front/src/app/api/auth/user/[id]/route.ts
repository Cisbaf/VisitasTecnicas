import { internalErrorResponse, proxyBodyWithAuth, proxyWithAuth } from "@/lib/apiProxy";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        return await proxyWithAuth(`/avaliacao/user/${encodeURIComponent(id)}`, {
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/auth/user/[id] GET proxy error:", err);
        return internalErrorResponse(err);
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        return await proxyBodyWithAuth(req, `/avaliacao/user/${encodeURIComponent(id)}`, "PUT");
    } catch (err) {
        console.error("api/auth/user/[id] PUT proxy error:", err);
        return internalErrorResponse(err);
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        return await proxyWithAuth(`/avaliacao/user/${encodeURIComponent(id)}`, {
            method: "DELETE",
        });
    } catch (err) {
        console.error("api/auth/user/[id] DELETE proxy error:", err);
        return internalErrorResponse(err);
    }
}
