import React, { useEffect, useState } from "react";
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, } from "@mui/material";
import { EquipeTecnica } from "@/components/types";

interface AddRelatoInlineProps {
    members: EquipeTecnica[];
    onAdd: (p: {
        id: number;
        autor: string;
        mensagem: string;
        tema?: string;
        visitaId?: number;
    }) => void;
    onCancel?: () => void;
    initialData?: {
        id: number;
        autor: string;
        mensagem: string;
        tema?: string;
    };
    isEditing?: boolean;
}

export default function AddRelatoInline({
    members,
    onAdd,
    onCancel,
    initialData,
    isEditing = false
}: AddRelatoInlineProps) {
    const [autor, setAutor] = useState(initialData?.autor || members[0]?.nome || "");
    const [mensagem, setMensagem] = useState(initialData?.mensagem || "");
    const [tema, setTema] = useState(initialData?.tema || "");

    useEffect(() => {
        if (initialData) {
            setAutor(initialData.autor);
            setMensagem(initialData.mensagem);
            setTema(initialData.tema || "");;
        }
    }, [initialData]);

    const handleSubmit = () => {
        if (!mensagem.trim()) return;
        onAdd({
            id: initialData?.id || 0,
            autor,
            mensagem,
            tema: tema.trim() || undefined,
        });

        if (!isEditing) {
            setMensagem("");
            setTema("");
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <FormControl size="small">
                <InputLabel>Autor</InputLabel>
                <Select
                    value={autor}
                    label="Autor"
                    onChange={(e) => setAutor(e.target.value)}
                    sx={{ minWidth: 200 }}
                >
                    {members.map((m, idx) => (
                        <MenuItem key={idx} value={m.nome}>
                            {m.nome}
                            {m.cargo ? ` — ${m.cargo}` : ""}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                label="Tema"
                size="small"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
            />
            <TextField
                label="Mensagem"
                size="small"
                multiline
                rows={3}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!mensagem.trim()}
                >
                    {isEditing ? "Atualizar Relato" : "Adicionar Relato"}
                </Button>
                {isEditing && onCancel && (
                    <Button variant="outlined" onClick={onCancel}>
                        Cancelar
                    </Button>
                )}
            </Box>
        </Box>
    );
}