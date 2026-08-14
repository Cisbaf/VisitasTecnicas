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

        try {
            const selectedBase = selectedMunicipio
                ? basesList.find((base) => base.nome === selectedMunicipio || base.id === Number(selectedMunicipio))
                : null;
            const dataInicioFormatada = dateInicio && dateFim && dateInicio < dateFim
                ? formatDateParam(dateInicio)
                : formatDateParam(new Date('2001-01-01'));
            const dataFimFormatada = dateInicio && dateFim && dateInicio < dateFim
                ? formatDateParam(dateFim)
                : formatDateParam(new Date());

            const viaturasData = await fetchJsonSafe(
                `/api/viatura/api?baseId=${selectedBase?.id || 0}&data_inicio=${dataInicioFormatada}&data_final=${dataFimFormatada}`
            );
            const viaturas = Array.isArray(viaturasData) ? viaturasData : [];
            const dataLimite = dateFim ? new Date(dateFim) : new Date();
            const dataInicio = dateInicio ? new Date(dateInicio) : new Date();
            const viaturasPorBaseLocal: Record<number, Viatura[]> = {};
            const statusPorBase: ViaturaStatusPorBase[] = [];
            const basesComChecklistLocal: number[] = [];

            viaturas.forEach((viatura: Viatura) => {
                if (!viatura.idBase) return;
                viaturasPorBaseLocal[viatura.idBase] = viaturasPorBaseLocal[viatura.idBase] || [];
                viaturasPorBaseLocal[viatura.idBase].push(viatura);
            });

            Object.entries(viaturasPorBaseLocal).forEach(([baseId, viaturasDaBase]) => {
                const base = basesList.find((item) => item.id === Number(baseId));
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
                    baseId: Number(baseId),
                    baseNome: base?.nome ?? `Base ${baseId}`,
                    status: statusCount,
                });

                if (baseTemChecklistRecente) {
                    basesComChecklistLocal.push(Number(baseId));
                }
            });

            setViaturaStatusPorBase(statusPorBase);
            setViaturasPorBase(viaturasPorBaseLocal);
            setBasesComChecklist(basesComChecklistLocal);
        } catch (err: any) {
            console.error('Erro ao buscar status das viaturas:', err);
            setError(String(err?.message || err));
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
