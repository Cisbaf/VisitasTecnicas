import { internalErrorResponse, proxyBodyWithAuth, proxyWithAuth } from "@/lib/apiProxy";

export async function DELETE(req: Request, { params }: { params: Promise<{ formId: string }> }) {
    try {
        const { formId } = await params;
        return await proxyWithAuth(`/avaliacao/form/${encodeURIComponent(formId)}`, {
            method: "DELETE",
        });
    } catch (err) {
        console.error("api/form DELETE proxy error:", err);
        return internalErrorResponse(err);
    }
}
export async function PUT(req: Request, { params }: { params: Promise<{ formId: string }> }) {
    try {
        const { formId } = await params;
        return await proxyBodyWithAuth(req, `/avaliacao/form/${encodeURIComponent(formId)}`, "PUT");
    } catch (err) {
        console.error("api/forms PUT proxy error:", err);
        return internalErrorResponse(err);
    }
}
