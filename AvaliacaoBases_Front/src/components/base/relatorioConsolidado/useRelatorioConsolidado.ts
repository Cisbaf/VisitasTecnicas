import { useEffect, useState, useMemo } from "react";
import { BaseResponse, RelatorioConsolidadoResponse, ViaturaDTO } from "@/components/types";
import { format } from "date-fns";

// Hook personalizado para gerenciar a lógica do relatório
export default function useRelatorioConsolidado(baseId: number) {
    const [isClient, setIsClient] = useState(false);
    const [relatorio, setRelatorio] = useState<RelatorioConsolidadoResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [dataInicio, setDataInicio] = useState<Date | null>(null);
    const [dataFim, setDataFim] = useState<Date | null>(null);

    const [baseName, setBaseName] = useState<BaseResponse | null>(null);

    // Efeito para inicializar o estado no lado do cliente
    useEffect(() => {
        setIsClient(true);
        const fim = new Date();
        const inicio = new Date();
        inicio.setDate(inicio.getDate() - 9000); // 30 dias atrás
        setDataInicio(inicio);
        setDataFim(fim);
    }, []);

    // Efeito para buscar dados sempre que as datas ou a baseId mudarem
    useEffect(() => {
        if (!isClient) return;
        if (dataInicio && dataFim) {
            buscarRelatorio();
        }

        const localKey = `baseData_${baseId}`;
        const localData = typeof window !== "undefined" ? localStorage.getItem(localKey) : null;
        if (localData) {
            const data = JSON.parse(localData);
            setBaseName(data);
        }

    }, [dataInicio, dataFim, baseId, isClient]);

    // Função para buscar o relatório
    const buscarRelatorio = async () => {
        if (!dataInicio || !dataFim) return;
        try {
            setLoading(true);
            setError(null);

            // Usar date-fns format em vez de dayjs
            const formatoData = (data: Date) => format(data, "yyyy-MM-dd");
            const inicioStr = formatoData(dataInicio);
            const fimStr = formatoData(dataFim);

            const res = await fetch(
                `/api/relatorios/consolidado/${baseId}?inicio=${inicioStr}&fim=${fimStr}`,
                { cache: "no-store" }
            );

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                let msg = "Falha ao carregar relatório";
                try {
                    const parsed = txt ? JSON.parse(txt) : null;
                    if (parsed?.message) msg = parsed.message;
                    else if (txt) msg = txt;
                } catch { msg = txt || msg; }
                throw new Error(msg);
            }

            const texto = await res.text();
            if (!texto) {
                setRelatorio(null);
                return;
            }

            const dados: RelatorioConsolidadoResponse = JSON.parse(texto);
            console.log("Relatório carregado:", dados);
            setRelatorio(dados);
        } catch (err: any) {
            console.error("Erro buscarRelatorio:", err);
            setError(err?.message || "Erro desconhecido ao buscar relatório");
        } finally {
            setLoading(false);
        }
    };

    // Memoização para agrupar as viaturas críticas
    const viaturasCriticasAgrupadas = useMemo(() => {
        if (!relatorio?.viaturasCriticas) {
            return [];
        }

        const viaturasPorPlaca = relatorio.viaturasCriticas.reduce((acc, viatura) => {
            if (!viatura.placa) return acc;

            if (!acc[viatura.placa]) {
                acc[viatura.placa] = { ...viatura };
            }
            return acc;
        }, {} as Record<string, ViaturaDTO>);

        return Object.values(viaturasPorPlaca);
    }, [relatorio]);

    return {
        relatorio,
        loading,
        error,
        dataInicio,
        dataFim,
        setDataInicio,
        setDataFim,
        buscarRelatorio,
        viaturasCriticasAgrupadas
    };
}