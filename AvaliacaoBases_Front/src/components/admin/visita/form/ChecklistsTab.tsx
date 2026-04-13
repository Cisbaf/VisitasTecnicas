"use client";
import React, { useState } from "react";
import { Alert, Box, CircularProgress, Paper, Typography, useMediaQuery, useTheme } from "@mui/material";
import FormEditorModal from "../modal/FormEditorModal";
import { useForms } from "@/components/admin/hooks/useForms";
import { TabHeader } from "./TabHeader";
import { SummaryAccordion } from "./Accordion/SummaryAccordion";
import { PREDEFINED_SUMMARIES } from "@/components/types";

interface ChecklistsTabProps {
    visitaId: number;
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

    return (
        <>
            <TabHeader title="Formulários de Inspeção" onAddClick={() => handleOpenModal()} />

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