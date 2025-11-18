// WordcloudD3.tsx - Versão com cores fixas e palavras importantes no centro
import React, { useMemo, useRef, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { RelatoDTO } from '@/components/types';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

interface WordcloudRelatosProps {
  relatos: RelatoDTO[];
  height?: number;
  showEstatisticas?: boolean;
}

// Lista de stop words em português
const STOP_WORDS = new Set([
  'que', 'com', 'para', 'por', 'uma', 'umas', 'uns', 'uma', 'um', 'os', 'as', 'o', 'a',
  'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 'se', 'ao', 'aos',
  'entre', 'sobre', 'sob', 'ante', 'após', 'até', 'com', 'contra', 'desde', 'em', 'entre',
  'para', 'perante', 'por', 'sem', 'sob', 'sobre', 'trás', 'durante', 'mediante', 'exceto',
  'salvo', 'segundo', 'conforme', 'consoante', 'mas', 'porém', 'todavia', 'contudo', 'entretanto',
  'logo', 'portanto', 'assim', 'pois', 'porque', 'que', 'como', 'quando', 'onde', 'qual',
  'quais', 'quem', 'cujo', 'cuja', 'cujos', 'cujas', 'este', 'esta', 'estes', 'estas',
  'esse', 'essa', 'esses', 'essas', 'aquele', 'aquela', 'aqueles', 'aquelas', 'isto', 'isso',
  'aquilo', 'tem', 'têm', 'ter', 'tinha', 'tinham', 'terá', 'terão', 'teria', 'teriam',
  'foi', 'foram', 'era', 'eram', 'será', 'serão', 'seria', 'seriam', 'estar', 'está',
  'estão', 'estava', 'estavam', 'estará', 'estarão', 'estaria', 'estariam', 'ficar', 'fica',
  'ficam', 'ficava', 'ficavam', 'ficará', 'ficarão', 'ficaria', 'ficariam', 'sendo', 'são',
  'seu', 'sua', 'seus', 'suas', 'meu', 'minha', 'meus', 'minhas', 'teu', 'tua', 'teus', 'tuas',
  'nosso', 'nossa', 'nossos', 'nossas', 'vosso', 'vossa', 'vossos', 'vossas', 'isso', 'isto',
  'aquele', 'aquela', 'aqueles', 'aquelas', 'muito', 'pouco', 'mais', 'menos', 'outro', 'outra',
  'outros', 'outras', 'todo', 'toda', 'todos', 'todas', 'cada', 'qualquer', 'algum', 'alguma',
  'alguns', 'algumas', 'nenhum', 'nenhuma', 'nada', 'nunca', 'jamais', 'sempre', 'agora',
  'ainda', 'já', 'antes', 'depois', 'hoje', 'amanhã', 'ontem',
]);

export const WordcloudRelatos: React.FC<WordcloudRelatosProps> = ({
  relatos,
  height = 400,
  showEstatisticas = true
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Processar relatos para wordcloud
  const palavrasRelatos = useMemo(() => {
    if (!relatos || relatos.length === 0) return [];

    const todasMensagens = relatos.map(relato => relato.mensagem).join(' ');

    const palavras = todasMensagens
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[.,!?;:()"'"-]/g, ' ')
      .split(/\s+/)
      .filter(palavra => palavra.length > 2)
      .filter(palavra => !STOP_WORDS.has(palavra))
      .filter(palavra => !palavra.match(/^\d+$/));

    const frequencia: { [key: string]: number } = {};
    palavras.forEach(palavra => {
      frequencia[palavra] = (frequencia[palavra] || 0) + 1;
    });

    return Object.entries(frequencia)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 50);
  }, [relatos]);

  // Gerar a nuvem de palavras com D3
  useEffect(() => {
    if (!svgRef.current || palavrasRelatos.length === 0) return;

    const width = svgRef.current.parentElement?.clientWidth || 800;
    const containerHeight = height;

    // Limpar SVG
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", containerHeight);

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${containerHeight / 2})`);

    // 🔥 CORES FIXAS - Cada palavra mantém sua cor original
    const colorScale = d3.scaleOrdinal()
      .domain(palavrasRelatos.map((_, i) => i.toString()))
      .range([
        '#009E73', '#D55E00', '#0072B2', '#CC79A7', '#F0E442',
        '#56B4E9', '#E69F00', '#000000', '#999999', '#CC6677',
        '#88CCEE', '#44AA99', '#117733', '#332288', '#AA4499'
      ]);

    // Escala de tamanho
    const sizeScale = d3.scaleLinear()
      .domain([0, d3.max(palavrasRelatos, d => d.value) || 1])
      .range([50, 200]);

    // 🔥 ESTRATÉGIA PARA PALAVRAS MAIS FREQUENTES NO CENTRO
    // Ordenar palavras por frequência e atribuir cores ANTES do layout
    const palavrasComCor = palavrasRelatos.map((d, i) => ({
      ...d,
      size: sizeScale(d.value),
      originalColor: colorScale(i.toString()),
      hoverColor: "#ff4444",
      // 🔥 Prioridade: palavras mais frequentes têm maior prioridade no centro
      priority: palavrasRelatos.length - i // Inverte o índice para dar prioridade às primeiras
    }));

    // Layout da nuvem com estratégia para centralizar palavras importantes
    const layout = cloud()
      .size([width, containerHeight])
      .words(palavrasComCor)
      .padding(2)
      .rotate(() => {
        const rand = Math.random();
        if (rand < 0.4) return 0;
        if (rand < 0.8) return 90;
        return Math.random() * 30 - 15;
      })
      .font("Arial")
      .fontSize((d: any) => d.size)
      .on("end", draw);

    // 🔥 Estratégia: executar o layout múltiplas vezes para melhor posicionamento
    let bestLayout: any[] = [];
    let bestScore = Infinity;

    // Executar o layout algumas vezes e escolher o melhor
    for (let i = 0; i < 3; i++) {
      layout.start();
      // Aguardar o callback do layout
    }

    // Função para calcular "qualidade" do layout (palavras importantes mais centrais)
    function calculateLayoutScore(words: any[]) {
      return words.reduce((score, word, index) => {
        const distanceFromCenter = Math.sqrt(word.x * word.x + word.y * word.y);
        const importance = palavrasComCor[index].priority;
        return score + (distanceFromCenter / importance);
      }, 0);
    }

    function draw(words: any[]) {
      const currentScore = calculateLayoutScore(words);
      if (currentScore < bestScore) {
        bestScore = currentScore;
        bestLayout = words;
      }

      // Só desenhar na última execução
      if (bestLayout.length > 0) {
        drawFinal(bestLayout);
      }
    }

    function drawFinal(words: any[]) {
      const word = g.selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", (d: any) => `${d.size}px`)
        .style("font-family", "Arial, sans-serif")
        .style("font-weight", "bold")
        .style("fill", (d: any) => d.originalColor) // 🔥 COR ORIGINAL FIXA
        .style("cursor", "pointer")
        .attr("text-anchor", "middle")
        .attr("transform", (d: any) => `translate(${d.x},${d.y})rotate(${d.rotate})`)
        .text((d: any) => d.text)
        .on("mouseover", function (event, d: any) {
          d3.select(this)
            .transition()
            .duration(200)
            .style("fill", d.hoverColor)
            .style("font-size", `${d.size * 1.2}px`)
            .style("font-weight", "bolder");
        })
        .on("mouseout", function (event, d: any) {
          d3.select(this)
            .transition()
            .duration(200)
            .style("fill", d.originalColor) // 🔥 VOLTA PARA COR ORIGINAL
            .style("font-size", `${d.size}px`)
            .style("font-weight", "bold");
        })
        .on("click", function (event, d: any) {
          console.log('Palavra clicada:', d);
        });

      // Adicionar tooltip
      word.append("title")
        .text((d: any) => `"${d.text}" aparece ${d.value} ${d.value === 1 ? 'vez' : 'vezes'}`);
    }

    // Forçar uma execução final
    setTimeout(() => {
      if (bestLayout.length === 0) {
        layout.start();
      }
    }, 100);

  }, [palavrasRelatos, height]);

  // Se não há relatos
  if (palavrasRelatos.length === 0) {
    return (
      <Box sx={{
        height: 300,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px dashed #ccc',
        borderRadius: 1
      }}>
        <Typography variant="body2" color="text.secondary">
          Nenhum relato encontrado para gerar nuvem de palavras.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{
        height,
        position: 'relative',
        borderRadius: 1,
        backgroundColor: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        <svg
          ref={svgRef}
          style={{
            width: '100%',
            height: '100%',
            fontFamily: 'Arial, sans-serif'
          }}
        />
      </Box>

      {/* Estatísticas */}
      {showEstatisticas && relatos.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            label={`${relatos.length} ${relatos.length === 1 ? 'relato' : 'relatos'}`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${new Set(relatos.map(r => r.baseId)).size} bases`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${new Set(relatos.map(r => r.autor)).size} autores`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${palavrasRelatos.length} palavras únicas`}
            size="small"
            variant="outlined"
          />
        </Box>
      )}
    </>
  );
};

export default WordcloudRelatos;