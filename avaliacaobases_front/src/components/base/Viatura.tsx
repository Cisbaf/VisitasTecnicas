// src/components/base/Viaturas.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Box, Paper, Typography, Button, Stack, Chip, CircularProgress, Snackbar, Alert, IconButton } from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import ViaturaDialog from "./modal/DialogViatura";

export default function Viaturas({ baseId }: { baseId?: number }) {
    const params = useParams();
    const resolvedBaseId = baseId ?? (params?.baseId ? Number(params.baseId) : null);

    const [viaturas, setViaturas] = useState<Viatura[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
    const [selectedViatura, setSelectedViatura] = useState<Viatura | null>(null);

    const fetchViaturas = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const url = resolvedBaseId ? `/api/viatura?baseId=${resolvedBaseId}` : `/api/viatura`;
            const r = await fetch(url, { cache: "no-store" });
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

    useEffect(() => { fetchViaturas(); }, [resolvedBaseId]);

    const handleSave = async (viaturaData: ViaturaRequest) => {
        setSaving(true);
        setErrorMsg(null);
        try {
            if (!viaturaData.placa || !viaturaData.modelo || !viaturaData.ano || !(viaturaData.idBase ?? resolvedBaseId)) {
                throw new Error("Preencha placa, modelo, ano e idBase.");
            }

            const payload = { ...viaturaData, idBase: resolvedBaseId ?? viaturaData.idBase };
            const url = dialogMode === "edit" && selectedViatura?.id ? `/api/viatura/${selectedViatura.id}` : "/api/viatura";
            const method = dialogMode === "edit" ? "PUT" : "POST";

            const r = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
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
            const r = await fetch(`/api/viatura/${id}`, { method: "DELETE" });
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
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
            <IconButton size="small" onClick={() => openEditModal(v)}>
                <Edit fontSize="small" color="info" />
            </IconButton>
            <IconButton size="small" onClick={async (e) => {
                e.stopPropagation();
                if (!v.id) return setErrorMsg("Viatura sem ID");
                if (confirm("Tem certeza que deseja remover esta viatura?")) await handleDelete(v.id);
            }}>
                <Delete fontSize="small" color="error" />
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
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">Viaturas {resolvedBaseId ? `(Base ${resolvedBaseId})` : ""}</Typography>
                <Button startIcon={<Add />} variant="contained" onClick={openCreateModal}>
                    Nova Viatura
                </Button>
            </Stack>

            <Paper sx={{ p: 2, borderRadius: 2 }}>
                {resolvedBaseId === null && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Nenhuma base selecionada. Passe <code>baseId</code> como prop ou acesse via /base/[baseId]
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : errorMsg ? (
                    <Alert severity="error">{errorMsg}</Alert>
                ) : viaturas && viaturas.length === 0 ? (
                    <Typography>Não há viaturas cadastradas</Typography>
                ) : (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                        {viaturas?.map(v => (
                            <Paper
                                key={v.id ?? v.placa}
                                sx={{
                                    width: 240,
                                    p: 2,
                                    borderRadius: 2,
                                    boxShadow: 1,
                                    cursor: "pointer",
                                    "&:hover": { boxShadow: 3, backgroundColor: "action.hover" },
                                }}
                                onClick={() => openEditModal(v)}
                            >
                                <Stack spacing={0.5}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                            {v.placa ?? "—"}
                                        </Typography>
                                        <Chip label={v.statusOperacional ?? "—"} color={statusColor(v.statusOperacional)} size="small" />
                                    </Stack>

                                    <Typography variant="caption" color="text.secondary">
                                        {v.modelo ?? "Modelo não informado"} • {v.ano ?? "----"}
                                    </Typography>

                                    <Typography variant="body2">
                                        Tipo: <strong>{v.tipoViatura ?? "—"}</strong>
                                    </Typography>

                                    <Box sx={{ mt: 1 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Itens
                                        </Typography>
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 0.5 }}>
                                            {v.itens?.length ? v.itens.map((it, i) => (
                                                <Box key={i} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <Typography variant="body2">{it.nome || "—"}</Typography>
                                                    <Chip label={`${it.conformidade}%`} size="small" />
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
                viatura={selectedViatura ? {
                    placa: selectedViatura.placa || "",
                    modelo: selectedViatura.modelo || "",
                    ano: selectedViatura.ano || "",
                    tipoViatura: selectedViatura.tipoViatura || "USA",
                    statusOperacional: selectedViatura.statusOperacional || "Conforme",
                    idBase: selectedViatura.idBase ?? resolvedBaseId,
                    itens: selectedViatura.itens?.length ? selectedViatura.itens.map(item =>
                        ({ nome: item.nome || "", conformidade: item.conformidade ?? 100 }))
                        : [{ nome: "", conformidade: 100 }]
                } : null}
                onClose={() => setDialogOpen(false)}
                onSave={handleSave}
                loading={saving}
                baseId={resolvedBaseId}
            />

            <Snackbar open={!!successMsg} autoHideDuration={4000} onClose={() => setSuccessMsg(null)}>
                <Alert onClose={() => setSuccessMsg(null)} severity="success" sx={{ width: "100%" }}>
                    {successMsg}
                </Alert>
            </Snackbar>

            <Snackbar open={!!errorMsg && !dialogOpen} autoHideDuration={6000} onClose={() => setErrorMsg(null)}>
                <Alert onClose={() => setErrorMsg(null)} severity="error" sx={{ width: "100%" }}>
                    {errorMsg}
                </Alert>
            </Snackbar>
        </Box>
    );
}