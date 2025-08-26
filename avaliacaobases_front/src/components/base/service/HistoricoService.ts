import { VisitaResponse, RelatoResponse } from "@/components/types";


export interface VisitaComRelatos extends VisitaResponse {
    relatos: RelatoResponse[];
}

export default class HistoricoService {
    private static async fetchJson<T>(url: string): Promise<T> {
        const res = await fetch(url, { cache: "no-store" });
        if (res.status === 404 || res.status === 204) return [] as unknown as T;
        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            let message = txt || res.statusText || "Erro na requisição";
            try {
                const parsed = txt ? JSON.parse(txt) : null;
                if (parsed?.message) message = parsed.message;
            } catch { }
            throw new Error(message);
        }
        const txt = await res.text();
        return txt ? (JSON.parse(txt) as T) : ([] as unknown as T);
    }

    public static async getHistoricosByBase(baseId: number): Promise<VisitaComRelatos[]> {
        if (!baseId) return [];

        // 1) buscar visitas da base
        const visitasUrl = `/api/visita/base/${baseId}`;
        const visitas = (await this.fetchJson<VisitaResponse[]>(visitasUrl)) ?? [];

        if (!Array.isArray(visitas) || visitas.length === 0) return [];

        // 2) para cada visita buscar relatos em paralelo
        const fetchRelatosPromises = visitas.map(async (v) => {
            try {
                const relatos = (await this.fetchJson<RelatoResponse[]>(`/api/relatos/visita/${v.id}`)) ?? [];
                return { visita: v, relatos };
            } catch (err) {
                console.error(`Erro ao buscar relatos da visita ${v.id}:`, err);
                return { visita: v, relatos: [] as RelatoResponse[] };
            }
        });

        const visitasComRelatos = await Promise.all(fetchRelatosPromises);

        // 3) montar resultado (ordenar visitas por data decrescente)
        const result: VisitaComRelatos[] = visitasComRelatos.map(x => ({ ...x.visita, relatos: x.relatos }));
        result.sort((a, b) => new Date(b.dataVisita).getTime() - new Date(a.dataVisita).getTime());

        return result;
    }
}
