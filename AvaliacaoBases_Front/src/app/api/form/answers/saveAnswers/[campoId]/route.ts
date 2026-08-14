import { internalErrorResponse, proxyBodyWithAuth } from "@/lib/apiProxy";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ campoId: string }> }
) {
    try {
        const { campoId } = await params;
        return await proxyBodyWithAuth(req, `/avaliacao/answers/saveAnswers/${encodeURIComponent(campoId)}`, "POST");
    } catch (err) {
        console.error("api/forms/saveAnswers POST proxy error:", err);
        return internalErrorResponse(err);
    }
}
