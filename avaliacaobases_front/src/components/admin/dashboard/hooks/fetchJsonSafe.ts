export default async function fetchJsonSafe(url: string) {
    const res = await fetch(url, {cache: 'no-store'});
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} (${url})`);
    if (res.status === 204) return null;
    const text = await res.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

// fetchJsonSafe.ts
export const postJsonSafe = async (url: string, data: any, options: RequestInit = {}) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: JSON.stringify(data),
            ...options,
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (err) {
        console.error(`POST request to ${url} failed:`, err);
        throw err;
    }
};