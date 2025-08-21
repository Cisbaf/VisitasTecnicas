// src/components/base/Viaturas.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
    Box,
    Paper,
    Typography,
    Button,
    Stack,
    Chip,
    CircularProgress,
    Snackbar,
    Alert,
    IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ViaturaDialog from "./modal/DialogViatura";

/** Tipagens mínimas */
type Item = { nome: string; conformidade: number };
type ViaturaRequest = {
    placa: string;
    modelo: string;
    ano: string;
    tipoViatura: string;
    statusOperacional: string;
    idBase: number | null;
    itens: Item[];
};
type Viatura = ViaturaRequest & { id?: number };

export default function Viaturas({ baseId }: { baseId?: number }) {
    const params = useParams();
    const routeBaseId = params?.baseId ? Number(params.baseId) : null;
    const resolvedBaseId = baseId ?? routeBaseId ?? null;

    const [viaturas, setViaturas] = useState<Viatura[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Estado para controlar o diálogo
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
    const [selectedViatura, setSelectedViatura] = useState<Viatura | null>(null);

    useEffect(() => {
        fetchViaturas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedBaseId]);

    async function fetchViaturas() {
        setLoading(true);
        setErrorMsg(null);
        try {
            const url = resolvedBaseId ? `/api/viatura?baseId=${resolvedBaseId}` : `/api/viatura`;
            const r = await fetch(url, { cache: "no-store" });

            const responseText = await r.text();

            if (!r.ok) {
                try {
                    const errorData = JSON.parse(responseText);
                    throw new Error(errorData.message || errorData.error || responseText || r.statusText);
                } catch {
                    throw new Error(responseText || r.statusText);
                }
            }

            // resposta ok
            const data = responseText ? (JSON.parse(responseText) as Viatura[]) : [];
            setViaturas(data);
        } catch (err: any) {
            console.error("fetch viaturas err", err);
            setErrorMsg(err.message || "Erro ao carregar viaturas. Veja o console para detalhes.");
            setViaturas([]);
        } finally {
            setLoading(false);
        }
    }

    function openCreateModal() {
        setDialogMode("create");
        setSelectedViatura(null);
        setDialogOpen(true);
    }

    function openEditModal(viatura: Viatura) {
        setDialogMode("edit");
        setSelectedViatura(viatura);
        setDialogOpen(true);
    }

    function closeDialog() {
        setDialogOpen(false);
    }

    async function handleSave(viaturaData: ViaturaRequest) {
        setSaving(true);
        setErrorMsg(null);

        try {
            if (!viaturaData.placa || !viaturaData.modelo || !viaturaData.ano || !(viaturaData.idBase ?? resolvedBaseId)) {
                setErrorMsg("Preencha placa, modelo, ano e idBase.");
                setSaving(false);
                return;
            }

            const payload = { ...viaturaData, idBase: resolvedBaseId ?? viaturaData.idBase };

            let url = "/api/viatura";
            let method = "POST";

            if (dialogMode === "edit" && selectedViatura?.id) {
                url = `/api/viatura/${selectedViatura.id}`;
                method = "PUT";
            }

            const r = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const responseText = await r.text();

            if (!r.ok) {
                try {
                    const errorData = JSON.parse(responseText);
                    throw new Error(errorData.message || errorData.error || responseText || r.statusText);
                } catch {
                    throw new Error(responseText || r.statusText);
                }
            }

            const result = responseText ? (JSON.parse(responseText) as Viatura) : null;

            if (dialogMode === "create") {
                setSuccessMsg("Viatura criada com sucesso.");
                if (result) setViaturas(prev => (prev ? [result, ...prev] : [result]));
            } else {
                setSuccessMsg("Viatura atualizada com sucesso.");
                if (result) setViaturas(prev => (prev ? prev.map(v => (v.id === selectedViatura?.id ? result : v)) : [result]));
            }

            setDialogOpen(false);
        } catch (err: any) {
            console.error(`${dialogMode} viatura err`, err);
            setErrorMsg(err.message || `Erro ao ${dialogMode === "create" ? "criar" : "atualizar"} viatura.`);
        } finally {
            setSaving(false);
        }
    }

    // Deleção: função assíncrona que trata 204 / body vazio / json / text
    async function handleDelete(id?: number) {
        if (!id) {
            setErrorMsg("ID inválido para remoção.");
            return;
        }

        try {
            const r = await fetch(`/api/viatura/${id}`, { method: "DELETE" });

            const ct = r.headers.get("content-type") || "";

            if (!r.ok) {
                let errMsg = r.statusText;
                if (ct.includes("application/json")) {
                    const json = await r.json().catch(() => null);
                    errMsg = json?.message || JSON.stringify(json) || errMsg;
                } else {
                    const text = await r.text().catch(() => null);
                    errMsg = text || errMsg;
                }
                throw new Error(errMsg);
            }

            // sucesso (pode ser 204 sem body)
            setSuccessMsg("Viatura removida com sucesso.");
            setViaturas(prev => (prev ? prev.filter(v => v.id !== id) : []));
        } catch (err: any) {
            console.error("Erro ao remover viatura:", err);
            setErrorMsg(err.message || "Erro ao remover viatura.");
        }
    }

    const statusColor = useMemo(
        () => (status: string) => {
            if (!status) return "default";
            const s = status.toLowerCase();
            if (s.includes("em operacao") || s.includes("operação") || s.includes("operacao")) return "success";
            if (s.includes("em manutencao") || s.includes("manutenção") || s.includes("manutencao")) return "warning";
            if (s.includes("fora de servico") || s.includes("fora") || s.includes("inoperante")) return "error";
            return "default";
        },
        []
    );

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">Viaturas {resolvedBaseId ? `(Base ${resolvedBaseId})` : ""}</Typography>
                <Button startIcon={<AddIcon />} variant="contained" onClick={openCreateModal}>
                    Nova Viatura
                </Button>
            </Stack>

            <Paper sx={{ p: 2, borderRadius: 2 }}>
                {resolvedBaseId === null ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Nenhuma base selecionada. Passe <code>baseId</code> como prop ao componente ou acesse via /base/[baseId] para listar/novas viaturas desta base.
                    </Alert>
                ) : null}

                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : errorMsg ? (
                    <Alert severity="error">{errorMsg}</Alert>
                ) : viaturas && viaturas.length === 0 ? (
                    <Typography>Não há viaturas cadastradas para esta base.</Typography>
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

                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        Tipo: <strong>{v.tipoViatura ?? "—"}</strong>
                                    </Typography>

                                    <Box sx={{ mt: 1 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Itens
                                        </Typography>
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 0.5 }}>
                                            {v.itens && v.itens.length ? (
                                                v.itens.map((it, i) => (
                                                    <Box key={i} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <Typography variant="body2">{it.nome || "—"}</Typography>
                                                        <Chip label={`${it.conformidade}%`} size="small" />
                                                    </Box>
                                                ))
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Nenhum item
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openEditModal(v);
                                            }}
                                        >
                                            <EditIcon fontSize="small" color="info" />
                                        </IconButton>

                                        <IconButton
                                            size="small"
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                if (!v.id) {
                                                    setErrorMsg("Viatura sem ID, não é possível remover.");
                                                    return;
                                                }
                                                if (confirm("Tem certeza que deseja remover esta viatura?")) {
                                                    await handleDelete(v.id);
                                                }
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" color="error" />
                                        </IconButton>
                                    </Box>
                                </Stack>
                            </Paper>
                        ))}
                    </Box>
                )}
            </Paper>

            {/* Diálogo unificado para criar/editar */}
            <ViaturaDialog
                open={dialogOpen}
                mode={dialogMode}
                viatura={
                    selectedViatura
                        ? {
                            placa: selectedViatura.placa || "",
                            modelo: selectedViatura.modelo || "",
                            ano: selectedViatura.ano || "",
                            tipoViatura: selectedViatura.tipoViatura || "USA",
                            statusOperacional: selectedViatura.statusOperacional || "Conforme",
                            idBase: selectedViatura.idBase ?? resolvedBaseId,
                            itens:
                                selectedViatura.itens && selectedViatura.itens.length > 0
                                    ? selectedViatura.itens.map(item => ({ nome: item.nome || "", conformidade: item.conformidade ?? 100 }))
                                    : [{ nome: "", conformidade: 100 }],
                        }
                        : null
                }
                onClose={closeDialog}
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
