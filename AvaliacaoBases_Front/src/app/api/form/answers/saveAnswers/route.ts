import { internalErrorResponse, proxyBodyWithAuth } from "@/lib/apiProxy";

export async function POST(req: Request) {
    try {
        return await proxyBodyWithAuth(req, "/avaliacao/answers/saveAnswers", "POST");
    } catch (err) {
        console.error("api/forms/saveAnswers POST proxy error:", err);
        return internalErrorResponse(err);
    }
}
