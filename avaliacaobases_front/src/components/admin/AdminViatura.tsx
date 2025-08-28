"use client";
import React, {useEffect, useMemo, useState} from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {Add, Delete, Edit, Visibility} from "@mui/icons-material";
import ViaturaDialog from "@/components/base/modal/DialogViatura";
import {Viatura, ViaturaRequest} from '@/components/types';
import ViaturaChecklistsModal from "@/components/base/modal/ViaturaChecklistsModal";

export default function Viaturas() {

    const [viaturas, setViaturas] = useState<Viatura[] | null>(null);
    const [bases, setBases] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingBases, setLoadingBases] = useState<boolean>(true);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
    const [selectedViatura, setSelectedViatura] = useState<Viatura | null>(null);
    const [checklistsModalOpen, setChecklistsModalOpen] = useState(false);
    const [selectedidViatura, setSelectedidViatura] = useState<number | null>(null);

    // Novos estados para a filtragem
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedBaseId, setSelectedBaseId] = useState<number | string>("");

    const fetchViaturas = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const url = `/api/viatura`;
            const r = await fetch(url, {cache: "no-store"});
            const responseText = await r.text();

            if (!r.ok) throw new Error(responseText || r.statusText);
            setViaturas(responseText ? JSON.parse(responseText) : []);
        } catch (err: any) {
            setErrorMsg(err.message || "Erro ao carregar viaturas");
            setViaturas([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const parsedBases = localStorage.getItem("allBasesData");
        if (parsedBases) {
            try {
                setBases(JSON.parse(parsedBases));
            } catch (e) {
                console.error("Failed to parse bases from localStorage", e);
                setBases([]);
            }
            setLoadingBases(false);
        }
        fetchViaturas();
    }, []);

    const filteredViaturas = useMemo(() => {
        if (!viaturas) return [];

        const result = viaturas.filter(v => {
            const matchesSearch = searchTerm === "" ||
                v.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.tipoViatura?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesBase = selectedBaseId === "" || v.idBase === selectedBaseId;

            return matchesSearch && matchesBase;
        });

        if (result.length === 0 && (searchTerm !== "" || selectedBaseId !== "")) {
            return viaturas;
        }

        return result;
    }, [viaturas, searchTerm, selectedBaseId]);

    const openChecklistsModal = (idViatura: number) => {
        const id = Number(idViatura);
        if (!id || isNaN(id)) {
            setErrorMsg("ID da viatura inválido");
            return;
        }
        setSelectedidViatura(id);
        setChecklistsModalOpen(true);
    };

    const handleSave = async (viaturaData: ViaturaRequest) => {
        setSaving(true);
        setErrorMsg(null);
        try {
            if (!viaturaData.placa || !viaturaData.modelo || !viaturaData.ano) {
                throw new Error("Preencha placa, modelo, ano e idBase.");
            }

            const payload = {...viaturaData};
            const url = dialogMode === "edit" && selectedViatura?.id ? `/api/viatura/${selectedViatura.id}` : "/api/viatura";
            const method = dialogMode === "edit" ? "PUT" : "POST";

            const r = await fetch(url, {
                method,
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            });

            const responseText = await r.text();
            if (!r.ok) throw new Error(responseText || r.statusText);
            const result = responseText ? JSON.parse(responseText) : null;

            setSuccessMsg(`Viatura ${dialogMode === "create" ? "criada" : "atualizada"} com sucesso.`);
            setViaturas(prev => dialogMode === "create"
                ? (prev ? [result, ...prev] : [result])
                : (prev ? prev.map(v => v.id === selectedViatura?.id ? result : v) : [result])
            );
            setDialogOpen(false);
        } catch (err: any) {
            setErrorMsg(err.message || `Erro ao ${dialogMode === "create" ? "criar" : "atualizar"} viatura.`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id?: number) => {
        if (!id) return setErrorMsg("ID inválido para remoção.");

        try {
            const r = await fetch(`/api/viatura/${id}`, {method: "DELETE"});
            if (!r.ok) throw new Error(await r.text().catch(() => r.statusText));

            setSuccessMsg("Viatura removida com sucesso.");
            setViaturas(prev => prev ? prev.filter(v => v.id !== id) : []);
        } catch (err: any) {
            setErrorMsg(err.message || "Erro ao remover viatura.");
        }
    };

    const statusColor = useMemo(() => (status: string) => {
        const s = status?.toLowerCase();
        if (s?.includes("em operacao") || s?.includes("operação") || s?.includes("operacao")) return "success";
        if (s?.includes("em manutencao") || s?.includes("manutenção") || s?.includes("manutencao")) return "warning";
        if (s?.includes("fora de servico") || s?.includes("fora") || s?.includes("inoperante")) return "error";
        return "default";
    }, []);

    const viaturaActions = (v: Viatura) => (
        <Box sx={{display: "flex", justifyContent: "flex-end", gap: 1, mt: 1}}>
            {v.id && !isNaN(v.id) && (
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        openChecklistsModal(v.id!);
                    }}
                    title="Ver checklists"
                >
                    <Visibility fontSize="small" color="info"/>
                </IconButton>
            )}

            <IconButton size="small" onClick={() => openEditModal(v)}>
                <Edit fontSize="small" color="info"/>
            </IconButton>
            <IconButton size="small" onClick={async (e) => {
                e.stopPropagation();
                if (!v.id) return setErrorMsg("Viatura sem ID");
                if (confirm("Tem certeza que deseja remover esta viatura?")) await handleDelete(v.id);
            }}>
                <Delete fontSize="small" color="error"/>
            </IconButton>
        </Box>
    );

    const openCreateModal = () => {
        setDialogMode("create");
        setSelectedViatura(null);
        setDialogOpen(true);
    };

    const openEditModal = (viatura: Viatura) => {
        setDialogMode("edit");
        setSelectedViatura(viatura);
        setDialogOpen(true);
    };

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb: 2}}>
                <Box sx={{display: 'flex', alignItems: 'center', mb: 4}}>
                    <Typography variant="h4" fontWeight="600">
                        Viaturas
                    </Typography>
                </Box>
                <Button startIcon={<Add/>} variant="contained" onClick={openCreateModal}>
                    Nova Viatura
                </Button>
            </Stack>

            {/* Barra de pesquisa e Select */}
            <Box sx={{display: "flex", gap: 2, mb: 3}}>
                <TextField
                    label="Pesquisar por placa, modelo ou tipo"
                    variant="outlined"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FormControl variant="outlined" sx={{minWidth: 200}}>
                    <InputLabel>Filtrar por Base</InputLabel>
                    <Select
                        value={selectedBaseId}
                        onChange={(e) => setSelectedBaseId(Number(e.target.value))}
                        label="Filtrar por Base"
                    >
                        <MenuItem value="">
                            <em>Todas</em>
                        </MenuItem>
                        {bases.map(base => (
                            <MenuItem key={base.id} value={base.id}>{base.nome}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Paper sx={{p: 2, borderRadius: 2}}>
                {loading ? (
                    <Box sx={{display: "flex", justifyContent: "center", py: 6}}>
                        <CircularProgress/>
                    </Box>
                ) : errorMsg ? (
                    <Alert severity="error">{errorMsg}</Alert>
                ) : filteredViaturas.length === 0 ? (
                    <Typography>Não há viaturas cadastradas.</Typography>
                ) : (
                    <Box sx={{display: "flex", flexWrap: "wrap", gap: 2}}>
                        {filteredViaturas.map(v => (
                            <Paper
                                key={v.id ?? v.placa}
                                sx={{
                                    width: 240,
                                    p: 2,
                                    borderRadius: 2,
                                    boxShadow: 1,
                                    cursor: "pointer",
                                    "&:hover": {boxShadow: 3, backgroundColor: "action.hover"},
                                }}
                                onClick={() => openEditModal(v)}
                            >
                                <Stack spacing={0.5}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="subtitle1" sx={{fontWeight: 700}}>
                                            {v.placa ?? "—"}
                                        </Typography>
                                        <Chip label={v.statusOperacional ?? "—"}
                                              color={statusColor(v.statusOperacional)} size="small"/>
                                    </Stack>

                                    <Typography variant="caption" color="text.secondary">
                                        {v.modelo ?? "Modelo não informado"} • {v.ano ?? "----"}
                                    </Typography>

                                    <Typography variant="body2">
                                        Tipo: <strong>{v.tipoViatura ?? "—"}</strong>
                                    </Typography>
                                    <Typography variant="body2">
                                        Base: <strong>{
                                        loadingBases ? (
                                            <CircularProgress size={12}/>
                                        ) : (
                                            bases.find(b => b.id === v.idBase)?.nome || (v.idBase ? `Base #${v.idBase}` : "—")
                                        )
                                    }</strong>
                                    </Typography>

                                    <Box sx={{mt: 1}}>
                                        <Typography variant="caption" color="text.secondary">
                                            Itens
                                        </Typography>
                                        <Box sx={{display: "flex", flexDirection: "column", gap: 0.5, mt: 0.5}}>
                                            {v.itens?.length ? v.itens.map((it, i) => (
                                                <Box key={i} sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center"
                                                }}>
                                                    <Typography variant="body2">{it.nome || "—"}</Typography>
                                                    <Chip label={`${it.conformidade}%`} size="small"/>
                                                </Box>
                                            )) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Nenhum item
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                    {viaturaActions(v)}
                                </Stack>
                            </Paper>
                        ))}
                    </Box>
                )}
            </Paper>

            <ViaturaDialog
                open={dialogOpen}
                mode={dialogMode}
                viatura={selectedViatura}
                onClose={() => setDialogOpen(false)}
                onSave={handleSave}
                loading={saving}
            />
            <ViaturaChecklistsModal
                open={checklistsModalOpen}
                onClose={() => setChecklistsModalOpen(false)}
                idViatura={selectedidViatura}
            />

            <Snackbar open={!!successMsg} autoHideDuration={4000} onClose={() => setSuccessMsg(null)}>
                <Alert onClose={() => setSuccessMsg(null)} severity="success" sx={{width: "100%"}}>
                    {successMsg}
                </Alert>
            </Snackbar>

            <Snackbar open={!!errorMsg && !dialogOpen} autoHideDuration={6000} onClose={() => setErrorMsg(null)}>
                <Alert onClose={() => setErrorMsg(null)} severity="error" sx={{width: "100%"}}>
                    {errorMsg}
                </Alert>
            </Snackbar>
        </Box>
    );
}