// hooks/useWordCloud.ts
import { useMemo } from 'react';

export interface WordData {
    text: string;
    value: number;
    count: number;
}

export function useWordCloud(relatos: any[], maxWords: number = 50) {
    return useMemo(() => {
        if (!relatos || relatos.length === 0) return [];

        // Juntar todas as mensagens
        const allText = relatos.map(r => r.mensagem).join(' ').toLowerCase();

        // Tokenizar palavras (separar e limpar)
        const words = allText
            .split(/\s+/) // separar por espaços
            .map(word => word.replace(/[.,!?;:()"'-]/g, '')) // remover pontuação
            .filter(word =>
                word.length > 3 && // palavras com mais de 3 letras
                !isStopWord(word) // remover palavras comuns
            )
            .filter(Boolean); // remover strings vazias

        // Contar frequência
        const frequency: Record<string, number> = {};
        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });

        // Converter para array e ordenar
        const wordArray = Object.entries(frequency)
            .map(([text, count]) => ({ text, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, maxWords);

        // Calcular valores normalizados para tamanho
        const maxCount = Math.max(...wordArray.map(w => w.count));
        const minCount = Math.min(...wordArray.map(w => w.count));

        return wordArray.map(word => ({
            ...word,
            value: ((word.count - minCount) / (maxCount - minCount)) * 100 + 20 // valor entre 20-120
        }));
    }, [relatos, maxWords]);
}

// Lista de palavras comuns para filtrar (stop words em português)
function isStopWord(word: string): boolean {
    const stopWords = [
        'a', 'acima', 'abaixo', 'além', 'ante', 'após', 'aquela', 'aquelas', 'aquele', 'aqueles', 'aquilo', 'as', 'até',
        'atrás', 'através', 'cada', 'com', 'contra', 'da', 'dar', 'dando', 'dado', 'de', 'desde', 'dessa', 'dessas', 'desse',
        'desses', 'desta', 'destas', 'deste', 'destes', 'deve', 'devem', 'devesse', 'devessem', 'devia', 'deviam', 'deverá',
        'deverão', 'deveria', 'deveriam', 'diante', 'do', 'e', 'é', 'em', 'enquanto', 'então', 'entretanto', 'era', 'eram',
        'essa', 'essas', 'esse', 'esses', 'esta', 'estas', 'este', 'esteja', 'estejam', 'estes', 'está', 'estão', 'estava',
        'estavam', 'estará', 'estarão', 'estaria', 'estariam', 'esteve', 'estiveram', 'estivesse', 'estivessem', 'foi', 'for',
        'forem', 'fosse', 'fossem', 'faz', 'fazem', 'fazia', 'faziam', 'faça', 'façam', 'fará', 'farão', 'faria', 'fariam',
        'fazer', 'fazendo', 'feito', 'ficado', 'ficam', 'ficando', 'ficar', 'ficará', 'ficarão', 'ficaria', 'ficariam',
        'ficaram', 'ficasse', 'ficassem', 'ficava', 'ficavam', 'fica', 'ficou', 'fique', 'fiquem', 'foi', 'for', 'forem',
        'fosse', 'fossem', 'fizeram', 'fizesse', 'fizessem', 'houve', 'houvesse', 'houvessem', 'há', 'haja', 'hajam', 'havia',
        'indo', 'ir', 'isso', 'isto', 'la', 'las', 'lo', 'los', 'mas', 'na', 'nas', 'no', 'nos', 'o', 'onde', 'os', 'outra',
        'outras', 'outro', 'outros', 'por', 'pela', 'pelas', 'pelo', 'pelos', 'porém', 'porque', 'porquê', 'porquês', 'pode',
        'podem', 'podia', 'podiam', 'poder', 'poderá', 'poderão', 'poderia', 'poderiam', 'podendo', 'podido', 'possa', 'possam',
        'pudesse', 'pudessem', 'qual', 'quais', 'qualquer', 'quaisquer', 'quando', 'querendo', 'querer', 'querido', 'sabendo',
        'saber', 'sabido', 'se', 'sem', 'ser', 'sendo', 'seu', 'seus', 'sobre', 'sua', 'suas', 'são', 'tal', 'tais', 'tem',
        'têm', 'tenha', 'tenham', 'tendo', 'ter', 'terá', 'terão', 'teria', 'teriam', 'teve', 'tido', 'tiveram', 'tivesse',
        'tivessem', 'trás', 'um', 'uma', 'umas', 'uns', 'vendo', 'ver', 'vindo', 'visto', 'vir'
    ];

    return stopWords.includes(word.toLowerCase());
}