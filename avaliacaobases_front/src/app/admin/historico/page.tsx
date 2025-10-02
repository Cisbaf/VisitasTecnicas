"use client";
import React, { useEffect, useState } from "react";
import {
    Box,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Typography,
    Alert,
    SelectChangeEvent
} from "@mui/material";
import { BaseResponse } from "@/components/types";
import Historico from "@/components/base/Historicos";

const useBases = () => {
    const [bases, setBases] = useState<BaseResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBases = async () => {
            try {
                const response = await fetch(`/api/base`);
                if (!response.ok) {
                    throw new Error('Falha ao carregar as bases');
                }
                const data = await response.json();
                setBases(data);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido';
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchBases();
    }, []);

    return { bases, loading, error };
};

export default function HistoricoPage() {
    const { bases, loading, error } = useBases();
    const [selectedBaseId, setSelectedBaseId] = useState<number | ''>('');

    const handleBaseChange = (event: SelectChangeEvent<number>) => {
        setSelectedBaseId(event.target.value as number);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">Erro ao carregar dados: {error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Históricos
            </Typography>

            <FormControl fullWidth sx={{ mb: 4 }}>
                <InputLabel id="select-base-label">Selecione a Base</InputLabel>
                <Select
                    labelId="select-base-label"
                    label="Selecione a Base"
                    value={selectedBaseId}
                    onChange={handleBaseChange}
                >
                    <MenuItem value="" disabled>
                        <em>Nenhuma base selecionada</em>
                    </MenuItem>
                    {bases.map((base) => (
                        <MenuItem key={base.id} value={base.id}>
                            {base.nome}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {selectedBaseId && <Historico baseId={selectedBaseId} />}
        </Box>
    );
}