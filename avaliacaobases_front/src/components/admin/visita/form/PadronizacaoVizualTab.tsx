"use client";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Box,
    CircularProgress,
    Chip,
    Typography,
    Paper,
} from "@mui/material";

import { useForms } from "@/components/admin/hooks/useForms";
import { TabHeader } from "./TabHeader";
import FormEditorModal from "../modal/FormEditorModal";

import MidiaGallery from "./MidiaGallery";

import { FormCategory, Select, Midia, Flag } from "@/components/types";

interface PadronizacaoVizualTabProps {
    visitaId: number;
}

export default function PadronizacaoVizualTab({ visitaId }: PadronizacaoVizualTabProps) {

    const [midiasPorVisita, setMidiasPorVisita] = useState<{ [key: number]: Midia[] }>({});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);



    useEffect(() => {
        try {
            setLoading(true);
            fetchMidiasPorVisita(visitaId)
        } catch (err) {
            setError("Erro ao carregar mídias.");
        } finally {
            setLoading(false);
        }
    }, [visitaId]);

    const fetchMidiasPorVisita = async (visitaId: number) => {
        try {
            const response = await fetch(`/api/arquivo/visita/${visitaId}`);
            if (!response.ok) {
                setMidiasPorVisita(prev => ({ ...prev, [visitaId]: [] }));
                return;
            }
            const raw: any[] = await response.json();
            const midiasData: Midia[] = raw.map(r => ({
                id: r.id,
                tipoArquivo: r.tipoArquivo,
                base64DataUrl: r.base64DataUrl ?? null,
                dataUpload: r.dataUpload,
                idVisita: r.idVisita ?? null,
                flag: (r.flag ?? r.bandeira ?? null) as Flag,
            }));
            setMidiasPorVisita(prev => ({ ...prev, [visitaId]: midiasData }));
        } catch (err) {
            console.error(`Erro ao carregar mídias para a categoria ${visitaId}:`, err);
            setMidiasPorVisita(prev => ({ ...prev, [visitaId]: [] }));
        }
    };

    const handleUploadMidia = async (file: File, tipo: string) => {
        const formData = new FormData();
        formData.append(
            "midia",
            new Blob(
                [JSON.stringify({ tipoArquivo: tipo, idVisita: visitaId })],
                { type: "application/json" }
            )
        );
        formData.append("file", file);
        try {
            const response = await fetch("/api/arquivo", { method: "POST", body: formData });
            if (!response.ok) throw new Error("Falha no upload");
            await fetchMidiasPorVisita(visitaId);
        } catch (err) {
            setError("Erro ao fazer upload da imagem.");
        }
    };

    const handleSetFlag = async (midiaId: number, flag: Flag) => {
        setMidiasPorVisita(prev => ({
            ...prev,
            [visitaId]: (prev[visitaId] ?? []).map(m => m.id === midiaId ? { ...m, flag } : m),
        }));
        try {
            const midia = midiasPorVisita[visitaId]?.find(m => m.id === midiaId);
            if (midia) midia.flag = flag;
            console.log("Persistindo flag no backend:", midia);

            await fetch(`/api/arquivo/${midiaId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(midia),
            });
        } catch (err) {
            console.warn("Erro ao persistir flag (não crítico):", err);
        }
    };


    if (loading) {
        return <Box display="flex" justifyContent="center" minHeight="200px"><CircularProgress /></Box>;
    }

    return (
        <>
            <Typography variant="h4" fontWeight="600">Padronização Visual </Typography>


            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <MidiaGallery
                    midias={midiasPorVisita[visitaId] || []}
                    onSetFlag={handleSetFlag}
                    onUploadMidia={handleUploadMidia}
                />
            </Box>

        </>
    );
}
