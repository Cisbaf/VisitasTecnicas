import { internalErrorResponse, proxyWithAuth } from "@/lib/apiProxy";

export async function GET(req: Request, { params }: { params: Promise<{ formId: string }> }) {
    try {

        const { formId } = await params;
        return await proxyWithAuth(`/avaliacao/answers/form/${encodeURIComponent(formId)}`, {
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/answers/form/[formId] GET proxy error:", err);
        return internalErrorResponse(err);
    }
}
