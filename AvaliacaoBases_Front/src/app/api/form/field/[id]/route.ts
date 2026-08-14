import { internalErrorResponse, proxyWithAuth } from "@/lib/apiProxy";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        return await proxyWithAuth(`/avaliacao/field/${encodeURIComponent(id)}`, {
            method: "DELETE",
        });
    } catch (err) {
        console.error("api/form/field DELETE proxy error:", err);
        return internalErrorResponse(err);
    }
}
