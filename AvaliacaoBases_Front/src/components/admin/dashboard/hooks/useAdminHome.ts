import { useCallback, useEffect, useState } from 'react';
import fetchJsonSafe from './fetchJsonSafe';
import { RelatoDTO, Viatura } from '@/components/types';

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
    equipeTecnicaPorBase: { baseNome: string; equipePorData?: { data: string; membros: string[] }[]; equipe?: string[] }[];
    totalInconformidades: number;
    indiceAprovacao: number;
    indiceInspecao: number;
    indicePadronizacao: number;
    visitasDetalhadas: {
        id: number;
        data: string;
        municipio?: string;
        baseId: number;
        baseNome: string;
        tipo?: string;
        periodo?: string;
        relatos: RelatoDTO[];
    }[];
    conformidadePorSummary: Record<number, ConformidadeSummary[]>;
    camposNaoConformes: Record<number, any[]>;
}

export interface ViaturaStatusPorBase {
    baseId: number;
    baseNome: string;
    status: {
        operacional: number;
        indefinido: number;
    };
}

interface DashboardResponse {
    resumo: ResumoVisitas;
    perBaseConformidade: { id: number; nome: string; avg: number }[];
    padronizacaoByBaseLastVisit: any[];
    relatos: RelatoDTO[];
}

const formatDateParam = (date: Date) => date.toISOString().split('T')[0];
const addDaysToDate = (date: Date, days: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
};
const isForbiddenError = (error: unknown) => String(error instanceof Error ? error.message : error).includes('HTTP 403');

