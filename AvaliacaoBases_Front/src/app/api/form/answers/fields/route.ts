import { internalErrorResponse, proxyWithAuth } from "@/lib/apiProxy";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const campoIds: number[] = await req.json().catch(() => []);

        if (!Array.isArray(campoIds)) {
            return NextResponse.json({ message: "campoIds deve ser uma lista" }, { status: 400 });
        }

        return await proxyWithAuth("/avaliacao/answers/fields", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(campoIds),
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/form/answers/by-campos POST proxy error:", err);
        return internalErrorResponse(err);
    }
}
