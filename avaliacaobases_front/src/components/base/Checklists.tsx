// src/components/ChecklistPage.tsx
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
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useParams } from "next/navigation";
import ChecklistService, { CategoriaAgrupada } from "./service/ChecklistService";
import { BaseResponse } from "../types";

export default function ChecklistPage() {
    const params = useParams();
    const rawBaseId = params?.baseId as string | undefined;
    const parsed = rawBaseId ? Number(rawBaseId) : NaN;
    const baseId = Number.isNaN(parsed) ? undefined : parsed;

    const [categoriasAgrupadas, setCategoriasAgrupadas] = useState<CategoriaAgrupada[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        if (!baseId) {
            setCategoriasAgrupadas([]);
            setLoading(false);
            return () => { mounted = false; };
        }

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await ChecklistService.getCategoriasAgrupadas(baseId);
                if (mounted) setCategoriasAgrupadas(data);
            } catch (err: any) {
                if (mounted) setError(err?.message ?? "Erro ao carregar checklists");
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, [baseId]);

    const getConformidadeColor = (percent: number) => {
        if (percent >= 80) return "success";
        if (percent >= 50) return "warning";
        return "error";
    };

    const getCriticidadeColor = (criticidade: string) => {
        switch (criticidade) {
            case "Alta": return "error";
            case "Média": return "warning";
            case "Baixa": return "info";
            default: return "default";
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box sx={{ padding: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="600">
                    CheckList de Inspeção
                </Typography>
            </Box>

            {categoriasAgrupadas.length === 0 ? (
                <Alert severity="info">Nenhum checklist encontrado para esta base.</Alert>
            ) : (
                categoriasAgrupadas.map(categoria => (
                    <Accordion key={categoria.categoria} sx={{ mb: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                <Typography variant="h6">
                                    {categoria.categoria}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mr: 2 }}>
                                    Última visita: {categoria.ultimaVisita ? new Date(categoria.ultimaVisita).toLocaleDateString('pt-BR') : "—"}
                                </Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            {categoria.visitas.map(visita => (
                                <Card key={visita.visitaId} sx={{ marginBottom: 2 }}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom color="primary">
                                            Visita de {visita.dataVisita ? new Date(visita.dataVisita).toLocaleDateString('pt-BR') : "—"}
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {visita.descricoes.map((descricao) => (
                                                <Grid item xs={12} md={6} key={descricao.id}>
                                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                                        <Typography variant="subtitle2" gutterBottom>
                                                            {descricao.descricao}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                                            <Chip
                                                                label={`Conformidade: ${descricao.conformidadePercent}%`}
                                                                color={getConformidadeColor(descricao.conformidadePercent)}
                                                                size="small"
                                                            />
                                                            <Chip
                                                                label={`Tipo: ${descricao.tipoConformidade}`}
                                                                variant="outlined"
                                                                size="small"
                                                            />
                                                            <Chip
                                                                label={`Criticidade: ${descricao.criticidade}`}
                                                                color={getCriticidadeColor(descricao.criticidade)}
                                                                size="small"
                                                            />
                                                        </Box>
                                                        {descricao.observacao && (
                                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                                                <strong>Observação:</strong> {descricao.observacao}
                                                            </Typography>
                                                        )}
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </CardContent>
                                </Card>
                            ))}
                        </AccordionDetails>
                    </Accordion>
                ))
            )}
        </Box>
    );
}
