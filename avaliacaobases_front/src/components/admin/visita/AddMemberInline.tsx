import React, { useState } from "react";
import { Box, Button, TextField } from "@mui/material";

interface AddMemberInlineProps {
    onAdd: (nome: string, cargo?: string) => void;
}

export default function AddMemberInline({ onAdd }: AddMemberInlineProps) {
    const [nome, setNome] = useState("");
    const [cargo, setCargo] = useState("");

    return (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField size="small" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            <TextField size="small" placeholder="Cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} />
            <Button size="small" variant="contained" onClick={() => {
                if (!nome) return;
                onAdd(nome, cargo);
                setNome("");
                setCargo("");
            }} sx={{ borderRadius: 4 }}>Adicionar</Button>
        </Box>
    );
}