import { internalErrorResponse, proxyWithAuth } from "@/lib/apiProxy";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => []);
        const visitIdsArray = Array.isArray(body) ? body : (body.visitIds || []);

        if (!Array.isArray(visitIdsArray)) {
            return NextResponse.json({ message: "visitIds deve ser uma lista" }, { status: 400 });
        }

        return await proxyWithAuth("/avaliacao/answers/all", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(visitIdsArray),
        });
    } catch (err) {
        console.error("api/form/answers/all POST proxy error:", err);
        return internalErrorResponse(err);
    }
}
