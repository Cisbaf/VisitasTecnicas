"use client";
import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Alert,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    alpha,
    useTheme
} from "@mui/material";
import {
    TrendingUp,
    Warning,
    CalendarToday,
    Refresh,
    EmojiEvents
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useParams } from "next/navigation";
import { BaseResponse, RelatorioConsolidadoResponse, ViaturaDTO } from "@/components/types";
import { ptBR } from 'date-fns/locale';
import { format } from "date-fns";

export default function RelatoriosPage() {
    const params = useParams();
    const baseId = Number(params.baseId);
    const theme = useTheme();

    const [isClient, setIsClient] = useState(false);

    const [relatorio, setRelatorio] = useState<RelatorioConsolidadoResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [dataInicio, setDataInicio] = useState<Date | null>(null);
    const [dataFim, setDataFim] = useState<Date | null>(null);

    const [baseName, setBaseName] = useState<BaseResponse | null>(null);

    useEffect(() => {
        setIsClient(true);

        const fim = new Date();
        const inicio = new Date();
        inicio.setDate(inicio.getDate() - 9000);
        setDataInicio(inicio);
        setDataFim(fim);
    }, []);

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

    const buscarRelatorio = async () => {
        if (!dataInicio || !dataFim) return;
        try {
            setLoading(true);
            setError(null);

            const formatoData = (data: Date) => data.toISOString().split('T')[0];
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
            setRelatorio(dados);
        } catch (err: any) {
            console.error("Erro buscarRelatorio:", err);
            setError(err?.message || "Erro desconhecido ao buscar relatório");
        } finally {
            setLoading(false);
        }
    };

    const getConformidadeColor = (percent: number) => {
        if (percent >= 80) return "success";
        if (percent >= 50) return "warning";
        return "error";
    };

    const viaturasCriticasAgrupadas = React.useMemo(() => {
        if (!relatorio?.viaturasCriticas) {
            return [];
        }

        const viaturasPorPlaca = relatorio.viaturasCriticas.reduce((acc, viatura) => {
            if (!viatura.placa) return acc;

            if (!acc[viatura.placa]) {
                acc[viatura.placa] = { ...viatura, itensCriticos: [...(viatura.itensCriticos || [])] };
            } else {
                acc[viatura.placa].itensCriticos.push(...(viatura.itensCriticos || []));
            }
            return acc;
        }, {} as Record<string, ViaturaDTO>);

        return Object.values(viaturasPorPlaca);
    }, [relatorio]);

    if (!isClient) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
            </Box>
        );
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column">
                <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                    Carregando relatório...
                </Typography>
            </Box>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <Box sx={{ padding: 3, maxWidth: 1200, margin: '0 auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" fontWeight="600">
                        Relatório Consolidado
                    </Typography>
                </Box>

                {/* Filtros */}
                <Card sx={{ mb: 4, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <CalendarToday sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
                            <Typography variant="h6" fontWeight="500">
                                Período do Relatório
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                            <DatePicker
                                label="Data Início"
                                value={dataInicio}
                                onChange={(newValue) => setDataInicio(newValue)}
                                format="dd/MM/yyyy"
                                slotProps={{
                                    textField: {
                                        size: "small",
                                        sx: { minWidth: 200 }
                                    }
                                }}
                            />
                            <DatePicker
                                label="Data Fim"
                                value={dataFim}
                                onChange={(newValue) => setDataFim(newValue)}
                                format="dd/MM/yyyy"
                                slotProps={{
                                    textField: {
                                        size: "small",
                                        sx: { minWidth: 200 }
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                onClick={buscarRelatorio}
                                disabled={!dataInicio || !dataFim || loading}
                                startIcon={<Refresh />}
                                sx={{ py: 1, px: 3 }}
                            >
                                Atualizar
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {relatorio ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Resumo Geral */}
                        <Box>
                            <Typography variant="h6" fontWeight="500" sx={{ mb: 2 }}>
                                Resumo do Período
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                <Card sx={{ flex: '1 1 200px', borderRadius: 2 }}>
                                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                        <TrendingUp sx={{ fontSize: 32, mb: 1, color: 'primary.main' }} />
                                        <Typography variant="h4" fontWeight="700" color="primary.main">
                                            {relatorio.totalVisitas ?? 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Visitas Realizadas
                                        </Typography>
                                    </CardContent>
                                </Card>
                                <Card sx={{ flex: '1 1 200px', borderRadius: 2 }}>
                                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                        <TrendingUp sx={{ fontSize: 32, mb: 1, color: 'success.main' }} />
                                        <Typography variant="h4" fontWeight="700" color="success.main">
                                            {relatorio.pontosFortes?.length ?? 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Pontos Fortes
                                        </Typography>
                                    </CardContent>
                                </Card>
                                <Card sx={{ flex: '1 1 200px', borderRadius: 2 }}>
                                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                        <Warning sx={{ fontSize: 32, mb: 1, color: 'error.main' }} />
                                        <Typography variant="h4" fontWeight="700" color="error.main">
                                            {relatorio.pontosCriticosGerais?.length ?? 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Pontos Críticos
                                        </Typography>
                                    </CardContent>
                                </Card>
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
                                                <Chip
                                                    key={index}
                                                    label={ponto}
                                                    color="success"
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{ borderRadius: 1 }}
                                                />
                                            ))}
                                        </Box>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 2 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Nenhum ponto forte identificado no período.
                                            </Typography>
                                        </Box>
                                    )}
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
                                                <Chip
                                                    key={index}
                                                    label={`${ponto.descricao} (${ponto.ocorrencias}x)`}
                                                    color="error"
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{ borderRadius: 1 }}
                                                />
                                            ))}
                                        </Box>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 2 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Nenhum ponto crítico recorrente identificado.
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Box>

                        {/* Médias de Conformidade */}
                        <Card sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight="500" gutterBottom>
                                    Médias de Conformidade por Categoria
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                    {relatorio.mediasConformidade && Object.entries(relatorio.mediasConformidade).length > 0 ? (
                                        Object.entries(relatorio.mediasConformidade).map(([categoria, media]) => (
                                            <Box
                                                key={categoria}
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 2,
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    textAlign: 'center',
                                                    minWidth: 120,
                                                    flex: '1 1 120px'
                                                }}
                                            >
                                                <Typography variant="subtitle2" fontWeight="500" gutterBottom>
                                                    {categoria}
                                                </Typography>
                                                <Chip
                                                    label={`${(media ?? 0).toFixed(1)}%`}
                                                    color={getConformidadeColor(media ?? 0)}
                                                    variant="filled"
                                                    sx={{ borderRadius: 1, fontWeight: '600' }}
                                                />
                                            </Box>
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">Nenhuma conformidade disponível.</Typography>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Viaturas Críticas */}
                        <Card sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight="500" gutterBottom>
                                    Viaturas com Itens Críticos
                                </Typography>
                                {relatorio.viaturasCriticas && relatorio.viaturasCriticas.length > 0 ? (
                                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                                                    <TableCell sx={{ fontWeight: '600' }}>Placa</TableCell>
                                                    <TableCell sx={{ fontWeight: '600' }}>Modelo</TableCell>
                                                    <TableCell sx={{ fontWeight: '600' }}>Status</TableCell>
                                                    <TableCell sx={{ fontWeight: '600' }}>Itens Críticos</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {viaturasCriticasAgrupadas.map((viatura) => (
                                                    <TableRow
                                                        key={viatura.placa}
                                                        sx={{
                                                            '&:last-child td, &:last-child th': { border: 0 },
                                                            '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.01) }
                                                        }}
                                                    >
                                                        <TableCell>
                                                            <Chip label={viatura.placa} variant="outlined" color="primary" />
                                                        </TableCell>
                                                        <TableCell>{viatura.modelo}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={viatura.status}
                                                                size="small"
                                                                color={
                                                                    viatura.status && viatura.status.toLowerCase().includes("operação")
                                                                        ? "success"
                                                                        : "warning"
                                                                }
                                                                sx={{ borderRadius: 1 }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                {viatura.itensCriticos && viatura.itensCriticos.map((item, itemIndex) => (
                                                                    <Chip
                                                                        key={`${item.nome}-${itemIndex}`}
                                                                        label={`${item.nome} (${item.conformidade ?? 0}%)`}
                                                                        color="error"
                                                                        size="small"
                                                                        variant="outlined"
                                                                        sx={{ borderRadius: 1 }}
                                                                    />
                                                                ))}
                                                            </Box>
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
                                            Nenhuma viatura com itens críticos no período.
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
                                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                                                    <TableCell sx={{ fontWeight: '600' }}>Posição</TableCell>
                                                    <TableCell sx={{ fontWeight: '600' }}>Base</TableCell>
                                                    <TableCell sx={{ fontWeight: '600' }}>Média Geral</TableCell>
                                                    <TableCell sx={{ fontWeight: '600' }}>Última Visita</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {relatorio.rankingBases.map((base) => (
                                                    <TableRow
                                                        key={base.id}
                                                        sx={{
                                                            '&:last-child td, &:last-child th': { border: 0 },
                                                            '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.01) }
                                                        }}
                                                    >
                                                        <TableCell>
                                                            <Chip
                                                                label={`#${base.posicaoRanking}`}
                                                                color={
                                                                    base.posicaoRanking === 1 ? "primary"
                                                                        : base.posicaoRanking === 2 ? "secondary"
                                                                            : base.posicaoRanking === 3 ? "warning"
                                                                                : "default"
                                                                }
                                                                variant={base.posicaoRanking <= 3 ? "filled" : "outlined"}
                                                                sx={{ borderRadius: 1, fontWeight: '600' }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>{base.nomeBase}</TableCell>
                                                        <TableCell>
                                                            {typeof base.mediaConformidade === 'number' ? (
                                                                <Chip
                                                                    label={`${base.mediaConformidade.toFixed(1)}%`}
                                                                    color={getConformidadeColor(base.mediaConformidade)}
                                                                    variant="outlined"
                                                                    sx={{ borderRadius: 1 }}
                                                                />
                                                            ) : (
                                                                <Typography variant="body2">-</Typography>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {base.dataUltimaVisita ? format(new Date(base.dataUltimaVisita), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
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
                ) : !loading && !error ? (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        Selecione um período para gerar o relatório consolidado.
                    </Alert>
                ) : null}
            </Box>
        </LocalizationProvider>
    );
}
