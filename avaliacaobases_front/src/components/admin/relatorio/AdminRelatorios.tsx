// app/admin/relatorios/RelatoriosClient.tsx
"use client";
import React, { useState } from "react";
import RelatorioConsolidado from "@/components/base/relatorioConsolidado/RelatorioConsolidado";
import {
    Box,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Typography,
    SelectChangeEvent
} from "@mui/material";
import { BaseResponse } from "@/components/types";

interface AdminRelatoriosProps {
    bases: BaseResponse[];
}

export default function AdminRelatorios({ bases }: AdminRelatoriosProps) {
    const [selectedBaseId, setSelectedBaseId] = useState<number | ''>('');

    const handleBaseChange = (event: SelectChangeEvent<number>) => {
        setSelectedBaseId(event.target.value as number);
    };

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