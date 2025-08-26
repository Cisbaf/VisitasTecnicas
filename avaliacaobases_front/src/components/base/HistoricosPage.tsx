"use client";
import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Chip,
    CircularProgress,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
    Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DoneIcon from "@mui/icons-material/Done"; // Importe o ícone Done
import { useParams } from "next/navigation";
import { VisitaResponse, RelatoResponse } from "@/components/types";
interface VisitaComRelatos extends VisitaResponse {
    relatos: RelatoResponse[];
}
export default function HistoricoPage() {
    const params = useParams();
    const baseId = Number(params.baseId);
    const [visitas, setVisitas] = useState<VisitaComRelatos[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);
                const visitasRes = await fetch(`/api/visita/base/${baseId}`);
                if (!visitasRes.ok) {
                    if (visitasRes.status === 404) {
                        setVisitas([]);
                        return;
                    }
                    throw new Error("Falha ao carregar visitas");
                }
                const visitasText = await visitasRes.text();
                const visitasData: VisitaResponse[] = visitasText ? JSON.parse(visitasText) : [];
                const visitasComRelatos: VisitaComRelatos[] = [];
                for (const visita of visitasData) {
                    try {
                        const relatosRes = await fetch(`/api/visita/relatos/visita/${visita.id}`);
                        let relatos: RelatoResponse[] = [];
                        if (relatosRes.ok) {
                            const relatosText = await relatosRes.text();
                            relatos = relatosText ? JSON.parse(relatosText) : [];
                        }
                        visitasComRelatos.push({ ...visita, relatos });
                    } catch (err) {
                        console.error(`Erro ao buscar relatos para visita ${visita.id}:`, err);
                        visitasComRelatos.push({ ...visita, relatos: [] });
                    }
                }
                setVisitas(visitasComRelatos);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        if (baseId) {
            fetchData();
        }
    }, [baseId]);
    const formatarData = (dataString: string) => {
        return new Date(dataString).toLocaleDateString('pt-BR');
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
        <Box >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="600">
                    Histórico
                </Typography>
            </Box>
            {visitas.length === 0 ? (
                <Alert severity="info">Nenhuma visita encontrada para esta base.</Alert>
            ) : (
                <Stack spacing={3}>
                    {visitas.map(visita => (
                        <Accordion key={visita.id} elevation={3} sx={{ borderRadius: 2, '&.Mui-expanded': { margin: '16px 0' } }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%" pr={2}>
                                    <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                                        {formatarData(visita.dataVisita)}
                                    </Typography>
                                    <Stack direction="row" spacing={1}>
                                        <Chip
                                            label={`${visita.relatos.length} relatos`}
                                            variant="outlined"
                                            size="small"
                                            color="info"
                                        />
                                        <Chip
                                            label={`${visita.membros.length} membros`}
                                            variant="outlined"
                                            size="small"
                                            color="info"
                                        />
                                    </Stack>
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    Equipe:
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" mb={3}>
                                    {visita.membros.map((membro, index) => (
                                        <Chip
                                            key={index}
                                            label={membro.nome}
                                            variant="outlined"
                                            size="small"
                                            color="primary"
                                        />
                                    ))}
                                </Stack>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    Relatos:
                                </Typography>
                                <Stack spacing={2}>
                                    {visita.relatos.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary">
                                            Nenhum relato para esta visita.
                                        </Typography>
                                    ) : (
                                        visita.relatos.map(relato => (
                                            <Paper key={relato.id} elevation={1} sx={{ p: 2, borderRadius: 2, borderLeft: 4, borderColor: relato.resolvido ? 'success.main' : 'warning.main' }} >
                                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1} flexWrap="wrap" pl={1}>
                                                    <Typography variant="body1" sx={{ fontWeight: 'medium', mr: 2 }}>
                                                        {relato.tema}
                                                    </Typography>
                                                    <Chip
                                                        label={relato.resolvido ? "Resolvido" : "Pendente"}
                                                        color={relato.resolvido ? "success" : "warning"}
                                                        variant="filled"
                                                        size="small"
                                                        icon={relato.resolvido ? <DoneIcon /> : undefined}
                                                    />
                                                </Stack>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                    {relato.mensagem}
                                                </Typography>
                                                <Typography variant="caption" display="block" color="text.disabled">
                                                    Autor: {relato.autor} • Data: {formatarData(relato.data.toString())}
                                                </Typography>
                                            </Paper>
                                        ))
                                    )}
                                </Stack>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Stack>
            )}
        </Box>
    );
}