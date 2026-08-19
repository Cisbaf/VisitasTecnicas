import { useMemo, useState } from "react";
import fetchJsonSafe from "../dashboard/hooks/fetchJsonSafe";

interface MediaProntidao {
    [cidade: string]: string;
}

interface MediaTempos {
    [cidade: string]: string;
}
export interface RelatorioVtr {
    cidade: string;
    vtr: VTR[],
    ativa: number;

}
interface VTR {
    ativa: string,
    placa: string,
    CNES?: string,
    cnes?: string,
    viatura: string,
}

interface CidadeData {
    cidade: string;
    tempoRespostaMedio: string;
    tempoProntidaoMedio: string;
}

export function useIndicadores(isDashboard?: boolean) {

    const [loading, setLoading] = useState(false);
    const [mediaProntidao, setMediaProntidao] = useState<MediaProntidao>({});
    const [mediaTempos, setMediaTempos] = useState<MediaTempos>({});
    const [relatorioVtr, setRelatorioVtr] = useState<RelatorioVtr[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMonth, setSelectedMonth] = useState<string>("");

    const fetchMedias = async (month?: string) => {
        setLoading(true);
        const targetMonth = month !== undefined ? month : selectedMonth;
        const query = targetMonth ? `?mes=${targetMonth}-01` : "";

        try {
            const [prontidaoData, temposData, vtrData] = await Promise.all([
                fetchJsonSafe(`/api/inspecao/media/prontidao${query}`),
                fetchJsonSafe(`/api/inspecao/media/tempos${query}`),
                fetchJsonSafe(isDashboard ? `/api/inspecao/media/vtr${query}` : `/api/inspecao/vtr${query}`),
            ]);

            setMediaProntidao(prontidaoData ?? {});
            setMediaTempos(temposData ?? {});
            setRelatorioVtr(Array.isArray(vtrData) ? vtrData : []);

        } catch (error) {
            console.error("Erro ao carregar médias:", error);
            // Limpa os estados em caso de erro crítico
            setMediaProntidao({});
            setMediaTempos({});
            setRelatorioVtr([]);
        } finally {
            setLoading(false);
        }
    };

    const strip = (s: string) => s.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();


    // Combinar os dados das duas planilhas
    const dadosCombinados = useMemo((): CidadeData[] => {
        const todasCidades = new Set([
            ...Object.keys(mediaProntidao),
            ...Object.keys(mediaTempos),
            ...relatorioVtr.map(v => v.cidade.toUpperCase())   // ⭐ ADICIONE ISSO
        ]);

        todasCidades.delete("FORA DE ABRANGÊNCIA");

        return Array.from(todasCidades)
            .map(cidade => ({
                cidade,
                tempoRespostaMedio: mediaTempos[cidade] ?? "N/A",
                tempoProntidaoMedio: mediaProntidao[cidade] ?? "N/A"
            }))
            .sort((a, b) => a.cidade.localeCompare(b.cidade));
    }, [mediaProntidao, mediaTempos, relatorioVtr]);

    // Filtrar dados baseado no searchTerm
    const dadosFiltrados = useMemo(() => {

        if (!searchTerm) return dadosCombinados;

        const term = strip(searchTerm.toLowerCase());
        return dadosCombinados.filter(item => {
            const cidade = strip(item.cidade.toLowerCase());

            return cidade.includes(term);

        });
    }, [dadosCombinados, searchTerm]);

    const vtrFiltradas = useMemo(() => {
        if (!searchTerm) return relatorioVtr;



        const term = strip(searchTerm.toLowerCase());
        let filter;


        filter = relatorioVtr.filter(item =>
            strip(item.cidade.toLowerCase()).includes(term)
        );
        return filter != null ? filter : relatorioVtr;

    }, [relatorioVtr, searchTerm]);


    return {
        loading,
        mediaProntidao,
        mediaTempos,
        dadosCombinados,
        dadosFiltrados,
        searchTerm,
        setSearchTerm,
        vtrFiltradas,
        fetchMedias,
        selectedMonth,
        setSelectedMonth
    };
}
