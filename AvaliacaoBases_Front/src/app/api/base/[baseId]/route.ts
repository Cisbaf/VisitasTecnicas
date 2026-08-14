import { internalErrorResponse, proxyBodyWithAuth, proxyWithAuth } from "@/lib/apiProxy";

export async function GET(req: Request, { params }: { params: Promise<{ baseId: string }> }) {
    try {
        const { baseId } = await params;
        const path = `/avaliacao/bases/${encodeURIComponent(baseId)}`;

        return await proxyWithAuth(path, {
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/base/[baseId] GET proxy error:", err);
        return internalErrorResponse(err);
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ baseId: string }> }) {
    try {
        const { baseId } = await params;
        return await proxyBodyWithAuth(req, `/avaliacao/bases/${encodeURIComponent(baseId)}`, "PUT");
    } catch (err) {
        console.error("api/base/[id] PUT proxy error:", err);
        return internalErrorResponse(err);
    }
}

export async function DELETE(
    _request: Request,
    context: { params: Promise<{ baseId: string }> }
) {
    try {
        const { baseId } = await context.params;
        return await proxyWithAuth(`/avaliacao/bases/${encodeURIComponent(baseId)}`, {
            method: "DELETE",
        });
    } catch (err) {
        console.error("api/base/[id] DELETE proxy error:", err);
        return internalErrorResponse(err);
    }
}
