import { useEffect, useState, useCallback } from 'react';
import fetchJsonSafe, { postJsonSafe } from './/fetchJsonSafe';
import { CategoryData, PREDEFINED_SUMMARIES, RelatoDTO, Viatura } from '@/components/types';


export interface ConformidadeSummary {
    summaryId: number;
    summaryNome: string;
    porcentagem: number;
    categorias: {
        nome: string;
        conforme: number;
        total: number;
        porcentagem: number;
    }[];
}

export interface ResumoVisitas {
    totalBasesVisitadas: number;
    municipiosVisitados: string[];
    datasVisitas: string[];
    equipeTecnica: string[];
    equipeTecnicaPorBase: { baseNome: string; equipe: string[] }[];
    totalInconformidades: number;
    indiceAprovacao: number;
    indiceInspecao: number;
    indicePadronizacao: number;
    visitasDetalhadas: { data: string; municipio: string; baseId: number; baseNome: string }[];
    conformidadePorSummary: Record<number, ConformidadeSummary[]>; // NOVO
}

export interface ViaturaStatusPorBase {
    baseId: number;
    baseNome: string;
    status: {
        operacional: number;
        indefinido: number; // Apenas esses dois agora
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
    const [viaturasPorBase, setViaturasPorBase] = useState<Record<number, Viatura[]>>({}); // ADICIONE ESTA LINHA
    const [loading, setLoading] = useState(false);
    const [loadingViaturas, setLoadingViaturas] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [basesComChecklist, setBasesComChecklist] = useState<number[]>([]);

    const fetchBases = useCallback(async () => {
        try {
            const data = await fetchJsonSafe('/api/base');
            const basesData = Array.isArray(data) ? data : [];

            setBasesList(basesData);
            const municipiosUnicos = [...new Set(basesData.map((base: any) => base.nome).filter(Boolean))];
            setBases(municipiosUnicos as string[]);
            localStorage.setItem('allBasesData', JSON.stringify(basesData));

        } catch (err: any) {
            console.error('fetchBases error:', err);
            setError(String(err?.message || err));
        }
    }, []);

    const buscarRelatos = (async (inicio?: Date | null, fim?: Date | null, baseId?: number) => {
        if (!inicio || !fim) return;
        setRelatos([]);

        try {
            const relatosData = await fetchJsonSafe('/api/visita/relatos');
            const todosRelatos = Array.isArray(relatosData) ? relatosData : [];
            const relatosFiltrados = todosRelatos.filter((relato: RelatoDTO) => {
                const dataRelato = new Date(relato.data);
                return dataRelato >= inicio && dataRelato <= fim;
            });
            if (!baseId) {
                setRelatos(relatosFiltrados);
            } else {
                const relatosFiltradosPorBase = relatosFiltrados.filter(r => String(r.baseId) === String(baseId));
                setRelatos(relatosFiltradosPorBase);
            }
        } catch (err: any) { console.error('Erro ao buscar relatos:', err); }
    });



    const buscarDadosPeriodo = useCallback(async (selectedMunicipio: string, inicio: Date | null, fim: Date | null) => {
        if (!inicio || !fim) return;
        setLoading(true);
        setError(null);

        try {
            const basesToProcess = basesList.filter(b => !selectedMunicipio || b.nome === selectedMunicipio || b.id === Number(selectedMunicipio));
            const allFormsRaw = await fetchJsonSafe('/api/form');
            const allForms = Array.isArray(allFormsRaw) ? allFormsRaw : [];
            const inspectionForms = allForms.filter((f: any) => f.tipoForm === 'INSPECAO');
            const padronizacaoForms = allForms.filter((f: any) => f.tipoForm === 'PADRONIZACAO');

            const acumuladores: any = {
                totalBasesVisitadas: 0,
                municipiosVisitados: [] as string[],
                datasVisitas: [] as string[],
                equipeTecnica: [] as string[],
                equipeTecnicaPorBase: [] as { baseNome: string; equipe: string[] }[], // NOVO
                visitasDetalhadas: [] as { data: string; municipio: string; baseId: number; baseNome: string }[], // NOVO
                totalInconformidades: 0,
                mediasConformidade: [] as number[],
                perBase: [] as { id: any; nome: string; avg: number }[],
                padronizacaoCountsByBase: {} as Record<string, any>,
                padronizacaoCategoriasByBase: {} as Record<string, Record<string, any>>,
                lastRespostasByBase: {} as Record<string, any[]>,
                lastVisitaTimestampByBase: {} as Record<string, number>,
                conformidadePorSummary: {} as Record<number, ConformidadeSummary[]>, // NOVO

            };

            // BUSCA OTIMIZADA PARA TODAS AS BASES
            if (!selectedMunicipio) {
                try {
                    buscarRelatos(inicio, fim);

                    const params = new URLSearchParams({
                        dataInicio: inicio.toISOString().split('T')[0],
                        dataFim: fim.toISOString().split('T')[0],
                    });
                    const todasVisitasData = await fetchJsonSafe(`/api/visita/periodo?${params.toString()}`);
                    const todasVisitas = Array.isArray(todasVisitasData) ? todasVisitasData : [];

                    const visitIds = todasVisitas.map((visita: any) => visita.id).filter(Boolean);

                    let todasRespostas: any[] = [];
                    if (visitIds.length > 0) {
                        try {
                            todasRespostas = await postJsonSafe('/api/form/answers/all', { visitIds: visitIds });
                            if (!Array.isArray(todasRespostas)) todasRespostas = [];
                        } catch (err) {
                            console.error('Erro ao buscar todas as respostas:', err);
                            todasRespostas = [];
                        }
                    }

                    const respostasPorVisita: Record<string, any[]> = {};
                    todasRespostas.forEach((resposta: any) => {
                        const visitaId = String(resposta.visitaId || resposta.visitId);
                        if (!respostasPorVisita[visitaId]) respostasPorVisita[visitaId] = [];
                        respostasPorVisita[visitaId].push(resposta);
                    });

                    const visitasPorBase: Record<string, any[]> = {};
                    todasVisitas.forEach((visita: any) => {
                        const baseId = String(visita.baseId || visita.idBase);
                        if (!visitasPorBase[baseId]) visitasPorBase[baseId] = [];
                        visitasPorBase[baseId].push(visita);
                    });

                    const relatoriosPorBase: Record<string, any> = {};

                    for (const base of basesToProcess) {
                        const baseIdStr = String(base.id);
                        const visitaId = visitasPorBase[baseIdStr]?.[0]?.id;

                        await processarBase(
                            base,
                            relatoriosPorBase[visitaId] || null,
                            visitasPorBase[baseIdStr] || [],
                            respostasPorVisita,
                            inspectionForms,
                            padronizacaoForms,
                            acumuladores
                        );
                    }
                } catch (err: any) {
                    console.error('Erro na busca otimizada:', err);
                    setError(err?.message || String(err));
                }
            } else {
                // Busca individual para base específica
                for (const base of basesToProcess) {
                    try {
                        let relatorioData: any = null;
                        try {
                            relatorioData = await fetchJsonSafe(
                                `/api/relatorios/consolidado/${base.id}?inicio=${inicio.toISOString().split('T')[0]}&fim=${fim.toISOString().split('T')[0]}`
                            );
                        } catch (err) {
                            console.warn('Erro ao buscar relatório individual para base', base.id, err);
                        }
                        buscarRelatos(inicio, fim, base.id);


                        const params = new URLSearchParams({
                            dataInicio: inicio.toISOString().split('T')[0],
                            dataFim: fim.toISOString().split('T')[0],
                        });
                        const visitasData = await fetchJsonSafe(`/api/visita/periodo/${base.id}?${params.toString()}`) || [];
                        const visitas = Array.isArray(visitasData) ? visitasData : [];

                        const visitIds = visitas.map((v: any) => v.id).filter(Boolean);
                        let respostasPorVisita: Record<string, any[]> = {};

                        if (visitIds.length > 0) {
                            try {
                                const todasRespostas = await postJsonSafe('/api/form/answers/all', { visitIds: visitIds });
                                if (Array.isArray(todasRespostas)) {
                                    todasRespostas.forEach((resposta: any) => {
                                        const visitaId = String(resposta.visitaId || resposta.visitId);
                                        if (!respostasPorVisita[visitaId]) respostasPorVisita[visitaId] = [];
                                        respostasPorVisita[visitaId].push(resposta);
                                    });
                                }
                            } catch (err) {
                                console.error('Erro ao buscar respostas para base específica:', err);
                                // fallback por visita
                                for (const visita of visitas) {
                                    try {
                                        const respostasRaw = await fetchJsonSafe(`/api/form/answers/visit/${visita.id}`);
                                        respostasPorVisita[String(visita.id)] = Array.isArray(respostasRaw) ? respostasRaw : [];
                                    } catch (err) {
                                        respostasPorVisita[String(visita.id)] = [];
                                    }
                                }
                            }
                        }

                        await processarBase(
                            base,
                            relatorioData,
                            visitas,
                            respostasPorVisita,
                            inspectionForms,
                            padronizacaoForms,
                            acumuladores
                        );

                    } catch (err: any) {
                        console.error('Erro ao buscar dados da base', base, err);
                        setError(err?.message || String(err));
                    }
                }
            }

            const padronizacaoCountsByBase = acumuladores.padronizacaoCountsByBase;

            const padronizacaoCountsByBaseLast: Record<string, any> = {};
            const padronizacaoCategoriasByBaseLast: Record<string, any> = {};

            Object.keys(padronizacaoCountsByBase).forEach(baseKey => {
                const baseData = padronizacaoCountsByBase[baseKey];

                // Inicializar a base nos dados da última visita
                padronizacaoCountsByBaseLast[baseKey] = {
                    id: baseData?.id ?? baseKey,
                    nome: baseData?.nome ?? `Base ${baseKey}`,
                    conforme: baseData?.conforme || 0,
                    parcial: baseData?.parcial || 0,
                    naoConforme: baseData?.naoConforme || 0,
                    naoAvaliado: baseData?.naoAvaliado || 0,
                    total: baseData?.total || 0
                };

                padronizacaoCategoriasByBaseLast[baseKey] = acumuladores.padronizacaoCategoriasByBase[baseKey] || {};
            });

            const padronizacaoArrLast = Object.values(padronizacaoCountsByBaseLast)
                .filter((b: any) => b.total > 0) // Só incluir bases com dados
                .map((b: any) => {
                    const t = b.total || 0;
                    const conforme = t > 0 ? Math.round((b.conforme / t) * 10000) / 100 : 0;
                    const parcial = t > 0 ? Math.round((b.parcial / t) * 10000) / 100 : 0;
                    const naoConforme = t > 0 ? Math.round((b.naoConforme / t) * 10000) / 100 : 0;
                    const naoAvaliado = t > 0 ? Math.round((b.naoAvaliado / t) * 10000) / 100 : 0;

                    // Determinar status principal
                    const maxPct = Math.max(conforme, parcial, naoConforme);
                    let statusPrincipal = 'TRUE';
                    if (maxPct === conforme) statusPrincipal = 'TRUE';
                    else if (maxPct === naoConforme) statusPrincipal = 'NAO_CONFORME';
                    if (naoAvaliado > 0 && conforme === 0 && parcial === 0 && naoConforme === 0) statusPrincipal = 'NAO_AVALIADO';

                    const categoriasObj = padronizacaoCategoriasByBaseLast[String(b.id)] || {};
                    const categoriasArr = Object.entries(categoriasObj).map(([catNome, c]) => {
                        const category = c as any;
                        const raw = {
                            conforme: Number(category.conforme || 0),
                            parcial: Number(category.parcial || 0),
                            naoConforme: Number(category.naoConforme || 0),
                            naoAvaliado: Number(category.naoAvaliado || 0)
                        };

                        if (raw.conforme === 0 && raw.parcial === 0 && raw.naoConforme === 0 && raw.naoAvaliado === 0) {
                            return {
                                categoria: catNome,
                                conforme: 0,
                                parcial: 0,
                                naoConforme: 0,
                                naoAvaliado: 0,
                                raw,
                                total: 0,
                                status: 'NAO_AVALIADO'
                            };
                        }

                        const total = category.total || (raw.conforme + raw.parcial + raw.naoConforme + raw.naoAvaliado);
                        const conformePct = total > 0 ? (raw.conforme / total) * 100 : 0;
                        const parcialPct = total > 0 ? (raw.parcial / total) * 100 : 0;
                        const naoConformePct = total > 0 ? (raw.naoConforme / total) * 100 : 0;
                        const naoAvaliadoPct = total > 0 ? (raw.naoAvaliado / total) * 100 : 0;

                        let status;
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

                        return {
                            categoria: catNome,
                            conforme: Math.round(conformePct * 100) / 100,
                            parcial: Math.round(parcialPct * 100) / 100,
                            naoConforme: Math.round(naoConformePct * 100) / 100,
                            naoAvaliado: Math.round(naoAvaliadoPct * 100) / 100,
                            raw,
                            total,
                            status
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

            setPadronizacaoByBaseLastVisit(padronizacaoArrLast);

            let totalItensConformesInspecao = 0;
            let totalItensInspecao = 0;
            let totalItensConformesPadronizacao = 0;
            let totalItensPadronizacao = 0;

            // Coletar totais de todas as bases para inspeção
            perBaseConformidade.forEach((base: any) => {
                const conformidadePorSummary = acumuladores.conformidadePorSummary?.[base.id] || [];

                conformidadePorSummary.forEach((summary: any) => {
                    summary.categorias?.forEach((categoria: any) => {
                        totalItensConformesInspecao += categoria.conforme || 0;
                        totalItensInspecao += categoria.total || 0;
                    });
                });
            });

            // Coletar totais de todas as bases para padronização
            padronizacaoArrLast.forEach((base: any) => {
                totalItensConformesPadronizacao += (base.conforme / 100) * base.totalCount;
                totalItensPadronizacao += base.totalCount;
            });

            // Calcular médias CORRETAS
            const mediaInspecao = totalItensInspecao > 0 ?
                (totalItensConformesInspecao / totalItensInspecao) * 100 : 0;

            const mediaPadronizacao = totalItensPadronizacao > 0 ?
                (totalItensConformesPadronizacao / totalItensPadronizacao) * 100 : 0;

            const indiceAprovacao = (mediaInspecao + mediaPadronizacao) / 2;
            const indiceInspecao = mediaInspecao;
            const indicePadronizacao = mediaPadronizacao;

            setPerBaseConformidade(acumuladores.perBase);
            setPadronizacaoByBaseLastVisit(padronizacaoArrLast);
            setResumo({
                totalBasesVisitadas: acumuladores.totalBasesVisitadas,
                municipiosVisitados: acumuladores.municipiosVisitados,
                datasVisitas: (acumuladores.datasVisitas || []).sort(),
                equipeTecnica: acumuladores.equipeTecnica,
                equipeTecnicaPorBase: acumuladores.equipeTecnicaPorBase || [],
                totalInconformidades: acumuladores.totalInconformidades,
                indiceAprovacao: indiceAprovacao,
                indiceInspecao: indiceInspecao,
                indicePadronizacao: indicePadronizacao,
                visitasDetalhadas: (acumuladores.visitasDetalhadas || [])
                    .sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime()),
                conformidadePorSummary: acumuladores.conformidadePorSummary || {},
            });

            await buscarRelatos(inicio, fim);

        } catch (err: any) {
            console.error('Erro ao buscar dados do período', err);
            setError(err?.message || String(err));
        } finally {
            setLoading(false);
        }
    }, [basesList, buscarRelatos]);

    const processarBase = async (
        base: any,
        relatorioData: any,
        visitas: any[],
        respostasPorVisita: Record<string, any[]>,
        inspectionForms: any[],
        padronizacaoForms: any[],
        acumuladores: any
    ) => {
        const baseKey = String(base.id);
        const baseNome = base.nome || base.baseNome || `Base ${base.id}`;

        // --- INICIALIZAR ACUMULADORES DE EQUIPE POR BASE ---
        if (!acumuladores.equipeTecnicaPorBase) {
            acumuladores.equipeTecnicaPorBase = [];
        }

        // --- INICIALIZAR ACUMULADORES DE VISITAS DETALHADAS ---
        if (!acumuladores.visitasDetalhadas) {
            acumuladores.visitasDetalhadas = [];
        }

        // --- LÓGICA INICIAL DE ACUMULADORES (sem alterações) ---
        if ((relatorioData && relatorioData.totalVisitas > 0) || (Array.isArray(visitas) && visitas.length > 0)) {
            acumuladores.totalBasesVisitadas = (acumuladores.totalBasesVisitadas || 0) + 1;
            const municipio = base.name || base.nome || base.baseNome;
            if (municipio && !acumuladores.municipiosVisitados.includes(municipio)) {
                acumuladores.municipiosVisitados.push(municipio);
            }
            if (relatorioData && Array.isArray(relatorioData.pontosCriticosGerais)) {
                relatorioData.pontosCriticosGerais.forEach((p: any) => {
                    acumuladores.totalInconformidades = (acumuladores.totalInconformidades || 0) + (p.ocorrencias || 0);
                });
            }
        }
        if (!acumuladores.padronizacaoCountsByBase[baseKey]) {
            acumuladores.padronizacaoCountsByBase[baseKey] = {
                id: base.id,
                nome: baseNome,
                conforme: 0, parcial: 0, naoConforme: 0, naoAvaliado: 0, total: 0
            };
        }
        if (!acumuladores.padronizacaoCategoriasByBase[baseKey]) {
            acumuladores.padronizacaoCategoriasByBase[baseKey] = {};
        }

        let avgConformidadeUltimaVisita: number | null = null;

        // --- ACUMULAR EQUIPE ÚNICA (para manter compatibilidade) ---
        if (!acumuladores.equipeTecnica) {
            acumuladores.equipeTecnica = [];
        }

        // --- ACUMULAR EQUIPE POR BASE ---
        let equipeDaBase: string[] = [];

        // --- ADICIONAR VISITAS DETALHADAS ---
        if (!acumuladores.visitasDetalhadas) {
            acumuladores.visitasDetalhadas = [];
        }

        visitas.forEach(visita => {
            // Usar a estrutura definida na interface VisitaResponse
            if (visita.membros && Array.isArray(visita.membros)) {
                visita.membros.forEach((membro: any) => {
                    if (membro.nome && typeof membro.nome === 'string') {
                        const nomeMembro = membro.nome.trim();
                        if (nomeMembro && !equipeDaBase.includes(nomeMembro)) {
                            equipeDaBase.push(nomeMembro);
                        }
                    }
                });
            }
        });


        // Processar cada visita para adicionar à timeline
        visitas.forEach(visita => {
            const dataVisita = visita.dataVisita || visita.createdAt || visita.data;
            if (dataVisita) {
                acumuladores.visitasDetalhadas.push({
                    data: dataVisita,
                    municipio: baseNome,
                    baseId: base.id,
                    baseNome: baseNome
                });
            }
        });



        // ======================= ENCONTRAR ÚLTIMA VISITA =======================
        const visitasOrdenadas = [...visitas].sort((a, b) => {
            const dataA = new Date(a.dataVisita || a.createdAt || 0);
            const dataB = new Date(b.dataVisita || b.createdAt || 0);
            return dataB.getTime() - dataA.getTime();
        });

        const ultimaVisita = visitasOrdenadas[0];
        const respostasUltimaVisita = ultimaVisita ? respostasPorVisita[String(ultimaVisita.id)] || [] : [];

        // ======================= CÁLCULO INSPEÇÃO - APENAS ÚLTIMA VISITA =======================
        if (ultimaVisita) {
            try {
                const resultadosHierarquicos = {
                    porFormulario: {} as {
                        [formId: number]: {
                            total: number;
                            conforme: number;
                            porcentagem: number;
                            summaryId: number;
                        }
                    },
                    porSummary: {} as {
                        [summaryId: number]: {
                            totalCampos: number;
                            totalConforme: number;
                            porcentagem: number;
                            forms: number[];
                        }
                    },
                    geral: {
                        totalCampos: 0,
                        totalConforme: 0,
                        porcentagem: 0
                    }
                };

                // 1. Calcular por formulário (INSPEÇÃO) - apenas última visita
                for (const form of inspectionForms) {
                    const checkboxFields = Array.isArray(form.campos) ?
                        form.campos.filter((c: any) => c.tipo === 'CHECKBOX') : [];

                    if (checkboxFields.length === 0) continue;

                    let totalCampos = 0;
                    let camposConformes = 0;

                    for (const field of checkboxFields) {
                        if (!field.id) continue;

                        const ans = respostasUltimaVisita.find((r: any) =>
                            String(r.campoId) === String(field.id) ||
                            String((r as any).fieldId) === String(field.id)
                        );

                        totalCampos += 1;

                        if (ans) {
                            const val = (ans.checkbox ?? (ans as any).value ?? (ans as any).answer);
                            const isConforme = val === true || String(val).toUpperCase() === 'TRUE';

                            if (isConforme) {
                                camposConformes += 1;
                            }
                        }
                    }

                    const porcentagemForm = totalCampos > 0 ? (camposConformes / totalCampos) * 100 : 0;

                    resultadosHierarquicos.porFormulario[form.id] = {
                        total: totalCampos,
                        conforme: camposConformes,
                        porcentagem: porcentagemForm,
                        summaryId: form.summaryId
                    };

                    if (!resultadosHierarquicos.porSummary[form.summaryId]) {
                        resultadosHierarquicos.porSummary[form.summaryId] = {
                            totalCampos: 0,
                            totalConforme: 0,
                            porcentagem: 0,
                            forms: []
                        };
                    }
                    resultadosHierarquicos.porSummary[form.summaryId].forms.push(form.id);

                    resultadosHierarquicos.porSummary[form.summaryId].totalCampos += totalCampos;
                    resultadosHierarquicos.porSummary[form.summaryId].totalConforme += camposConformes;
                }

                // 2. Calcular por summary
                for (const [summaryId, summary] of Object.entries(resultadosHierarquicos.porSummary)) {
                    const numSummaryId = Number(summaryId);
                    resultadosHierarquicos.porSummary[numSummaryId].porcentagem =
                        summary.totalCampos > 0 ? (summary.totalConforme / summary.totalCampos) * 100 : 0;

                    resultadosHierarquicos.geral.totalCampos += summary.totalCampos;
                    resultadosHierarquicos.geral.totalConforme += summary.totalConforme;
                }

                // 3. CALCULAR MÉDIA DOS SUMMARIES (CORREÇÃO)
                const summaries = Object.values(resultadosHierarquicos.porSummary);
                if (summaries.length > 0) {
                    const somaPorcentagens = summaries.reduce((acc, summary: any) => acc + summary.porcentagem, 0);
                    resultadosHierarquicos.geral.porcentagem = somaPorcentagens / summaries.length;

                } else {
                    resultadosHierarquicos.geral.porcentagem = 0;
                }

                avgConformidadeUltimaVisita = resultadosHierarquicos.geral.porcentagem;

                if (avgConformidadeUltimaVisita > 0) {
                    if (!acumuladores.mediasConformidade) {
                        acumuladores.mediasConformidade = [];
                    }
                    acumuladores.mediasConformidade.push(avgConformidadeUltimaVisita);
                }

                // Preparar dados para exibição detalhada
                const conformidadeSummaryBase: ConformidadeSummary[] = [];

                for (const [summaryId, summaryData] of Object.entries(resultadosHierarquicos.porSummary)) {
                    const numSummaryId = Number(summaryId);
                    const summary = PREDEFINED_SUMMARIES.find(s => s.id === numSummaryId);

                    // Buscar categorias (forms) deste summary
                    const categoriasDoSummary = inspectionForms
                        .filter(form => form.summaryId === numSummaryId)
                        .map(form => {
                            const formData = resultadosHierarquicos.porFormulario[form.id];
                            return {
                                nome: form.categoria || `Form ${form.id}`,
                                conforme: formData?.conforme || 0,
                                total: formData?.total || 0,
                                porcentagem: formData?.porcentagem || 0
                            };
                        });

                    conformidadeSummaryBase.push({
                        summaryId: numSummaryId,
                        summaryNome: summary?.titulo || `Summary ${summaryId}`,
                        porcentagem: summaryData.porcentagem,
                        categorias: categoriasDoSummary
                    });
                }

                // Armazenar no acumulador
                if (!acumuladores.conformidadePorSummary) {
                    acumuladores.conformidadePorSummary = {};
                }
                acumuladores.conformidadePorSummary[base.id] = conformidadeSummaryBase;

            } catch (err) {
                console.warn('Erro processando INSPECAO para última visita', ultimaVisita.id, err);
                avgConformidadeUltimaVisita = 0;
            }
        } else {
            avgConformidadeUltimaVisita = 0;
        }

        // Processar padronização para a última visita
        if (ultimaVisita) {
            try {
                const respostasUltimaVisita = respostasPorVisita[String(ultimaVisita.id)] || [];

                // Inicializar acumuladores para esta base
                if (!acumuladores.padronizacaoCountsByBase[baseKey]) {
                    acumuladores.padronizacaoCountsByBase[baseKey] = {
                        id: base.id,
                        nome: baseNome,
                        conforme: 0,
                        parcial: 0,
                        naoConforme: 0,
                        naoAvaliado: 0,
                        total: 0
                    };
                }

                const b = acumuladores.padronizacaoCountsByBase[baseKey];

                // Resetar contadores
                b.conforme = 0;
                b.parcial = 0;
                b.naoConforme = 0;
                b.naoAvaliado = 0;
                b.total = 0;

                // Inicializar categorias
                if (!acumuladores.padronizacaoCategoriasByBase[baseKey]) {
                    acumuladores.padronizacaoCategoriasByBase[baseKey] = {};
                }

                let totalCamposProcessados = 0;

                for (const form of padronizacaoForms) {
                    const checkboxFields = Array.isArray(form.campos) ? form.campos.filter((c: any) => c.tipo === 'CHECKBOX') : [];

                    if (checkboxFields.length === 0) continue;

                    const categoriaNome = form.categoria ?? form.category ?? 'Sem categoria';
                    if (!acumuladores.padronizacaoCategoriasByBase[baseKey][categoriaNome]) {
                        acumuladores.padronizacaoCategoriasByBase[baseKey][categoriaNome] = {
                            conforme: 0, parcial: 0, naoConforme: 0, naoAvaliado: 0, total: 0
                        };
                    }

                    const cat = acumuladores.padronizacaoCategoriasByBase[baseKey][categoriaNome];

                    for (const field of checkboxFields) {
                        if (!field.id) continue;

                        const ans = respostasUltimaVisita.find((r: any) =>
                            String(r.campoId) === String(field.id) ||
                            String(r.fieldId) === String(field.id)
                        );

                        // Contar sempre
                        b.total += 1;
                        cat.total += 1;
                        totalCamposProcessados += 1;

                        if (!ans) {
                            b.naoAvaliado += 1;
                            cat.naoAvaliado += 1;
                            continue;
                        }

                        const val = (ans.checkbox ?? ans.value ?? ans.answer ?? null);

                        if (val === null || val === undefined) {
                            b.naoAvaliado += 1;
                            cat.naoAvaliado += 1;
                        } else {
                            const isConforme = val === true || String(val).toUpperCase() === 'TRUE';

                            if (isConforme) {
                                b.conforme += 1;
                                cat.conforme += 1;
                            } else {
                                b.naoConforme += 1;
                                cat.naoConforme += 1;
                            }
                        }
                    }
                }

            } catch (err) {
                console.warn('❌ Erro processando PADRONIZACAO para', baseNome, err);
            }
        } else {
            console.log(`   ⚠️  Sem última visita para processar padronização em ${baseNome}`);
        }


        // --- ADICIONAR EQUIPE DA BASE AO ACUMULADOR ---
        if (equipeDaBase.length > 0) {
            // Remover duplicatas finais
            equipeDaBase = [...new Set(equipeDaBase)];

            const existingIndex = acumuladores.equipeTecnicaPorBase.findIndex(
                (item: any) => item.baseNome === baseNome
            );

            if (existingIndex >= 0) {
                // Se já existe, mesclar as equipes
                const existingEquipe = acumuladores.equipeTecnicaPorBase[existingIndex].equipe;
                equipeDaBase.forEach(membro => {
                    if (!existingEquipe.includes(membro)) {
                        existingEquipe.push(membro);
                    }
                });
                // Remover duplicatas após o merge
                acumuladores.equipeTecnicaPorBase[existingIndex].equipe = [...new Set(existingEquipe)];
            } else {
                // Se não existe, criar nova entrada
                acumuladores.equipeTecnicaPorBase.push({
                    baseNome: baseNome,
                    equipe: equipeDaBase
                });
            }
        } else {
            console.log(`⚠️  Nenhuma equipe encontrada para base ${baseNome}`);
        }

        // --- ADICIONAR CONFORMIDADE DA BASE ---
        if (avgConformidadeUltimaVisita !== null) {
            acumuladores.perBase.push({
                id: base.id,
                nome: base.nome,
                avg: avgConformidadeUltimaVisita
            });
        } else {
            const visitouMasNaoInspecionou = visitas.length > 0;
            if (visitouMasNaoInspecionou && !acumuladores.perBase.some((p: any) => p.id === base.id)) {
                acumuladores.perBase.push({ id: base.id, nome: base.nome, avg: 0 });
            }
        }
    };

    const fetchStatusViaturasPorBase = useCallback(async (selectedMunicipio?: string, dateFim?: Date, dateInicio?: Date) => {
        setLoadingViaturas(true);
        try {
            let baseId;
            if (selectedMunicipio) {
                const basesToProcess = basesList.filter(b => !selectedMunicipio || b.nome === selectedMunicipio || b.id === Number(selectedMunicipio));
                baseId = basesToProcess[0]?.id;
            }

            // Função para formatar a data para YYYY-MM-DD
            const formatarData = (data: Date) => {
                if (!data) return '';
                return data.toISOString().split('T')[0];
            };
            var dataInicioFormatada;
            var dataFimFormatada

            if (dateInicio && dateFim && dateInicio < dateFim) {
                dataInicioFormatada = formatarData(dateInicio);
                dataFimFormatada = formatarData(dateFim);
            } else {
                dataInicioFormatada = formatarData(new Date("2001-01-01"));
                dataFimFormatada = formatarData(new Date());
            }

            const viaturasData = await fetchJsonSafe(
                `/api/viatura/api?baseId=${baseId || 0}&data_inicio=${dataInicioFormatada}&data_final=${dataFimFormatada}`
            );
            const viaturas = Array.isArray(viaturasData) ? viaturasData : [];

            const dataLimite = dateFim ? new Date(dateFim) : new Date();
            const dataInicio = dateInicio ? new Date(dateInicio) : new Date();

            const viaturasPorBaseLocal: Record<number, Viatura[]> = {};
            const statusPorBase: ViaturaStatusPorBase[] = [];
            const basesComChecklist: number[] = [];

            // Agrupar viaturas por base
            viaturas.forEach((v: Viatura) => {
                if (v.idBase) {
                    viaturasPorBaseLocal[v.idBase] = viaturasPorBaseLocal[v.idBase] || [];
                    viaturasPorBaseLocal[v.idBase].push(v);
                }
            });

            Object.entries(viaturasPorBaseLocal).forEach(([baseId, viaturasDaBase]) => {
                const base = basesList.find(b => b.id === Number(baseId));
                const baseNome = base ? base.nome : `Base ${baseId}`;

                // Status simplificado - apenas operacional e indefinido
                const statusCount = { operacional: 0, indefinido: 0 };

                let baseTemChecklistRecente = false;

                viaturasDaBase.forEach(viatura => {

                    if (viatura.statusOperacional.toUpperCase() === 'OPERACIONAL') {
                        statusCount.operacional += 1;
                    } else {
                        statusCount.indefinido += 1;
                    }

                    const dataAlteracao = new Date(viatura.dataUltimaAlteracao);
                    const km = Number(viatura.km?.replace("km", '') || 0);

                    if (dataAlteracao <= dataLimite && dataAlteracao >= dataInicio) {
                        baseTemChecklistRecente = true;
                    }
                });

                statusPorBase.push({ baseId: Number(baseId), baseNome, status: statusCount });

                if (baseTemChecklistRecente) {
                    basesComChecklist.push(Number(baseId));
                }
            });

            setViaturaStatusPorBase(statusPorBase);
            setViaturasPorBase(viaturasPorBaseLocal);
            setBasesComChecklist(basesComChecklist);

        } catch (err: any) {
            console.error('Erro ao buscar status das viaturas:', err);
            setError(String(err));
        } finally {
            setLoadingViaturas(false);
        }
    }, [basesList]);

    useEffect(() => { fetchBases(); }, [fetchBases]);
    useEffect(() => { }, [basesList, fetchStatusViaturasPorBase]);

    return {
        basesList, bases, relatos, resumo, perBaseConformidade, padronizacaoByBaseLastVisit,
        viaturaStatusPorBase, viaturasPorBase, basesComChecklist, loading, loadingViaturas, error,
        fetchBases, buscarDadosPeriodo, fetchStatusViaturasPorBase
    };
}