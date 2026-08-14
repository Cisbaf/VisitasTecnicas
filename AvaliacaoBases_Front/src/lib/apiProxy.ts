import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_INTERNAL_URL;

export function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
}

export async function getAuthToken() {
    const cookieStore = await cookies();
    return cookieStore.get("token")?.value;
}

export function unauthorizedResponse() {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

export function internalErrorResponse(error: unknown) {
    return NextResponse.json(
        { message: "Erro interno", detail: getErrorMessage(error) },
        { status: 500 }
    );
}

export async function proxyFetch(path: string, init?: RequestInit) {
    if (!backendUrl) {
        return NextResponse.json(
            { message: "Backend URL not configured" },
            { status: 500 }
        );
    }

    try {
        const fetchInit = init?.body
            ? ({ ...init, duplex: "half" } as RequestInit & { duplex: "half" })
            : init;

        const response = await fetch(`${backendUrl}${path}`, fetchInit);

        if (response.status === 204) {
            return new NextResponse(null, { status: response.status });
        }

        if (response.headers.get("content-length") === "0") {
            return new NextResponse(null, { status: response.status });
        }

        const bodyText = await response.text();

        if (!bodyText.trim()) {
            return new NextResponse(null, { status: response.status });
        }

        const contentType = response.headers.get("content-type");
        const headers = contentType ? { "content-type": contentType } : undefined;

        return new NextResponse(bodyText, {
            status: response.status,
            headers,
        });
    } catch (error) {
        console.error("proxyFetch network error:", error);
        return NextResponse.json(
            { message: "Bad gateway", detail: getErrorMessage(error) },
            { status: 502 }
        );
    }
}

export async function proxyWithAuth(
    path: string,
    init: RequestInit = {}
) {
    const token = await getAuthToken();

    if (!token) {
        return unauthorizedResponse();
    }

    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);

    return proxyFetch(path, {
        ...init,
        headers,
    });
}

export async function proxyBodyWithAuth(
    request: Request,
    path: string,
    method: "POST" | "PUT" | "PATCH" | "DELETE"
) {
    const bodyText = await request.text();

    return proxyWithAuth(path, {
        method,
        headers: {
            "Content-Type": request.headers.get("content-type") ?? "application/json",
        },
        body: bodyText,
    });
}

export async function proxyStreamWithAuth(
    request: Request,
    path: string,
    method: "POST" | "PUT" | "PATCH"
) {
    const token = await getAuthToken();

    if (!token) {
        return unauthorizedResponse();
    }

    const headers = new Headers(request.headers);
    headers.set("Authorization", `Bearer ${token}`);
    headers.delete("content-length");

    return proxyFetch(path, {
        method,
        headers,
        body: request.body,
    });
}
