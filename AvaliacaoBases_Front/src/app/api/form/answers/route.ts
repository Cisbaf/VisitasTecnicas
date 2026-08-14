import { internalErrorResponse, proxyWithAuth } from "@/lib/apiProxy";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const campoId = searchParams.get("campoId");
        const visitaId = searchParams.get("visitaId");

        const backendUrl = !campoId || !visitaId
            ? "/avaliacao/answers/all"
            : `/avaliacao/answers?campoId=${encodeURIComponent(campoId)}&visitId=${encodeURIComponent(visitaId)}`;

        return await proxyWithAuth(backendUrl, {
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/form/answers GET proxy error:", err);
        return internalErrorResponse(err);
    }
}
