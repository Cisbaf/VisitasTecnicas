"use client";
import React from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Typography,
} from "@mui/material";
import { CalendarToday, Refresh } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from 'date-fns/locale';
import useRelatorioConsolidado from "./useRelatorioConsolidado";
import { RelatorioData } from "./RelatorioData";

// Componente principal do relatório
export default function RelatorioConsolidado({ baseId }: { baseId: number }) {
    const {
        relatorio,
        loading,
        error,
        dataInicio,
        dataFim,
        setDataInicio,
        setDataFim,
        buscarRelatorio,
        viaturasCriticasAgrupadas
    } = useRelatorioConsolidado(baseId);

    // Funções auxiliares movidas para o componente para melhor coesão com a UI
    const getConformidadeColor = (percent: number) => {
        if (percent >= 80) return "success";
        if (percent >= 50) return "warning";
        return "error";
    };
    const getScoreColor = (percent: number) => {
        if (percent >= 0.8) return "success";
        if (percent >= 0.5) return "warning";
        return "error";
    };

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
                                //@ts-ignore
                                onChange={(newValue: Date | null) => setDataInicio(newValue ? newValue : null)}
                                format="dd/MM/yyyy"
                                slotProps={{ textField: { size: "small", sx: { minWidth: 200 } } }}
                            />
                            <DatePicker
                                label="Data Fim"
                                value={dataFim}
                                //@ts-ignore
                                onChange={(newValue: Date) => setDataFim(newValue)}
                                format="dd/MM/yyyy"
                                slotProps={{ textField: { size: "small", sx: { minWidth: 200 } } }}
                            />
                            <Button
                                variant="contained"
                                onClick={buscarRelatorio}
                                disabled={!dataInicio || !dataFim}
                                startIcon={<Refresh />}
                                sx={{ py: 1, px: 3 }}
                            >
                                Atualizar
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => error}>
                        {error}
                    </Alert>
                )}

                {relatorio ? (
                    <RelatorioData
                        relatorio={relatorio}
                        getConformidadeColor={getConformidadeColor}
                        getScoreColor={getScoreColor}
                        viaturasCriticasAgrupadas={viaturasCriticasAgrupadas}
                        baseId={baseId}
                    />
                ) : !loading && !error ? (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        Selecione um período para gerar o relatório consolidado.
                    </Alert>
                ) : null}
            </Box>
        </LocalizationProvider>
    );
}