export function useAdminHome() {
    const [basesList, setBasesList] = useState<any[]>([]);
    const [bases, setBases] = useState<string[]>([]);
    const [relatos, setRelatos] = useState<RelatoDTO[]>([]);
    const [resumo, setResumo] = useState<ResumoVisitas | null>(null);
    const [perBaseConformidade, setPerBaseConformidade] = useState<{ id: any; nome: string; avg: number }[]>([]);
    const [padronizacaoByBaseLastVisit, setPadronizacaoByBaseLastVisit] = useState<any[]>([]);
    const [viaturaStatusPorBase, setViaturaStatusPorBase] = useState<ViaturaStatusPorBase[]>([]);
    const [viaturasPorBase, setViaturasPorBase] = useState<Record<number, Viatura[]>>({});
    const [loading, setLoading] = useState(false);
    const [loadingViaturas, setLoadingViaturas] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [basesComChecklist, setBasesComChecklist] = useState<number[]>([]);

    const fetchBases = useCallback(async () => {
        try {
            const data = await fetchJsonSafe('/api/base');
            const basesData = Array.isArray(data) ? data : [];
            setBasesList(basesData);
            setBases([...new Set(basesData.map((base: any) => base.nome).filter(Boolean))] as string[]);
            localStorage.setItem('allBasesData', JSON.stringify(basesData));
        } catch (err: any) {
            console.error('fetchBases error:', err);
            setError(String(err?.message || err));
        }
    }, []);

    const buscarDadosPeriodo = useCallback(async (selectedMunicipio: string, inicio: Date | null, fim: Date | null) => {
        if (!inicio || !fim) return;

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                inicio: formatDateParam(inicio),
                fim: formatDateParam(fim),
            });
            const selectedBase = basesList.find(
                (base) => base.nome === selectedMunicipio || base.id === Number(selectedMunicipio)
            );

            if (selectedBase?.id) {
                params.set('baseId', String(selectedBase.id));
            }

            const dashboard = await fetchJsonSafe(`/api/relatorios/dashboard?${params.toString()}`) as DashboardResponse;

            setRelatos(Array.isArray(dashboard?.relatos) ? dashboard.relatos : []);
            setResumo(dashboard?.resumo ?? null);
            setPerBaseConformidade(Array.isArray(dashboard?.perBaseConformidade) ? dashboard.perBaseConformidade : []);
            setPadronizacaoByBaseLastVisit(
                Array.isArray(dashboard?.padronizacaoByBaseLastVisit) ? dashboard.padronizacaoByBaseLastVisit : []
            );
        } catch (err: any) {
            console.error('Erro ao buscar dados do período', err);
            setError(err?.message || String(err));
        } finally {
            setLoading(false);
        }
    }, [basesList]);

    const fetchStatusViaturasPorBase = useCallback(async (selectedMunicipio?: string, dateFim?: Date, dateInicio?: Date) => {
        setLoadingViaturas(true);
        setViaturaStatusPorBase([]);
        setViaturasPorBase({});
        setBasesComChecklist([]);

        try {
            const selectedBase = selectedMunicipio
                ? basesList.find((base) => base.nome === selectedMunicipio || base.id === Number(selectedMunicipio))
                : null;
            const dataFinal = dateFim ? new Date(dateFim) : new Date();
            const dataInicialInformada = dateInicio && dateInicio < dataFinal ? new Date(dateInicio) : addDaysToDate(dataFinal, -90);
            const dataInicialApi = dataInicialInformada.getFullYear() < 2020
                ? addDaysToDate(dataFinal, -90)
                : dataInicialInformada;
            const dataInicioFormatada = formatDateParam(dataInicialApi);
            const dataFimFormatada = formatDateParam(dataFinal);

            let viaturasData;
            try {
                viaturasData = await fetchJsonSafe(
                    `/api/viatura/api?baseId=${selectedBase?.id || 0}&data_inicio=${dataInicioFormatada}&data_final=${dataFimFormatada}`
                );
            } catch (externalErr) {
                console.warn('API externa de viaturas indisponível, usando cadastro local:', externalErr);
                try {
                    viaturasData = await fetchJsonSafe(selectedBase?.id ? `/api/viatura/base/${selectedBase.id}` : '/api/viatura');
                } catch (localErr) {
                    if (isForbiddenError(localErr)) {
                        console.warn('Usuário sem permissão para consultar cadastro local de viaturas.');
                        return;
                    }
                    throw localErr;
                }
            }
            const viaturas = Array.isArray(viaturasData) ? viaturasData : [];
            const dataLimite = dateFim ? new Date(dateFim) : new Date();
            const dataInicio = dateInicio ? new Date(dateInicio) : new Date();
            const viaturasPorBaseLocal: Record<number, Viatura[]> = {};
            const statusPorBase: ViaturaStatusPorBase[] = [];
            const basesComChecklistLocal: number[] = [];
            const basesEscopo = selectedBase ? [selectedBase] : basesList;

            viaturas.forEach((viatura: Viatura) => {
                if (!viatura.idBase) return;
                viaturasPorBaseLocal[viatura.idBase] = viaturasPorBaseLocal[viatura.idBase] || [];
                viaturasPorBaseLocal[viatura.idBase].push(viatura);
            });

            basesEscopo.forEach((base) => {
                const viaturasDaBase = viaturasPorBaseLocal[base.id] || [];
                const statusCount = { operacional: 0, indefinido: 0 };
                let baseTemChecklistRecente = false;

                viaturasDaBase.forEach((viatura) => {
                    if (viatura.statusOperacional?.toUpperCase() === 'OPERACIONAL') {
                        statusCount.operacional += 1;
                    } else {
                        statusCount.indefinido += 1;
                    }

                    const dataAlteracao = new Date(viatura.dataUltimaAlteracao);
                    if (dataAlteracao <= dataLimite && dataAlteracao >= dataInicio) {
                        baseTemChecklistRecente = true;
                    }
                });

                statusPorBase.push({
                    baseId: Number(base.id),
                    baseNome: base?.nome ?? `Base ${base.id}`,
                    status: statusCount,
                });

                if (baseTemChecklistRecente) {
                    basesComChecklistLocal.push(Number(base.id));
                }
            });

            setViaturaStatusPorBase(statusPorBase);
            setViaturasPorBase(viaturasPorBaseLocal);
            setBasesComChecklist(basesComChecklistLocal);
        } catch (err: any) {
            console.error('Erro ao buscar status das viaturas:', err);
            setViaturaStatusPorBase([]);
            setViaturasPorBase({});
            setBasesComChecklist([]);
        } finally {
            setLoadingViaturas(false);
        }
    }, [basesList]);

    useEffect(() => { fetchBases(); }, [fetchBases]);

    return {
        basesList, bases, relatos, resumo, perBaseConformidade, padronizacaoByBaseLastVisit,
        viaturaStatusPorBase, viaturasPorBase, basesComChecklist, loading, loadingViaturas, error,
        fetchBases, buscarDadosPeriodo, fetchStatusViaturasPorBase
    };
}
