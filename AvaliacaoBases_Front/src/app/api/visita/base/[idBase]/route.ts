import { internalErrorResponse, proxyWithAuth } from "@/lib/apiProxy";

export async function GET(req: Request, { params }: { params: Promise<{ idBase: string }> }) {
    try {
        const { idBase } = await params;
        return await proxyWithAuth(`/avaliacao/visitas/base/${encodeURIComponent(idBase)}`, {
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/visita/base/[idBase] GET proxy error:", err);
        return internalErrorResponse(err);
    }
}
