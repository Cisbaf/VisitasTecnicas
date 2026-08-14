import { getAuthToken, proxyFetch } from "@/lib/apiProxy";
import { NextResponse } from "next/server";

export async function POST() {
    const token = await getAuthToken();

    if (token) {
        await proxyFetch("/avaliacao/user/logout", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set("token", "", {
        path: "/",
        maxAge: 0,
    });

    return res;
}
