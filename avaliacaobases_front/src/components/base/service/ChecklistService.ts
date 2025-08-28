import { CheckListResponse, VisitaResponse, CategoriaAgrupada } from "@/components/types";

export default class ChecklistService {
    private static async fetchJson<T>(url: string): Promise<T> {
        const res = await fetch(url, { cache: "no-store" });
        if (res.status === 404) {
            return [] as unknown as T;
        }
        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            let message = txt || res.statusText || "Erro na requisição";
            try {
                const parsed = txt ? JSON.parse(txt) : null;
                if (parsed?.message) message = parsed.message;
            } catch { }
            throw new Error(message);
        }
        const text = await res.text();
        return text ? (JSON.parse(text) as T) : ([] as unknown as T);
    }


    public static async getCategoriasAgrupadas(baseId: number): Promise<CategoriaAgrupada[]> {
        if (!baseId) return [];

        const visitasUrl = `/api/visita/base/${baseId}`;
        const visitasData = (await this.fetchJson<VisitaResponse[]>(visitasUrl)) ?? [];

        // transforma visitas em Map para lookup por id
        const visitasMap = new Map<number, VisitaResponse>();
        visitasData.forEach(v => visitasMap.set(v.id, v));

        // 2) buscar todos os checklists
        const checklistsUrl = `/api/checklist`;
        const todosChecklists = (await this.fetchJson<CheckListResponse[]>(checklistsUrl)) ?? [];

        // 3) agrupar descrições por categoria e por visita (apenas visitas dessa base)
        const categoriasMap = new Map<string, CategoriaAgrupada>();

        for (const checklist of todosChecklists) {
            const categoriaKey = checklist.categoria ?? "Sem Categoria";

            for (const descricao of checklist.descricao ?? []) {
                const visita = visitasMap.get(descricao.visitaId);
                if (!visita) continue; // descrição não pertence à base requisitada

                // se ainda não existe essa categoria, cria
                if (!categoriasMap.has(categoriaKey)) {
                    categoriasMap.set(categoriaKey, {
                        categoriaId: checklist.id,
                        categoria: categoriaKey,
                        ultimaVisita: visita.dataVisita,
                        visitas: [{
                            visitaId: descricao.visitaId,
                            dataVisita: visita.dataVisita,
                            descricoes: [descricao]
                        }]
                    });
                    continue;
                }

                // categoria já existe -> atualiza
                const categoriaExistente = categoriasMap.get(categoriaKey)!;

                // atualizar última visita caso necessário
                if (new Date(visita.dataVisita).getTime() > new Date(categoriaExistente.ultimaVisita).getTime()) {
                    categoriaExistente.ultimaVisita = visita.dataVisita;
                }

                // encontrar visita existente dentro da categoria
                let visitaExistente = categoriaExistente.visitas.find(v => v.visitaId === descricao.visitaId);
                if (!visitaExistente) {
                    visitaExistente = {
                        visitaId: descricao.visitaId,
                        dataVisita: visita.dataVisita,
                        descricoes: []
                    };
                    categoriaExistente.visitas.push(visitaExistente);
                }

                visitaExistente.descricoes.push(descricao);
            }
        }

        // 4) converter para array e ordenar
        const categoriasArray = Array.from(categoriasMap.values()).sort((a, b) => a.categoria.localeCompare(b.categoria));

        // ordenar visitas por data (mais recente primeiro)
        categoriasArray.forEach(cat => {
            cat.visitas.sort((a, b) => new Date(b.dataVisita).getTime() - new Date(a.dataVisita).getTime());
        });

        return categoriasArray;
    }
}
