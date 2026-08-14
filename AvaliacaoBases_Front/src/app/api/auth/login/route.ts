import { NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_INTERNAL_URL;

export async function POST(req: Request) {
    if (!backendUrl) {
        return NextResponse.json(
            { error: "Backend URL not configured" },
            { status: 500 }
        );
    }

    try {
        const body = await req.json();

        const response = await fetch(`${backendUrl}/avaliacao/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const responseText = await response.text();

        const nextResponse = NextResponse.json(
            { message: responseText },
            { status: response.status }
        );

        const setCookie = response.headers.get("set-cookie");
        if (setCookie) {
            nextResponse.headers.set("set-cookie", setCookie);
        }

        return nextResponse;
    } catch (err) {
        console.error("Erro no Proxy de Login:", err);
        return NextResponse.json({ error: "Erro interno no servidor" }, { status: 502 });
    }
}
