import { internalErrorResponse, proxyWithAuth } from "@/lib/apiProxy";

export async function GET(req: Request, { params }: { params: Promise<{ campoId: string }> }) {

    try {
        const { campoId } = await params;
        return await proxyWithAuth(`/avaliacao/answers/field/${encodeURIComponent(campoId)}`, {
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/form/answers/field/[campoId] GET proxy error:", err);
        return internalErrorResponse(err);
    }
}
