import { useEffect, useMemo, useState } from "react";

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
    CNES: string,
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

    const fetchMedias = async () => {
        setLoading(true);
        try {
            const [prontidaoResponse, temposResponse, vtrResponse] = await Promise.all([
                fetch("/api/inspecao/media/prontidao"),
                fetch("/api/inspecao/media/tempos"),
                fetch(isDashboard ? "/api/inspecao/media/vtr" : "/api/inspecao/vtr"),
            ]);



            if (prontidaoResponse.ok && prontidaoResponse.status !== 204) {

                const prontidaoData = await prontidaoResponse.json();
                console.log("Prontidão: ", prontidaoData)

                setMediaProntidao(prontidaoData);
            }

            if (temposResponse.ok && prontidaoResponse.status !== 204) {
                const temposData = await temposResponse.json();
                console.log("Tempos: ", temposData)

                setMediaTempos(temposData);
            }
            if (vtrResponse.ok && prontidaoResponse.status !== 204) {
                const vtrData = await vtrResponse.json();
                console.log("VTR: ", vtrData)

                setRelatorioVtr(vtrData);
            }

        } catch (error) {
            console.error("Erro ao carregar médias:", error);
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
        fetchMedias
    };
}