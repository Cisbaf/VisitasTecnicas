// components/base/modal/ViaturaChecklistsModal.tsx
"use client";
import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    Box,
    Typography,
    Chip,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Avaliacao, CheckListResponse } from "@/components/types";

interface ViaturaChecklistsModalProps {
    open: boolean;
    onClose: () => void;
    idViatura: number | null;
}

export default function ViaturaChecklistsModal({ open, onClose, idViatura }: ViaturaChecklistsModalProps) {
    const [checklists, setChecklists] = useState<CheckListResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [avaliacoes, setAvaliacoes] = useState<Avaliacao[] | null>(null);

    useEffect(() => {
        if (open && idViatura) {
            fetchChecklists();
        } else {
            setChecklists([]);
            setError(null);
            setAvaliacoes(null);
        }
    }, [open, idViatura]);

    const fetchChecklists = async () => {
        if (idViatura == null || typeof idViatura !== "number" || isNaN(idViatura)) {
            setError("ID da viatura inválido");
            setChecklists([]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            console.log("Fetching checklists for idViatura:", idViatura);
            const res = await fetch(`/api/checklist/viatura/${encodeURIComponent(String(idViatura))}`);

            if (!res.ok) {
                if (res.status === 404 || res.status === 204) {
                    setChecklists([]);
                    return;
                }
                throw new Error("Falha ao carregar checklists da viatura");
            }

            const text = await res.text();
            const data: CheckListResponse[] = text ? JSON.parse(text) : [];
            console.log("Checklists da viatura:", data);
            setChecklists(data);
        } catch (err: any) {
            setError(err.message || "Erro ao carregar checklists");
        } finally {
            setLoading(false);
        }
    };


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

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Checklists da Viatura {idViatura}
                <Button onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    Fechar
                </Button>
            </DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : checklists.length === 0 ? (
                    <Alert severity="info">Nenhum checklist encontrado para esta viatura.</Alert>
                ) : (
                    <Box sx={{ mt: 2 }}>
                        {checklists.map((checklist) => (
                            <Accordion key={checklist.id} sx={{ mb: 2 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="h6">
                                        {checklist.categoria}
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {checklist.descricao.map((item) => (
                                        <Paper key={item.id} variant="outlined" sx={{ p: 2, mb: 1 }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                {item.descricao}
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                                <Chip
                                                    label={`Conformidade: ${item.conformidadePercent}%`}
                                                    color={getConformidadeColor(item.conformidadePercent)}
                                                    size="small"
                                                />
                                                <Chip
                                                    label={`Tipo: ${item.tipoConformidade}`}
                                                    variant="outlined"
                                                    size="small"
                                                />
                                                <Chip
                                                    label={`Criticidade: ${item.criticidade}`}
                                                    color={getCriticidadeColor(item.criticidade)}
                                                    size="small"
                                                />
                                            </Box>
                                            {item.observacao && (
                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                    <strong>Observação:</strong> {item.observacao}
                                                </Typography>
                                            )}
                                        </Paper>
                                    ))}
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Fechar</Button>
            </DialogActions>
        </Dialog>
    );
}