"use client";
import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    IconButton,
    Stack,
    Chip,
    CircularProgress,
    Alert,
    InputLabel,
    FormControl,
    Button,
    Box,
    Typography,
    Collapse,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { Item, ViaturaRequest } from "@/components/types";

interface ViaturaDialogProps {
    open: boolean;
    mode: "create" | "edit";
    viatura: ViaturaRequest | null;
    onClose: () => void;
    onSave: (viatura: ViaturaRequest) => void;
    loading?: boolean;
    baseId?: number | null;
}

export default function ViaturaDialog({
    open,
    mode,
    viatura,
    onClose,
    onSave,
    loading = false,
    baseId
}: ViaturaDialogProps) {
    const [form, setForm] = React.useState<ViaturaRequest>({
        placa: "",
        modelo: "",
        ano: "",
        tipoViatura: "USA",
        statusOperacional: "Conforme",
        idBase: baseId ?? null,
        itens: [{ nome: "", conformidade: 100 }],
    });

    const [showCustomType, setShowCustomType] = React.useState(false);

    // Atualizar o formulário quando a prop viatura mudar
    React.useEffect(() => {
        if (viatura) {
            setForm(viatura);
            // Verificar se o tipo de viatura é um valor personalizado (não está nas opções padrão)
            if (viatura.tipoViatura !== "USA" && viatura.tipoViatura !== "USB") {
                setShowCustomType(true);
            } else {
                setShowCustomType(false);
            }
        } else {
            setForm({
                placa: "",
                modelo: "",
                ano: "",
                tipoViatura: "USA",
                statusOperacional: "Conforme",
                idBase: baseId ?? null,
                itens: [{ nome: "", conformidade: 100 }],
            });
            setShowCustomType(false);
        }
    }, [viatura, baseId]);

    const updateForm = <K extends keyof ViaturaRequest>(key: K, value: ViaturaRequest[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const updateItemAt = (index: number, patch: Partial<Item>) => {
        setForm(prev => {
            const itens = prev.itens.map((it, i) => (i === index ? { ...it, ...patch } : it));
            return { ...prev, itens };
        });
    };

    const addItem = () => {
        setForm(prev => ({ ...prev, itens: [...prev.itens, { nome: "", conformidade: 100 }] }));
    };

    const removeItem = (index: number) => {
        setForm(prev => ({ ...prev, itens: prev.itens.filter((_, i) => i !== index) }));
    };

    const handleTipoViaturaChange = (value: string) => {
        if (value === "Outro") {
            setShowCustomType(true);
            updateForm("tipoViatura", "");
        } else {
            setShowCustomType(false);
            updateForm("tipoViatura", value);
        }
    };

    const handleSave = () => {
        onSave(form);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {mode === "create" ? "Criar Viatura" : `Editar Viatura ${viatura?.placa ? `- ${viatura.placa}` : ""}`}
                <IconButton aria-label="close" onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }} size="large">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2}>
                    <TextField
                        label="Placa"
                        value={form.placa}
                        onChange={e => updateForm("placa", e.target.value.toUpperCase())}
                        placeholder="AAA9999"
                        fullWidth
                    />
                    <TextField
                        label="Modelo"
                        value={form.modelo}
                        onChange={e => updateForm("modelo", e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Ano"
                        value={form.ano}
                        onChange={e => updateForm("ano", e.target.value)}
                        placeholder="2023"
                        fullWidth
                    />

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <FormControl fullWidth>
                            <InputLabel id="tipo-label">Tipo Viatura</InputLabel>
                            <Select
                                labelId="tipo-label"
                                label="Tipo Viatura"
                                value={showCustomType ? "Outro" : form.tipoViatura}
                                onChange={e => handleTipoViaturaChange(e.target.value as string)}
                            >
                                <MenuItem value="USA">USA</MenuItem>
                                <MenuItem value="USB">USB</MenuItem>
                                <MenuItem value="Outro">Outro</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel id="status-label">Status Operacional</InputLabel>
                            <Select
                                labelId="status-label"
                                label="Status Operacional"
                                value={form.statusOperacional}
                                onChange={e => updateForm("statusOperacional", e.target.value as string)}
                            >
                                <MenuItem value="Em Operacao">Em Operação</MenuItem>
                                <MenuItem value="Em Manutencao">Em Manutenção</MenuItem>
                                <MenuItem value="Fora de Servico">Fora de Serviço</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>

                    {/* Campo para tipo de viatura personalizado */}
                    <Collapse in={showCustomType}>
                        <TextField
                            label="Digite o tipo de viatura"
                            value={form.tipoViatura}
                            onChange={e => updateForm("tipoViatura", e.target.value)}
                            fullWidth
                        />
                    </Collapse>

                    <TextField
                        label="ID da Base"
                        type="number"
                        value={form.idBase ?? ""}
                        onChange={e => updateForm("idBase", e.target.value === "" ? null : Number(e.target.value))}
                        helperText={baseId ? `Usando idBase ${baseId} (route/prop)` : ""}
                        fullWidth
                    />

                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Itens (manutenção / equipamentos)
                        </Typography>
                        <Stack spacing={1}>
                            {form.itens.map((it, idx) => (
                                <Stack direction="row" spacing={1} key={idx} alignItems="center">
                                    <TextField
                                        label="Nome do item"
                                        value={it.nome}
                                        onChange={e => updateItemAt(idx, { nome: e.target.value })}
                                        sx={{ flex: 1 }}
                                        size="small"
                                    />
                                    <TextField
                                        label="% conformidade"
                                        value={String(it.conformidade)}
                                        onChange={e =>
                                            updateItemAt(idx, {
                                                conformidade: Math.max(0, Math.min(100, Number(e.target.value || 0))),
                                            })
                                        }
                                        type="number"
                                        size="small"
                                        sx={{ width: 110 }}
                                        inputProps={{ min: 0, max: 100 }}
                                    />
                                    <IconButton aria-label="remover" onClick={() => removeItem(idx)} size="large">
                                        <DeleteIcon />
                                    </IconButton>
                                </Stack>
                            ))}
                            <Button onClick={addItem} size="small" variant="outlined">
                                Adicionar item
                            </Button>
                        </Stack>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancelar
                </Button>
                <Button onClick={handleSave} variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={18} /> : (mode === "create" ? "Salvar Viatura" : "Atualizar Viatura")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}