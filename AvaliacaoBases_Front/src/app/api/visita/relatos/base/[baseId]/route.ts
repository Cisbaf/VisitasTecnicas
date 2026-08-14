import { internalErrorResponse, proxyWithAuth } from "@/lib/apiProxy";

export async function GET(req: Request, { params }: { params: Promise<{ baseId: string }> }) {
    try {
        const { baseId } = await params;
        return await proxyWithAuth(`/avaliacao/relatos/base/${encodeURIComponent(baseId)}`, {
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/visita/relatos/base/[baseId] GET proxy error:", err);
        return internalErrorResponse(err);
    }
}
