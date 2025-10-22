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
    Alert,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
} from "@mui/material";
import { Avaliacao, Veiculo } from "@/components/types";
import { Dayjs } from "dayjs";

interface ViaturaHistoricoProps {
    open: boolean;
    onClose: () => void;
    placa: string | null;
}

export default function ViaturaHistoricoModal({ open, onClose, placa }: ViaturaHistoricoProps) {
    const [viatura, setViatura] = useState<Veiculo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && placa) {
            fetchViatura();
        } else {
            // Resetar estados quando o modal fechar
            setViatura(null);
            setError(null);
        }
    }, [open, placa]);

    const fetchViatura = async () => {
        if (placa == null || typeof placa !== "string") {
            setError("Placa da viatura inválida");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            console.log("Fetching dados da viatura:", placa);
            const res = await fetch(`/api/viatura/api/${encodeURIComponent(placa)}`);

            if (!res.ok) {
                if (res.status === 404 || res.status === 204) {
                    setViatura(null);
                    return;
                }
                throw new Error("Falha ao carregar dados da viatura");
            }

            const text = await res.text();
            const data: Veiculo = text ? JSON.parse(text) : null;
            setViatura(data);
        } catch (err: any) {
            setError(err.message || "Erro ao carregar dados da viatura");
        } finally {
            setLoading(false);
        }
    };

    const formatarData = (dataString: string) => {
        try {

            const data = new Date(dataString);
            data.setDate(data.getDate() + 1);
            return data.toLocaleDateString("pt-BR");
        } catch {
            console.log("Data inválida:", dataString);
            return dataString;
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                Histórico da Viatura {placa}
            </DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : viatura == null ? (
                    <Alert severity="info">Nenhum dado encontrado para esta viatura.</Alert>
                ) : (
                    <Box sx={{ mt: 2 }}>
                        {/* Informações principais da viatura */}
                        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Informações da Viatura
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Identificação
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                        {viatura.identificacao || 'Não informada'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Quilometragem
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                        {viatura.km ? `${viatura.km} km` : 'Não informada'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>

                        {/* Histórico de preenchimentos */}
                        {viatura.preenchimentos && viatura.preenchimentos.length > 0 ? (
                            <Paper elevation={1} sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Histórico de Preenchimentos ({viatura.preenchimentos.length})
                                </Typography>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Data</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Responsável</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {viatura.preenchimentos.map((preenchimento, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        {formatarData(preenchimento.dia)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {preenchimento.nomes || 'Não informado'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label="Concluído"
                                                            size="small"
                                                            color="success"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        ) : (
                            <Alert severity="info">
                                Nenhum preenchimento encontrado para esta viatura.
                            </Alert>
                        )}

                        {/* Resumo estatístico */}
                        <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Resumo
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 3 }}>
                                <Box>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Total de Preenchimentos
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {viatura.preenchimentos?.length || 0}
                                    </Typography>
                                </Box>
                                {viatura.preenchimentos && viatura.preenchimentos.length > 0 && (
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Último Preenchimento
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                            {formatarData(viatura.preenchimentos[0].dia)}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Fechar</Button>
                <Button
                    variant="contained"
                    onClick={fetchViatura}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={20} /> : 'Atualizar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}