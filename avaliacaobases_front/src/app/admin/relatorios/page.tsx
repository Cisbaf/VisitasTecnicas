"use client";
import React, { useEffect, useState } from "react";
import RelatorioConsolidado from "@/components/base/relatorioConsolidado/RelatorioConsolidado";
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

// --- HOOK CUSTOMIZADO PARA BUSCAR OS DADOS ---
// Isso isola e torna a lógica de busca de dados reutilizável
const useBases = () => {
    const [bases, setBases] = useState<BaseResponse[]>([]);
    const [loading, setLoading] = useState(true); // Inicia carregando
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
    }, []); // O array vazio garante que a busca ocorra apenas uma vez

    return { bases, loading, error };
};

// --- COMPONENTE DA PÁGINA ---
export default function RelatoriosPage() {
    // Usa o hook customizado para obter os dados e seus estados
    const { bases, loading, error } = useBases();
    const [selectedBaseId, setSelectedBaseId] = useState<number | ''>('');

    const handleBaseChange = (event: SelectChangeEvent<number>) => {
        setSelectedBaseId(event.target.value as number);
    };

    // 1. Renderiza um indicador de carregamento
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // 2. Renderiza uma mensagem de erro
    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">Erro ao carregar dados: {error}</Alert>
            </Box>
        );
    }

    // 3. Renderiza o conteúdo principal quando os dados estão prontos
    return (
        <Box sx={{ p: 1 }}>
            <Typography variant="h4" gutterBottom>
                Relatórios
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="select-base-label">Selecione a Base</InputLabel>
                <Select
                    labelId="select-base-label"
                    label="Selecione a Base"
                    value={selectedBaseId}
                    onChange={handleBaseChange}
                >
                    {/* Opção default para guiar o usuário */}
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

            {/* Renderiza o relatório apenas se uma base for selecionada */}
            {selectedBaseId && <RelatorioConsolidado baseId={selectedBaseId} />}
        </Box>
    );
}