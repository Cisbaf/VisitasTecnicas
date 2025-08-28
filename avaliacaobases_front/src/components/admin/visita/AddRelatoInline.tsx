import React, {useEffect, useState} from "react";
import {Box, Button, FormControl, InputLabel, MenuItem, Select, TextField,} from "@mui/material";
import {EquipeTecnica} from "@/components/types";

interface AddRelatoInlineProps {
    members: EquipeTecnica[];
    onAdd: (p: {
        autor: string;
        mensagem: string;
        tema?: string;
        gestorResponsavel: string;
        resolvido: boolean
    }) => void;
}

export default function AddRelatoInline({members, onAdd}: AddRelatoInlineProps) {
    const [autor, setAutor] = useState(members[0]?.nome ?? "");
    const [mensagem, setMensagem] = useState("");
    const [tema, setTema] = useState("");
    const [gestorResponsavel, setGestorResponsavel] = useState("");
    const [resolvido, setResolvido] = useState(false);

    useEffect(() => {
        if (members.length && !autor) {
            setAutor(members[0].nome);
        }
    }, [members, autor]);

    const handleSubmit = () => {
        if (!mensagem.trim()) return;
        onAdd({
            autor,
            mensagem,
            tema: tema.trim() || undefined,
            gestorResponsavel,
            resolvido
        });
        setMensagem("");
        setTema("");
        setGestorResponsavel("");
        setResolvido(false);
    };

    return (
        <Box sx={{display: "flex", flexDirection: "column", gap: 2, mt: 1}}>
            <FormControl size="small">
                <InputLabel>Autor</InputLabel>
                <Select
                    value={autor}
                    label="Autor"
                    onChange={(e) => setAutor(e.target.value)}
                    sx={{minWidth: 200}}
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
                label="Gestor Responsável"
                size="small"
                value={gestorResponsavel}
                onChange={(e) => setGestorResponsavel(e.target.value)}
                required
            />
            <TextField
                label="Tema"
                size="small"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                required
            />
            <FormControl size="small">
                <InputLabel>Resolvido</InputLabel>
                <Select
                    value={resolvido ? 'sim' : 'não'}
                    label="Resolvido"
                    onChange={(e) => setResolvido(e.target.value === 'sim')}
                >
                    <MenuItem value="sim">Sim</MenuItem>
                    <MenuItem value="não">Não</MenuItem>
                </Select>
            </FormControl>
            <TextField
                label="Mensagem"
                size="small"
                multiline
                rows={3}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
            />
            <Box sx={{display: "flex", gap: 1}}>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!mensagem.trim()}
                >
                    Adicionar Relato
                </Button>
            </Box>
        </Box>
    );
}