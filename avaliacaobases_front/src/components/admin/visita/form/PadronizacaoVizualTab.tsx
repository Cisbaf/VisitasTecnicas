"use client";
import React, { useState, useEffect, useCallback } from "react";
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
import { FormAccordion } from "./FormAccordion";
import DynamicForm from "../DynamicForm";
import FormEditorModal from "../modal/FormEditorModal";

import MidiaGallery from "./MidiaGallery";

import { FormCategory, RespostaResponse, Select, Midia, Flag } from "@/components/types";

interface PadronizacaoVizualTabProps {
    visitaId: number;
    onChecklistAdded: () => void;
}

export default function PadronizacaoVizualTab({ visitaId, onChecklistAdded }: PadronizacaoVizualTabProps) {
    const {
        forms,
        loading: formsLoading,
        error: formsError,
        setError,
        modalOpen,
        editingForm,
        handleSaveForm,
        handleDeleteForm,
        handleOpenModal,
        handleCloseModal,
    } = useForms("PADRONIZACAO", onChecklistAdded);

    const [respostas, setRespostas] = useState<RespostaResponse[]>([]);
    const [midiasPorCategoria, setMidiasPorCategoria] = useState<{ [key: number]: Midia[] }>({});
    const [statusConformidade, setStatusConformidade] = useState<{ [key: string]: Select }>({});
    const [expanded, setExpanded] = useState<string | false>(false);

    function StatusOverviewInternal({ forms, statusConformidade }: { forms: FormCategory[]; statusConformidade: { [key: string]: Select } }) {
        return (
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Status da Base</Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    {forms.map((form) => {
                        const formKey = form.id?.toString() || form.categoria;
                        const status = statusConformidade[formKey] || Select.NAO_AVALIADO;
                        const color = status === Select.CONFORME ? "success" : status === Select.PARCIAL ? "warning" : status === Select.NAO_CONFORME ? "error" : "default";

                        return (
                            <Chip
                                key={formKey}
                                label={form.categoria}
                                color={color}
                                variant="outlined"
                            />
                        );
                    })}
                </Box>
            </Paper>
        );
    }

    const fetchMidiasPorCategoria = async (idCategoria: number) => {
        try {
            const response = await fetch(`/api/arquivo/category/${idCategoria}`);
            if (!response.ok) {
                setMidiasPorCategoria(prev => ({ ...prev, [idCategoria]: [] }));
                return;
            }
            const raw: any[] = await response.json();
            const midiasData: Midia[] = raw.map(r => ({
                id: r.id,
                tipoArquivo: r.tipoArquivo,
                base64DataUrl: r.base64DataUrl ?? null,
                dataUpload: r.dataUpload,
                idVisita: r.idVisita ?? null,
                idCategoria: r.idCategoria ?? null,
                flag: (r.flag ?? r.bandeira ?? null) as Flag,
            }));
            setMidiasPorCategoria(prev => ({ ...prev, [idCategoria]: midiasData }));
        } catch (err) {
            console.error(`Erro ao carregar mídias para a categoria ${idCategoria}:`, err);
            setMidiasPorCategoria(prev => ({ ...prev, [idCategoria]: [] }));
        }
    };

    const fetchSpecificData = useCallback(async () => {
        if (forms.length === 0) return;
        try {
            const respostasResponse = await fetch(`/api/form/answers/visit/${visitaId}`);
            const respostasData = respostasResponse.ok ? await respostasResponse.json() : [];
            setRespostas(respostasData);

            calcularStatusConformidade(forms, respostasData);

            forms.forEach((form) => {
                if (form.id) fetchMidiasPorCategoria(form.id);
            });
        } catch (err) {
            setError("Erro ao carregar dados da visita: " + (err instanceof Error ? err.message : String(err)));
        }
    }, [forms, visitaId, setError]);

    useEffect(() => {
        fetchSpecificData();
    }, [fetchSpecificData]);

    const calcularStatusConformidade = (formsData: FormCategory[], respostasData: RespostaResponse[]) => {
        const newStatus: { [key: string]: Select } = {};
        formsData.forEach((form) => {
            const formKey = form.id!.toString();
            const camposDeStatus = (form.campos || []).filter((c: any) => c.tipo === "SELECT");
            if (camposDeStatus.length === 0) {
                newStatus[formKey] = Select.NAO_AVALIADO;
                return;
            }

            let conformeCount = 0;
            let naoConformeCount = 0;
            let parcialCount = 0;
            let camposSemResposta = 0;

            camposDeStatus.forEach((campo: any) => {
                const campoId = campo.id;
                const resposta = (respostasData || []).find((r) => r.campoId === campoId);

                if (resposta && resposta.select !== undefined && resposta.select !== null) {
                    const valorNormalizado = String(resposta.select).toUpperCase().trim();

                    if (valorNormalizado === "CONFORME") {
                        conformeCount++;
                    } else if (valorNormalizado === "NAO_CONFORME" || valorNormalizado === "NÃO_CONFORME") {
                        naoConformeCount++;
                    } else if (valorNormalizado === "PARCIAL" || valorNormalizado.startsWith("PARC")) {
                        parcialCount++;
                    } else {
                        camposSemResposta++;
                    }
                } else {
                    camposSemResposta++;
                }
            });

            if (camposSemResposta < camposDeStatus.length) {
                if (naoConformeCount > 0) {
                    newStatus[formKey] = Select.NAO_CONFORME;
                } else if (parcialCount > 0) {
                    newStatus[formKey] = Select.PARCIAL;
                } else if (conformeCount === camposDeStatus.length) {
                    newStatus[formKey] = Select.CONFORME;
                } else if (conformeCount > 0) {
                    newStatus[formKey] = Select.PARCIAL;
                } else {
                    newStatus[formKey] = Select.NAO_AVALIADO;
                }
            } else {
                newStatus[formKey] = Select.NAO_AVALIADO;
            }
        });
        setStatusConformidade(newStatus);
    };

    const handleUploadMidia = async (file: File, tipo: string, idCategoria: number) => {
        const formData = new FormData();
        formData.append(
            "midia",
            new Blob(
                [JSON.stringify({ tipoArquivo: tipo, idVisita: visitaId, idCategoria })],
                { type: "application/json" }
            )
        );
        formData.append("file", file);
        try {
            const response = await fetch("/api/arquivo", { method: "POST", body: formData });
            if (!response.ok) throw new Error("Falha no upload");
            await fetchMidiasPorCategoria(idCategoria);
        } catch (err) {
            setError("Erro ao fazer upload da imagem.");
        }
    };

    const handleSetFlag = async (midiaId: number, flag: Flag, idCategoria: number) => {
        setMidiasPorCategoria(prev => ({
            ...prev,
            [idCategoria]: (prev[idCategoria] ?? []).map(m => m.id === midiaId ? { ...m, flag } : m),
        }));
        try {
            const midia = midiasPorCategoria[idCategoria]?.find(m => m.id === midiaId);
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

    const handleChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

    if (formsLoading) {
        return <Box display="flex" justifyContent="center" minHeight="200px"><CircularProgress /></Box>;
    }

    return (
        <>
            <TabHeader title="Padronização Visual" onAddClick={() => handleOpenModal()} />

            {formsError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{formsError}</Alert>}

            <StatusOverviewInternal forms={forms} statusConformidade={statusConformidade} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {forms.map((form) => {
                    const formKey = form.id!.toString();
                    const formStatus = statusConformidade[formKey] || Select.NAO_AVALIADO;
                    const color = formStatus === Select.CONFORME ? "success" : formStatus === Select.PARCIAL ? "warning" : formStatus === Select.NAO_CONFORME ? "error" : "default";

                    return (
                        <FormAccordion
                            key={formKey}
                            form={form}
                            expanded={expanded === formKey}
                            onChange={handleChange(formKey)}
                            onEdit={handleOpenModal}
                            onDelete={handleDeleteForm}
                            summaryContent={<Chip size="small" label={formStatus} color={color} />}
                        >
                            <DynamicForm form={form} visitaId={visitaId} onSave={fetchSpecificData} />

                            <MidiaGallery
                                midias={midiasPorCategoria[form.id!] || []}
                                idCategoria={form.id!}
                                onSetFlag={handleSetFlag}
                                onUploadMidia={handleUploadMidia}
                            />
                        </FormAccordion>
                    );
                })}
            </Box>

            <FormEditorModal
                open={modalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveForm}
                initialData={editingForm}
                tipoForm="PADRONIZACAO"
            />
        </>
    );
}
