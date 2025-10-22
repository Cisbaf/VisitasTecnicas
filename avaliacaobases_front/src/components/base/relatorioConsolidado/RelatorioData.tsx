import React from "react";
import {
    alpha,
    Box,
    Card,
    CardContent,
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme
} from "@mui/material";
import { EmojiEvents, TrendingUp, Warning } from "@mui/icons-material";
import { ptBR } from 'date-fns/locale';
import { format } from "date-fns";
import { RelatorioConsolidadoResponse } from "@/components/types";
import { PREDEFINED_SUMMARIES } from "@/components/types";

export const RelatorioData = ({ relatorio, getConformidadeColor, getScoreColor, viaturasCriticasAgrupadas, baseId }: {
    relatorio: RelatorioConsolidadoResponse;
    getConformidadeColor: (percent: number) => 'success' | 'warning' | 'error';
    getScoreColor: (percent: number) => 'success' | 'warning' | 'error';
    viaturasCriticasAgrupadas: any[];
    baseId: number;

}) => {
    const findSummaryName = (summaryId: number): string => {
        const foundSummary = PREDEFINED_SUMMARIES.find((summary) => summary.id === summaryId);
        return foundSummary ? foundSummary.titulo : '';
    }

    const theme = useTheme();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Resumo Geral */}
            <Box>
                <Typography variant="h6" fontWeight="500" sx={{ mb: 2 }}>
                    Resumo do Período
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {/* Cards de Resumo */}
                    <Card sx={{ flex: '1 1 200px', borderRadius: 2 }}><CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <TrendingUp sx={{ fontSize: 32, mb: 1, color: 'primary.main' }} />
                        <Typography variant="h4" fontWeight="700" color="primary.main">
                            {relatorio.totalVisitas ?? 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Visitas Realizadas
                        </Typography>
                    </CardContent></Card>
                    <Card sx={{ flex: '1 1 200px', borderRadius: 2 }}><CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <TrendingUp sx={{ fontSize: 32, mb: 1, color: 'success.main' }} />
                        <Typography variant="h4" fontWeight="700" color="success.main">
                            {relatorio.pontosFortes?.length ?? 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Pontos Fortes
                        </Typography>
                    </CardContent></Card>
                    <Card sx={{ flex: '1 1 200px', borderRadius: 2 }}><CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <Warning sx={{ fontSize: 32, mb: 1, color: 'error.main' }} />
                        <Typography variant="h4" fontWeight="700" color="error.main">
                            {relatorio.pontosCriticosGerais?.length ?? 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Pontos Críticos
                        </Typography>
                    </CardContent></Card>
                </Box>
            </Box>
            {/* Pontos Fortes e Críticos lado a lado */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Card sx={{ flex: '1 1 400px', borderRadius: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <TrendingUp color="success" sx={{ mr: 1.5 }} />
                            <Typography variant="h6" fontWeight="500">
                                Pontos Fortes
                            </Typography>
                        </Box>
                        {relatorio.pontosFortes && relatorio.pontosFortes.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {relatorio.pontosFortes.map((ponto, index) => (
                                    <Box key={index} sx={{
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                        p: 1,
                                        width: 'fit-content'
                                    }}>
                                        <Typography variant="body2" sx={{ borderRadius: 1 }} color="success">
                                            {ponto}
                                        </Typography>
                                    </Box>))}
                            </Box>
                        ) : (<Box sx={{ textAlign: 'center', py: 2 }}><Typography variant="body2" color="text.secondary">Nenhum
                            ponto forte identificado no período.</Typography></Box>)}
                    </CardContent>
                </Card>
                <Card sx={{ flex: '1 1 400px', borderRadius: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Warning color="error" sx={{ mr: 1.5 }} />
                            <Typography variant="h6" fontWeight="500">
                                Pontos Críticos Recorrentes
                            </Typography>
                        </Box>
                        {relatorio.pontosCriticosGerais && relatorio.pontosCriticosGerais.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {relatorio.pontosCriticosGerais.map((ponto, index) => (
                                    <Box key={index} sx={{
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                        p: 1,
                                        width: 'fit-content'
                                    }}>
                                        <Typography variant="body2" sx={{ borderRadius: 1 }} color="error">
                                            {ponto.descricao} (Ocorrencias: {ponto.ocorrencias})
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        ) : (<Box sx={{ textAlign: 'center', py: 2 }}><Typography variant="body2" color="text.secondary">Nenhum
                            ponto crítico recorrente identificado.</Typography></Box>)}
                    </CardContent>
                </Card>
            </Box>
            {/* Médias de conformidade */}
            <Card sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="500" gutterBottom>Médias de conformidade por categoria</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {relatorio.conformidadesPorSummary && Object.entries(relatorio.conformidadesPorSummary).length > 0 ? (
                            Object.entries(relatorio.conformidadesPorSummary).map(([summary, media]) => (
                                <Box key={summary} sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: `1px solid ${theme.palette.divider}`,
                                    textAlign: 'center',
                                    minWidth: 120,
                                    flex: '1 1 120px'
                                }}>
                                    <Typography variant="subtitle2" fontWeight="500" gutterBottom>{findSummaryName(Number(summary))}</Typography>
                                    <Chip label={`${(media ?? 0).toFixed(1)}%`} color={getConformidadeColor(media ?? 0)}
                                        variant="filled" sx={{ borderRadius: 1, fontWeight: '600' }} />
                                </Box>
                            ))
                        ) : (<Typography variant="body2" color="text.secondary">Nenhuma conformidade
                            disponível.</Typography>)}
                    </Box>
                </CardContent>
            </Card>
            {/* Viaturas Críticas */}
            <Card sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="500" gutterBottom>Viaturas</Typography>
                    {relatorio.viaturasCriticas && relatorio.viaturasCriticas.length > 0 ? (
                        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                            <Table>
                                <TableHead><TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                                    <TableCell sx={{ fontWeight: '600' }}>Placa</TableCell>
                                    <TableCell sx={{ fontWeight: '600' }}>Tipo</TableCell>
                                    <TableCell sx={{ fontWeight: '600' }}>KM</TableCell>
                                    <TableCell sx={{ fontWeight: '600' }}>Data Última Alteração</TableCell>
                                </TableRow></TableHead>
                                <TableBody>
                                    {viaturasCriticasAgrupadas.map((viatura) => (

                                        <TableRow key={viatura.placa} sx={{
                                            '&:last-child td, &:last-child th': { border: 0 },
                                            '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.01) }
                                        }}>
                                            <TableCell><Chip label={viatura.placa} variant="outlined" color="primary" /></TableCell>
                                            <TableCell>{viatura.tipoViatura}</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>
                                                {viatura.km} km
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={(() => {
                                                    const dia = new Date(viatura.dataUltimaAlteracao);
                                                    dia.setDate(dia.getDate() + 1);
                                                    if (dia.getFullYear() < 2001) return 'Não disponível';
                                                    return dia.toLocaleDateString();
                                                })()}
                                                    size="small"
                                                    sx={{ borderRadius: 1 }} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}><Warning
                            sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} /><Typography variant="body2"
                                color="text.secondary">Nenhuma
                                viatura com itens críticos no período.</Typography></Box>
                    )}
                </CardContent>
            </Card>
            <Card sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="500" gutterBottom>Inspeções</Typography>
                    {relatorio.metricasExternasBases && relatorio.metricasExternasBases.length > 0 ? (
                        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                                        <TableCell sx={{ fontWeight: '600' }}>Base</TableCell>
                                        <TableCell sx={{ fontWeight: '600' }}>Media Vtr Ativa</TableCell>
                                        <TableCell sx={{ fontWeight: '600' }}>Media Prontidão</TableCell>
                                        <TableCell sx={{ fontWeight: '600' }}>Media Atendimento</TableCell>
                                        <TableCell sx={{ fontWeight: '600' }}>Media Conformidade</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {relatorio.metricasExternasBases
                                        .filter((metricas) =>
                                            metricas.baseNome != null &&
                                            metricas.baseNome !== '' &&
                                            metricas.idBase === baseId // FILTRO PELO baseId
                                        )
                                        .map((metricas) => (
                                            <TableRow key={metricas.idBase} sx={{
                                                '&:last-child td, &:last-child th': { border: 0 },
                                                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.01) }
                                            }}>
                                                <TableCell>
                                                    <Chip
                                                        label={metricas.baseNome}
                                                        variant="outlined"
                                                        color="primary"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={`${metricas.porcentagemVtrAtiva}%`}
                                                        variant="outlined"
                                                        color={metricas.porcentagemVtrAtiva > 70 ? "success" : metricas.porcentagemVtrAtiva > 50 ? "warning" : "error"}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={`${metricas.tempoMedioProntidao}`}
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>
                                                    <Chip
                                                        label={`${metricas.tempoMedioAtendimento} `}
                                                        variant="outlined"
                                                        color="primary"
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>
                                                    <Chip
                                                        label={`${metricas.mediaConformidade.toFixed(2)}%`}
                                                        variant="outlined"
                                                        color="primary"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Warning sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                                Nenhuma métrica de inspeção disponível para esta base no período.
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
            {/* Ranking de Bases */}
            <Card sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <EmojiEvents color="primary" sx={{ mr: 1.5 }} />
                        <Typography variant="h6" fontWeight="500">
                            Ranking de Bases
                        </Typography>
                    </Box>

                    {relatorio.rankingBases && relatorio.rankingBases.length > 0 ? (
                        <>
                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                                            <TableCell sx={{ fontWeight: '600' }}>Posição</TableCell>
                                            <TableCell sx={{ fontWeight: '600' }}>Base</TableCell>
                                            <TableCell sx={{ fontWeight: '600' }}>Score</TableCell>
                                            <TableCell sx={{ fontWeight: '600' }}>Última Visita</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {relatorio.rankingBases.map((base) => (
                                            <TableRow
                                                key={base.id}
                                                sx={{
                                                    '&:last-child td, &:last-child th': { border: 0 },
                                                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) },
                                                }}
                                            >
                                                {/* Posição */}
                                                <TableCell>
                                                    <Chip
                                                        label={`#${base.posicaoRanking}`}
                                                        color={
                                                            base.posicaoRanking === 1
                                                                ? 'primary'
                                                                : base.posicaoRanking === 2
                                                                    ? 'secondary'
                                                                    : base.posicaoRanking === 3
                                                                        ? 'warning'
                                                                        : 'default'
                                                        }
                                                        variant={base.posicaoRanking <= 3 ? 'filled' : 'outlined'}
                                                        sx={{ borderRadius: 1, fontWeight: '600' }}
                                                    />
                                                </TableCell>

                                                {/* Nome da base */}
                                                <TableCell>{base.nomeBase}</TableCell>

                                                {/* Média de conformidade */}
                                                <TableCell>
                                                    {typeof base.mediaConformidade === 'number' ? (
                                                        <Chip
                                                            label={`${base.score.toFixed(3)}%`}
                                                            color={getScoreColor(base.score)}
                                                            variant="outlined"
                                                            sx={{ borderRadius: 1 }}
                                                        />
                                                    ) : (
                                                        <Typography variant="body2">-</Typography>
                                                    )}
                                                </TableCell>


                                                {/* Data da última visita */}
                                                <TableCell>
                                                    {base.dataUltimaVisita
                                                        ? format(new Date(base.dataUltimaVisita), 'dd/MM/yyyy', { locale: ptBR })
                                                        : '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                            </TableContainer>
                            <Typography variant="caption" color="text.secondary" sx={{ p: 2, display: 'block' }}>
                                * O ranking é gerado com base na média dos resultados de cada item de inspeção. Todos os itens têm a mesma importância (peso igualitário) para o cálculo da nota final.
                            </Typography>
                        </>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <EmojiEvents sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                                Nenhum dado de ranking disponível.
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

        </Box>
    );
};