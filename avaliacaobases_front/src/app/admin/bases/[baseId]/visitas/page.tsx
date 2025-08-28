"use client";
import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    Alert,
    CircularProgress,
    IconButton,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import {
    Add as AddIcon,
    ArrowBack as BackIcon,
} from "@mui/icons-material";
import { useRouter, useParams } from "next/navigation";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import { VisitaDetails, RelatoDTO } from "@/components/types";
import NewVisitaDialog from "@/components/admin/visita/NewVisitaDialog";
import VisitaList from "@/components/admin/visita/VisitaList";

export default function BaseVisitasPage() {
    const router = useRouter();
    const params = useParams();
    const baseId = Number((params as any).baseId);

    const [visitas, setVisitas] = useState<VisitaDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openNewDialog, setOpenNewDialog] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [current, setCurrent] = useState<VisitaDetails | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [relatos, setRelato] = useState<RelatoDTO[]>([]);

    useEffect(() => {
        fetchVisitas();
    }, [baseId]);

    async function fetchVisitas() {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(`/api/visita/base/${baseId}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const text = await res.text();
            const data = text ? JSON.parse(text) : [];
            setVisitas(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(String(err?.message ?? err));
        } finally {
            setLoading(false);
        }
    }

    async function openVisitDetail(id: number) {
        try {
            setDetailLoading(true);
            setError(null);

            const res = await fetch(`/api/visita/${id}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data: VisitaDetails = await res.json();
            setCurrent(data);

            const rRes = await fetch(`/api/visita/relatos/visita/${id}`);
            if (rRes.ok) {
                const rData: RelatoDTO[] = await rRes.json();
                setRelato(rData);
            } else {
                setRelato([]);
            }

            setOpenDetail(true);
        } catch (err: any) {
            setError(String(err?.message ?? err));
        } finally {
            setDetailLoading(false);
        }
    }

    async function handleCreateVisita(date: Date | null, obs: string) {
        try {
            const payload = {
                dataVisita: date ? date.toISOString().split("T")[0] : null,
                idBase: baseId,
                observacoes: obs,
            };
            const res = await fetch(`/api/visita`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Falha ao criar visita");
            await fetchVisitas();
            setOpenNewDialog(false);
        } catch (err: any) {
            setError(String(err?.message ?? err));
        }
    }

    async function handleDeleteVisita(id: number) {
        if (!confirm("Excluir esta visita?")) return;
        try {
            const res = await fetch(`/api/visita/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Falha ao excluir visita");
            setVisitas((p) => p.filter((v) => v.id !== id));
            if (current?.id === id) {
                setOpenDetail(false);
                setCurrent(null);
            }
        } catch (err: any) {
            setError(String(err?.message ?? err));
        }
    }


    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <IconButton onClick={() => router.push("/admin/bases")} sx={{ mr: 1 }}>
                        <BackIcon />
                    </IconButton>
                    <Typography variant="h4">Visitas da Base {baseId}</Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Typography variant="h6">{visitas.length} visita(s)</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenNewDialog(true)}>
                        Nova Visita
                    </Button>
                </Box>

                <VisitaList
                    baseId={baseId}
                    visitas={visitas}
                    loading={loading}
                    openVisitDetail={openVisitDetail}
                    handleDeleteVisita={handleDeleteVisita}
                />

                <NewVisitaDialog
                    open={openNewDialog}
                    onClose={() => setOpenNewDialog(false)}
                    onCreate={handleCreateVisita}
                />

            </Box>
        </LocalizationProvider>
    );
}