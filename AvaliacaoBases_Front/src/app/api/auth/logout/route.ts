import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_INTERNAL_URL;

export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    await fetch(`${BACKEND}/avaliacao/user/logout`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    // 🔥 REMOVE COOKIE NO NEXT (ESSENCIAL)
    const res = NextResponse.json({ ok: true });
    res.cookies.set("token", "", {
        path: "/",
        maxAge: 0
    });

    return res;
}