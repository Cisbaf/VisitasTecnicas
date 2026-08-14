import { internalErrorResponse, proxyWithAuth } from "@/lib/apiProxy";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ placa: string }> }
) {
    try {
        const { placa } = await params;
        return await proxyWithAuth(`/avaliacao/viaturas/api/${encodeURIComponent(placa)}`, {
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/viatura/api GET proxy error:", err);
        return internalErrorResponse(err);
    }
}
