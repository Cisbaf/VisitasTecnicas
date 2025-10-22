import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { EquipeTecnica } from "@/components/types";

interface AddBaseMemberInlineProps {
    onAdd: (nome: string, cargo?: string) => void;
    equipe: EquipeTecnica[];
}

export default function AddBaseMemberInline({ onAdd, equipe }: AddBaseMemberInlineProps) {
    const [nomes, setNomes] = useState({
        adm: "",
        enfermagem: "",
        medico: ""
    });

    const cargos = [
        { key: "adm", cargo: "COORDENADOR ADM", placeholder: "Nome do Coordenador ADM" },
        { key: "enfermagem", cargo: "RT DE ENFERMAGEM", placeholder: "Nome do RT de Enfermagem" },
        { key: "medico", cargo: "COORDENADOR MÉDICO", placeholder: "Nome do Coordenador Médico" }
    ];

    const handleAdd = (key: keyof typeof nomes, cargo: string) => {
        if (!nomes[key]) return;
        onAdd(nomes[key], cargo);
        setNomes(prev => ({ ...prev, [key]: "" }));
    };

    const handleChange = (key: keyof typeof nomes, value: string) => {
        setNomes(prev => ({ ...prev, [key]: value }));
    };

    return (
        <Box sx={{ display: "flex-column", gap: 3, alignItems: "center" }}>
            {cargos.map(({ key, cargo, placeholder }) => {
                const existeCargo = equipe.some(m => m.cargo === cargo);

                if (existeCargo) return null;

                return (
                    <Box key={key} sx={{ display: "flex", marginBottom: 1, gap: 1, alignItems: "center" }}>
                        <TextField
                            size="small"
                            placeholder={placeholder}
                            value={nomes[key as keyof typeof nomes]}
                            onChange={(e) => handleChange(key as keyof typeof nomes, e.target.value)}
                        />
                        <TextField
                            size="small"
                            placeholder="Cargo"
                            value={cargo}
                            disabled
                        />
                        <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleAdd(key as keyof typeof nomes, cargo)}
                            sx={{ borderRadius: 4, bgcolor: "#3e281e" }}
                        >
                            Adicionar
                        </Button>
                    </Box>
                );
            })}

            {/* Mensagem quando todos os cargos estão preenchidos */}
            {cargos.every(({ cargo }) => equipe.some(m => m.cargo === cargo)) && (
                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                    Todos os membros específicos foram adicionados
                </Typography>
            )}
        </Box>
    );
};