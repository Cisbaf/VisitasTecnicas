import { internalErrorResponse, proxyWithAuth } from "@/lib/apiProxy";

export async function GET(req: Request, { params }: { params: Promise<{ type: string }> }) {

    try {
        const { type } = await params;
        return await proxyWithAuth(`/avaliacao/form/type/${encodeURIComponent(type)}`, {
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/form/type/[type] GET proxy error:", err);
        return internalErrorResponse(err);
    }
}
