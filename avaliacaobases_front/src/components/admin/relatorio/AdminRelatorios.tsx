// app/admin/relatorios/RelatoriosClient.tsx
"use client";
import React, { useEffect, useState } from "react";
import RelatorioConsolidado from "@/components/base/relatorioConsolidado/RelatorioConsolidado";
import {
    Box,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Typography,
    SelectChangeEvent,
    CircularProgress
} from "@mui/material";
import { BaseResponse } from "@/components/types";

export default function AdminRelatorios() {
    const [selectedBaseId, setSelectedBaseId] = useState<number | ''>('');
    const [bases, setBases] = useState<BaseResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBases = async () => {
            try {
                setLoading(true);
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

    const handleBaseChange = (event: SelectChangeEvent<number>) => {
        setSelectedBaseId(event.target.value as number);
    };

    return (
        <Box sx={{ p: 1 }}>
            <Typography variant="h4" gutterBottom>
                Relatórios
            </Typography>
            {loading && <CircularProgress />}
            {error && <Typography color="error">{error}</Typography>}
            {!loading && !error && bases.length === 0 && (
                <Typography>Nenhuma base encontrada.</Typography>
            )}

            <FormControl fullWidth sx={{ mb: 2 }}>
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

            {selectedBaseId && <RelatorioConsolidado baseId={selectedBaseId} />}
        </Box>
    );
}