import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const BACKEND = process.env.BACKEND_INTERNAL_URL;

    try {
        const body = await req.json();

        const res = await fetch(`${BACKEND}/avaliacao/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        // 1. Pegue o texto bruto, já que o Java envia uma String pura
        const responseText = await res.text();

        // 2. Prepare a resposta do Next.js
        const nextResponse = NextResponse.json(
            { message: responseText }, // Encapsulamos o texto em um objeto JSON
            { status: res.status }
        );

        // 3. REPASSE O COOKIE (Fundamental para o login funcionar)
        const setCookie = res.headers.get("set-cookie");
        if (setCookie) {
            nextResponse.headers.set("set-cookie", setCookie);
        }

        return nextResponse;

    } catch (err: any) {
        console.error("Erro no Proxy de Login:", err);
        return NextResponse.json({ error: "Erro interno no servidor" }, { status: 502 });
    }
}