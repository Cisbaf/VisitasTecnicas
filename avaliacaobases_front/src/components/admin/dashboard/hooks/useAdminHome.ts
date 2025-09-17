import { useEffect, useState, useCallback } from 'react';
import fetchJsonSafe from './/fetchJsonSafe';
import { RelatoDTO } from '@/components/types';

interface ResumoVisitas {
    totalBasesVisitadas: number;
    municipiosVisitados: string[];
    datasVisitas: string[];
    equipeTecnica: string[];
    totalInconformidades: number;
    indiceAprovacao: number;
}
export interface Viatura {
    id: number;
    idBase?: number;
    statusOperacional?: string | null;
}
interface ViaturaStatusPorBase {
    baseId: number;
    baseNome: string;
    status: {
        operacional: number;
        manutencao: number;
        inoperante: number;
        indefinido: number;
    };
}

export function useAdminHome() {
    const [basesList, setBasesList] = useState<any[]>([]);
    const [bases, setBases] = useState<string[]>([]);
    const [relatos, setRelatos] = useState<RelatoDTO[]>([]);
    const [resumo, setResumo] = useState<ResumoVisitas | null>(null);
    const [perBaseConformidade, setPerBaseConformidade] = useState<{ id: any; nome: string; avg: number }[]>([]);
    const [padronizacaoByBaseLastVisit, setPadronizacaoByBaseLastVisit] = useState<any[]>([]);
    const [viaturaStatusPorBase, setViaturaStatusPorBase] = useState<ViaturaStatusPorBase[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingViaturas, setLoadingViaturas] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBases = useCallback(async () => {
        try {
            const data = await fetchJsonSafe('/api/base');
            const basesData = Array.isArray(data) ? data : [];
            setBasesList(basesData);
            const municipiosUnicos = [...new Set(basesData.map((base: any) => base.nome).filter(Boolean))];
            setBases(municipiosUnicos as string[]);
            localStorage.setItem('allBasesData', JSON.stringify(basesData));
        } catch (err: any) { console.error('fetchBases error:', err); setError(String(err?.message || err)); }
    }, []);

    const buscarRelatos = useCallback(async (inicio?: Date | null, fim?: Date | null) => {
        if (!inicio || !fim) return;
        try {
            const relatosData = await fetchJsonSafe('/api/visita/relatos');
            const todosRelatos = Array.isArray(relatosData) ? relatosData : [];
            const relatosFiltrados = todosRelatos.filter((relato: RelatoDTO) => {
                const dataRelato = new Date(relato.data);
                return dataRelato >= inicio && dataRelato <= fim;
            });
            setRelatos(relatosFiltrados);
        } catch (err: any) { console.error('Erro ao buscar relatos:', err); }
    }, []);

    const buscarDadosPeriodo = useCallback(async (selectedMunicipio: string, inicio: Date | null, fim: Date | null) => {
        if (!inicio || !fim) return;
        setLoading(true);
        setError(null);

        try {
            const basesToProcess = basesList.filter(b => !selectedMunicipio || b.nome === selectedMunicipio);
            const allFormsRaw = await fetchJsonSafe('/api/form');
            const allForms = Array.isArray(allFormsRaw) ? allFormsRaw : [];
            const inspectionForms = allForms.filter((f: any) => f.tipoForm === 'INSPECAO');
            const padronizacaoForms = allForms.filter((f: any) => f.tipoForm === 'PADRONIZACAO');

            let totalBasesVisitadas = 0;
            const municipiosVisitados: string[] = [];
            const datasVisitas: string[] = [];
            const equipeTecnica: string[] = [];
            let totalInconformidades = 0;
            const mediasConformidade: number[] = [];
            const perBase: { id: any; nome: string; avg: number }[] = [];

            // contadores gerais de padronização por base (período)
            const padronizacaoCountsByBase: Record<string, { id: any; nome: string; conforme: number; parcial: number; naoConforme: number; naoAvaliado: number; total: number }> = {};
            // contadores por categoria dentro de cada base (período)
            const padronizacaoCategoriasByBase: Record<string, Record<string, { conforme: number; parcial: number; naoConforme: number; naoAvaliado: number; total: number }>> = {};

            // para calcular a padronizacao da ÚLTIMA visita por base
            const lastRespostasByBase: Record<string, any[]> = {};
            const lastVisitaTimestampByBase: Record<string, number> = {};

            for (const base of basesToProcess) {
                try {
                    // tenta fetch do consolidado (igual ao original)
                    let relatorioData: any = null;
                    try {
                        relatorioData = await fetchJsonSafe(`/api/relatorios/consolidado/${base.id}?inicio=${inicio.toISOString().split('T')[0]}&fim=${fim.toISOString().split('T')[0]}`);
                    } catch (err) {
                        // não crítico — seguimos sem consolidado
                    }

                    // fetch visitas do período
                    const params = new URLSearchParams({
                        dataInicio: inicio.toISOString().split('T')[0],
                        dataFim: fim.toISOString().split('T')[0],
                    });
                    const visitasData = await fetchJsonSafe(`/api/visita/periodo/${base.id}?${params.toString()}`) || [];
                    const visitas = Array.isArray(visitasData) ? visitasData : [];

                    if ((relatorioData && relatorioData.totalVisitas > 0) || visitas.length > 0) {
                        totalBasesVisitadas++;
                        if (base.municipio && !municipiosVisitados.includes(base.municipio)) municipiosVisitados.push(base.municipio);

                        // pontos críticos do consolidado
                        if (relatorioData && Array.isArray(relatorioData.pontosCriticosGerais)) {
                            relatorioData.pontosCriticosGerais.forEach((p: any) => { totalInconformidades += p.ocorrencias || 0; });
                        }
                    }

                    // prepara estruturas padronizacao para a base
                    const baseKey = String(base.id);
                    if (!padronizacaoCountsByBase[baseKey]) {
                        padronizacaoCountsByBase[baseKey] = { id: base.id, nome: base.nome || base.baseNome || `Base ${base.id}`, conforme: 0, parcial: 0, naoConforme: 0, naoAvaliado: 0, total: 0 };
                    }
                    if (!padronizacaoCategoriasByBase[baseKey]) padronizacaoCategoriasByBase[baseKey] = {};

                    const baseMedias: number[] = [];

                    for (const visita of visitas) {
                        // datas / equipe
                        if (visita.dataVisita && !datasVisitas.includes(visita.dataVisita)) datasVisitas.push(visita.dataVisita);
                        if (visita.membros && Array.isArray(visita.membros)) {
                            visita.membros.forEach((m: any) => { if (m.nome && !equipeTecnica.includes(m.nome)) equipeTecnica.push(m.nome); });
                        }

                        // respostas da visita
                        let respostasVisita: any[] = [];
                        try {
                            const respostasRaw = await fetchJsonSafe(`/api/form/answers/visit/${visita.id}`);
                            respostasVisita = Array.isArray(respostasRaw) ? respostasRaw : [];
                        } catch (err) {
                            respostasVisita = [];
                            console.warn(`Erro ao carregar respostas da visita ${visita.id}:`, err);
                        }

                        // checar última visita (por timestamp)
                        try {
                            const dtStr = visita.dataVisita ?? visita.data ?? visita.createdAt ?? visita.dataCriacao;
                            const ts = dtStr ? new Date(dtStr).getTime() : 0;
                            const existingTs = lastVisitaTimestampByBase[baseKey] ?? 0;
                            if (ts && ts >= existingTs) {
                                lastVisitaTimestampByBase[baseKey] = ts;
                                lastRespostasByBase[baseKey] = respostasVisita;
                            }
                        } catch { /* ignora data inválida */ }

                        // --- INSPEÇÃO: calcular porcentagens por form (checkbox) ---
                        try {
                            const porcentagensPorForm: number[] = [];
                            for (const form of inspectionForms) {
                                const checkboxFields = Array.isArray(form.campos) ? form.campos.filter((c: any) => c.tipo === 'CHECKBOX') : [];
                                if (checkboxFields.length === 0) continue;
                                let trueCount = 0;
                                let total = 0;
                                for (const field of checkboxFields) {
                                    if (!field.id) continue;
                                    const ans = respostasVisita.find((r: any) => String(r.campoId) === String(field.id) || String((r as any).fieldId) === String(field.id));
                                    if (!ans) continue;
                                    total += 1;
                                    const val = (ans.checkbox ?? (ans as any).value ?? (ans as any).answer ?? null);
                                    if (val === true || String(val).toUpperCase() === 'TRUE') trueCount += 1;
                                }
                                if (total > 0) porcentagensPorForm.push((trueCount / total) * 100);
                            }
                            if (porcentagensPorForm.length > 0) {
                                const soma = porcentagensPorForm.reduce((a, b) => a + b, 0);
                                const mediaCategorias = soma / porcentagensPorForm.length;
                                baseMedias.push(mediaCategorias);
                                mediasConformidade.push(mediaCategorias);
                            }
                        } catch (err) {
                            console.warn('Erro processando INSPECAO para visita', visita.id, err);
                        }

                        // --- PADRONIZAÇÃO: agrega para o PERÍODO por base e por categoria ---
                        try {
                            for (const form of padronizacaoForms) {
                                const selectFields = Array.isArray(form.campos) ? form.campos.filter((c: any) => c.tipo === 'SELECT') : [];
                                if (selectFields.length === 0) continue;
                                const categoriaNome = form.categoria ?? form.category ?? 'Sem categoria';
                                if (!padronizacaoCategoriasByBase[baseKey][categoriaNome]) {
                                    padronizacaoCategoriasByBase[baseKey][categoriaNome] = { conforme: 0, parcial: 0, naoConforme: 0, naoAvaliado: 0, total: 0 };
                                }
                                const cat = padronizacaoCategoriasByBase[baseKey][categoriaNome];

                                for (const field of selectFields) {
                                    if (!field.id) continue;
                                    const ans = respostasVisita.find((r: any) => String(r.campoId) === String(field.id) || String((r as any).fieldId) === String(field.id));
                                    const val = (ans?.select ?? (ans as any).value ?? (ans as any).answer ?? null);
                                    if (val === null || val === undefined) {
                                        padronizacaoCountsByBase[baseKey].naoAvaliado += 1;
                                        padronizacaoCountsByBase[baseKey].total += 1;
                                        cat.naoAvaliado += 1;
                                        cat.total += 1;
                                        continue;
                                    }
                                    const v = String(val).toUpperCase();
                                    if (v === 'CONFORME') { padronizacaoCountsByBase[baseKey].conforme += 1; padronizacaoCountsByBase[baseKey].total += 1; cat.conforme += 1; cat.total += 1; }
                                    else if (v === 'PARCIAL') { padronizacaoCountsByBase[baseKey].parcial += 1; padronizacaoCountsByBase[baseKey].total += 1; cat.parcial += 1; cat.total += 1; }
                                    else if (v === 'NAO_CONFORME' || v === 'NÃO_CONFORME' || v === 'NAO CONFORME') { padronizacaoCountsByBase[baseKey].naoConforme += 1; padronizacaoCountsByBase[baseKey].total += 1; cat.naoConforme += 1; cat.total += 1; }
                                    else if (v === 'NAO_AVALIADO' || v === 'NÃO_AVALIADO' || v === 'NAO AVALIADO') { padronizacaoCountsByBase[baseKey].naoAvaliado += 1; padronizacaoCountsByBase[baseKey].total += 1; cat.naoAvaliado += 1; cat.total += 1; }
                                    else { padronizacaoCountsByBase[baseKey].naoAvaliado += 1; padronizacaoCountsByBase[baseKey].total += 1; cat.naoAvaliado += 1; cat.total += 1; }
                                }
                            }
                        } catch (err) {
                            console.warn('Erro processando PADRONIZACAO para visita', visita.id, err);
                        }
                    } // fim for visitas

                    // se não foram calculadas medias por inspeção, tenta usar relatorioData.mediasConformidade (fallback)
                    if (baseMedias.length === 0 && relatorioData && relatorioData.mediasConformidade) {
                        const valores = Object.values(relatorioData.mediasConformidade) as number[];
                        if (valores.length > 0) {
                            const mediaGeralDoRelatorio = valores.reduce((a: number, b: number) => a + b, 0) / valores.length;
                            baseMedias.push(mediaGeralDoRelatorio);
                            mediasConformidade.push(mediaGeralDoRelatorio);
                        }
                    }

                    if (baseMedias.length > 0) {
                        const avg = baseMedias.reduce((a, b) => a + b, 0) / baseMedias.length;
                        perBase.push({ id: base.id, nome: base.nome || base.baseNome || `Base ${base.id}`, avg });
                    }

                } catch (err: any) {
                    console.error('Erro ao buscar dados da base', base, err);
                    setError(err?.message || String(err));
                }
            } // fim for bases

            // transformar padronizacaoCountsByBase (período) em array, caso queira usar
            const padronizacaoArr = Object.values(padronizacaoCountsByBase).map(b => {
                const t = b.total || 0;
                const conforme = t > 0 ? Math.round((b.conforme / t) * 10000) / 100 : 0;
                const parcial = t > 0 ? Math.round((b.parcial / t) * 10000) / 100 : 0;
                const naoConforme = t > 0 ? Math.round((b.naoConforme / t) * 10000) / 100 : 0;
                const naoAvaliado = t > 0 ? Math.round((b.naoAvaliado / t) * 10000) / 100 : 0;
                return { id: b.id, name: b.nome, conforme, parcial, naoConforme, naoAvaliado, totalCount: b.total };
            });

            // construir padronizacao apenas da ÚLTIMA visita por base
            const padronizacaoCountsByBaseLast: Record<string, { id: any; nome: string; conforme: number; parcial: number; naoConforme: number; naoAvaliado: number; total: number }> = {};
            const padronizacaoCategoriasByBaseLast: Record<string, Record<string, { conforme: number; parcial: number; naoConforme: number; naoAvaliado: number; total: number }>> = {};

            Object.keys(lastRespostasByBase).forEach(baseKey => {
                const respostas = lastRespostasByBase[baseKey] || [];
                const baseMeta = padronizacaoCountsByBase[baseKey];
                padronizacaoCountsByBaseLast[baseKey] = { id: baseMeta?.id ?? baseKey, nome: baseMeta?.nome ?? `Base ${baseKey}`, conforme: 0, parcial: 0, naoConforme: 0, naoAvaliado: 0, total: 0 };
                padronizacaoCategoriasByBaseLast[baseKey] = {};

                try {
                    for (const form of padronizacaoForms) {
                        const selectFields = Array.isArray(form.campos) ? form.campos.filter((c: any) => c.tipo === 'SELECT') : [];
                        if (selectFields.length === 0) continue;
                        const categoriaNome = form.categoria ?? form.category ?? 'Sem categoria';
                        if (!padronizacaoCategoriasByBaseLast[baseKey][categoriaNome]) padronizacaoCategoriasByBaseLast[baseKey][categoriaNome] = { conforme: 0, parcial: 0, naoConforme: 0, naoAvaliado: 0, total: 0 };

                        for (const field of selectFields) {
                            if (!field.id) continue;
                            const ans = respostas.find((r: any) => String(r.campoId) === String(field.id) || String((r as any).fieldId) === String(field.id));
                            const val = (ans?.select ?? ans?.value ?? ans?.answer ?? null);
                            if (val === null || val === undefined) {
                                padronizacaoCountsByBaseLast[baseKey].naoAvaliado += 1;
                                padronizacaoCountsByBaseLast[baseKey].total += 1;
                                padronizacaoCategoriasByBaseLast[baseKey][categoriaNome].naoAvaliado += 1;
                                padronizacaoCategoriasByBaseLast[baseKey][categoriaNome].total += 1;
                                continue;
                            }
                            const v = String(val).toUpperCase();
                            const b = padronizacaoCountsByBaseLast[baseKey];
                            const cat = padronizacaoCategoriasByBaseLast[baseKey][categoriaNome];
                            if (v === 'CONFORME') { b.conforme += 1; b.total += 1; cat.conforme += 1; cat.total += 1; }
                            else if (v === 'PARCIAL') { b.parcial += 1; b.total += 1; cat.parcial += 1; cat.total += 1; }
                            else if (v === 'NAO_CONFORME' || v === 'NÃO_CONFORME' || v === 'NAO CONFORME') { b.naoConforme += 1; b.total += 1; cat.naoConforme += 1; cat.total += 1; }
                            else if (v === 'NAO_AVALIADO' || v === 'NÃO_AVALIADO' || v === 'NAO AVALIADO') { b.naoAvaliado += 1; b.total += 1; cat.naoAvaliado += 1; cat.total += 1; }
                            else { b.naoAvaliado += 1; b.total += 1; cat.naoAvaliado += 1; cat.total += 1; }
                        }
                    }
                } catch (err) {
                    console.warn('Erro construindo padronização da última visita para base', baseKey, err);
                }
            });

            const padronizacaoArrLast = Object.values(padronizacaoCountsByBaseLast).map(b => {
                const t = b.total || 0;
                const conforme = t > 0 ? Math.round((b.conforme / t) * 10000) / 100 : 0;
                const parcial = t > 0 ? Math.round((b.parcial / t) * 10000) / 100 : 0;
                const naoConforme = t > 0 ? Math.round((b.naoConforme / t) * 10000) / 100 : 0;
                const naoAvaliado = t > 0 ? Math.round((b.naoAvaliado / t) * 10000) / 100 : 0;
                const maxPct = Math.max(conforme, parcial, naoConforme);
                let statusPrincipal = 'PARCIAL';
                if (maxPct === conforme) statusPrincipal = 'CONFORME';
                else if (maxPct === naoConforme) statusPrincipal = 'NAO_CONFORME';
                if (naoAvaliado > 0 && conforme === 0 && parcial === 0 && naoConforme === 0) statusPrincipal = 'NAO_AVALIADO';

                const categoriasObj = padronizacaoCategoriasByBaseLast[String(b.id)] || {};
                const categoriasArr = Object.entries(categoriasObj).map(([catNome, c]) => {
                    const raw = { conforme: Number(c.conforme || 0), parcial: Number(c.parcial || 0), naoConforme: Number(c.naoConforme || 0), naoAvaliado: Number(c.naoAvaliado || 0) };
                    if (raw.conforme === 0 && raw.parcial === 0 && raw.naoConforme === 0 && raw.naoAvaliado === 0) {
                        return { categoria: catNome, conforme: 0, parcial: 0, naoConforme: 0, naoAvaliado: 0, raw, total: 0, status: 'NAO_AVALIADO' };
                    }

                    const total = c.total || (raw.conforme + raw.parcial + raw.naoConforme + raw.naoAvaliado);
                    const conformePct = total > 0 ? (raw.conforme / total) * 100 : 0;
                    const parcialPct = total > 0 ? (raw.parcial / total) * 100 : 0;
                    const naoConformePct = total > 0 ? (raw.naoConforme / total) * 100 : 0;
                    const naoAvaliadoPct = total > 0 ? (raw.naoAvaliado / total) * 100 : 0;

                    let status = 'NAO_AVALIADO';
                    if (conformePct === 0 && parcialPct === 0 && naoConformePct === 0 && naoAvaliadoPct > 0) {
                        status = 'NAO_AVALIADO';
                    } else if (naoConformePct === 100) {
                        status = 'NAO_CONFORME';
                    } else if (conformePct === 100) {
                        status = 'CONFORME';
                    } else if (parcialPct === 100) {
                        status = 'PARCIAL';
                    } else if (naoConformePct > 20) {
                        status = 'NAO_CONFORME';
                    } else if (naoConformePct > 0) {
                        status = 'PARCIAL';
                    } else if (parcialPct > 0) {
                        status = 'PARCIAL';
                    } else if (conformePct > 0) {
                        status = 'CONFORME';
                    } else {
                        status = 'NAO_AVALIADO';
                    }

                    console.log({ conformePct, parcialPct, naoConformePct, naoAvaliadoPct, status });
                    return {
                        categoria: catNome,
                        conforme: Math.round(conformePct * 100) / 100,
                        parcial: Math.round(parcialPct * 100) / 100,
                        naoConforme: Math.round(naoConformePct * 100) / 100,
                        naoAvaliado: Math.round(naoAvaliadoPct * 100) / 100,
                        raw,
                        total,
                        status // Status calculado
                    };
                });

                return {
                    id: b.id,
                    name: b.nome,
                    conforme,
                    parcial,
                    naoConforme,
                    naoAvaliado,
                    totalCount: b.total,
                    statusPrincipal,
                    categorias: categoriasArr
                };
            });

            // atualizar estados
            setPerBaseConformidade(perBase);
            setPadronizacaoByBaseLastVisit(padronizacaoArrLast);
            setResumo({
                totalBasesVisitadas,
                municipiosVisitados,
                datasVisitas: datasVisitas.sort(),
                equipeTecnica,
                totalInconformidades,
                indiceAprovacao: mediasConformidade.length > 0 ? mediasConformidade.reduce((a, b) => a + b, 0) / mediasConformidade.length : 0
            });

            // buscar relatos
            await buscarRelatos(inicio, fim);

        } catch (err: any) {
            console.error('Erro ao buscar dados do período', err);
            setError(err?.message || String(err));
        } finally { setLoading(false); }
    }, [basesList, buscarRelatos, setPadronizacaoByBaseLastVisit, setPerBaseConformidade, setResumo]);

    const fetchStatusViaturasPorBase = useCallback(async () => {
        setLoadingViaturas(true);
        try {
            const viaturasData = await fetchJsonSafe('/api/viatura');
            const viaturas = Array.isArray(viaturasData) ? viaturasData : [];
            const viaturasPorBase: Record<number, Viatura[]> = {};
            viaturas.forEach((v: Viatura) => { if (v.idBase) { viaturasPorBase[v.idBase] = viaturasPorBase[v.idBase] || []; viaturasPorBase[v.idBase].push(v); } });
            const statusPorBase: ViaturaStatusPorBase[] = [];
            Object.entries(viaturasPorBase).forEach(([baseId, viaturasDaBase]) => {
                const base = basesList.find(b => b.id === Number(baseId));
                const baseNome = base ? base.nome : `Base ${baseId}`;
                const statusCount = { operacional: 0, manutencao: 0, inoperante: 0, indefinido: 0 };
                viaturasDaBase.forEach(viatura => {
                    const status = viatura.statusOperacional?.toLowerCase() || 'indefinido';
                    if (status.includes('operacao') || status.includes('operação') || status.includes('ativa')) statusCount.operacional++;
                    else if (status.includes('manutencao') || status.includes('manutenção')) statusCount.manutencao++;
                    else if (status.includes('inoperante') || status.includes('fora') || status.includes('inativa')) statusCount.inoperante++;
                    else statusCount.indefinido++;
                });
                statusPorBase.push({ baseId: Number(baseId), baseNome, status: statusCount });
            });
            setViaturaStatusPorBase(statusPorBase);
        } catch (err: any) { console.error('Erro ao buscar status das viaturas:', err); setError(String(err)); }
        finally { setLoadingViaturas(false); }
    }, [basesList]);

    useEffect(() => { fetchBases(); }, [fetchBases]);
    useEffect(() => { if (basesList.length > 0) fetchStatusViaturasPorBase(); }, [basesList, fetchStatusViaturasPorBase]);

    return {
        basesList, bases, relatos, resumo, perBaseConformidade, padronizacaoByBaseLastVisit,
        viaturaStatusPorBase, loading, loadingViaturas, error,
        fetchBases, buscarDadosPeriodo, fetchStatusViaturasPorBase
    };
}