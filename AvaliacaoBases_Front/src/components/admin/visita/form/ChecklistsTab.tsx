"use client";
import React, { useState } from "react";
import { Alert, Box, Button, CircularProgress, Paper, Typography, useMediaQuery, useTheme } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FormEditorModal from "../modal/FormEditorModal";
import { useForms } from "@/components/admin/hooks/useForms";
import { TabHeader } from "./TabHeader";
import { SummaryAccordion } from "./Accordion/SummaryAccordion";
import { PREDEFINED_SUMMARIES } from "@/components/types";
import { downloadAllChecklistsPdf } from "@/lib/checklistPdf";

interface ChecklistsTabProps {
    visitaId: number;
}

interface ChecklistAnswerResponse {
    campoId?: number;
    texto?: string;
    checkbox?: string;
}

export default function ChecklistsTab({ visitaId }: ChecklistsTabProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const {
        forms, loading, error, setError, modalOpen, editingForm,
        fetchForms, handleSaveForm, handleDeleteForm,
        handleOpenModal, handleCloseModal,
    } = useForms(visitaId);

    const [expandedSummary, setExpandedSummary] = useState<string | false>(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);

    const handleSummaryChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedSummary(isExpanded ? panel : false);
    };

    if (loading) {
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px"><CircularProgress /></Box>;
    }

    const formsPorSumario = PREDEFINED_SUMMARIES.map(sumario => ({
        ...sumario,
        forms: forms.filter(form => form.summaryId === sumario.id)
    }));

    const handleDownloadAllPdf = async () => {
        try {
            setDownloadingPdf(true);
            setError('');

            const orderedForms = formsPorSumario.flatMap((sumario) => sumario.forms);
            const campoIds = orderedForms.flatMap((form) =>
                (form.campos || [])
                    .filter((field) => field.id)
                    .map((field) => field.id as number)
            );

            const answersByField: Record<string, string> = {};

            if (campoIds.length > 0) {
                const response = await fetch('/api/form/answers/fields', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(campoIds),
                });

                if (!response.ok) throw new Error('Falha ao carregar respostas para o PDF');

                const answers: ChecklistAnswerResponse[] = await response.json();
                answers.forEach((answer) => {
                    const fieldId = answer.campoId?.toString();
                    if (!fieldId) return;

                    if (answer.texto !== undefined && answer.texto !== null && answer.texto !== '') {
                        answersByField[fieldId] = answer.texto;
                    } else if (answer.checkbox && answer.checkbox !== 'NOT_GIVEN') {
                        answersByField[fieldId] = answer.checkbox;
                    }
                });
            }

            const summarySections = formsPorSumario.map((sumario) => ({
                summary: { id: sumario.id, titulo: sumario.titulo },
                sections: sumario.forms.map((form) => {
                    const formData: { [key: string]: string } = {};
                    (form.campos || []).forEach((field) => {
                        if (field.id) formData[field.id.toString()] = answersByField[field.id.toString()] ?? '';
                    });
                    return { form, formData };
                }),
            })).filter((sumario) => sumario.sections.length > 0);

            downloadAllChecklistsPdf(summarySections, 'Checklists da visita');
        } catch (err) {
            setError('Erro ao baixar PDF: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setDownloadingPdf(false);
        }
    };

    return (
        <>
            <TabHeader title="Formulários de Inspeção" onAddClick={() => handleOpenModal()}>
                <Button
                    variant="outlined"
                    startIcon={downloadingPdf ? <CircularProgress size={18} /> : <PictureAsPdfIcon />}
                    onClick={handleDownloadAllPdf}
                    disabled={downloadingPdf || forms.length === 0}
                    fullWidth={isMobile}
                >
                    {downloadingPdf ? 'Gerando PDF...' : 'Baixar todos em PDF'}
                </Button>
            </TabHeader>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            {forms.length === 0 ? (
                <Paper sx={{ p: isMobile ? 2 : 4, textAlign: 'center' }}>
                    <Typography>Nenhum formulário encontrado. Crie o primeiro!</Typography>
                </Paper>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 1 : 2 }}>
                    {formsPorSumario.map((sumario) => {
                        const summaryKey = `summary-${sumario.id}`;
                        return (
                            <SummaryAccordion
                                key={summaryKey}
                                summary={sumario}
                                forms={sumario.forms}
                                expanded={expandedSummary === summaryKey}
                                onChange={handleSummaryChange(summaryKey)}
                                onEditForm={handleOpenModal}
                                onDeleteForm={handleDeleteForm}
                                visitaId={visitaId}
                                onFormSave={fetchForms}
                            />
                        );
                    })}
                </Box>
            )}

            <FormEditorModal
                open={modalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveForm}
                initialData={editingForm}
                visitaId={visitaId}
            />
        </>
    );
}
