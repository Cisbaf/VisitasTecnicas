"use client";
import React, { useState } from "react";
import { Alert, Box, CircularProgress, Paper, Typography } from "@mui/material";
import DynamicForm from "../DynamicForm";
import FormEditorModal from "../modal/FormEditorModal";
import { useForms } from "@/components/admin/hooks/useForms";
import { TabHeader } from "./TabHeader";
import { FormAccordion } from "./FormAccordion";

interface ChecklistsTabProps {
    visitaId: number;
    onChecklistAdded: () => void;
}

export default function ChecklistsTab({ visitaId, onChecklistAdded }: ChecklistsTabProps) {
    const {
        forms,
        loading,
        error,
        setError,
        modalOpen,
        editingForm,
        fetchForms,
        handleSaveForm,
        handleDeleteForm,
        handleOpenModal,
        handleCloseModal,
    } = useForms("INSPECAO", onChecklistAdded);

    const [expanded, setExpanded] = useState<string | false>(false);

    const handleChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

    if (loading) {
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px"><CircularProgress /></Box>;
    }

    return (
        <>
            <TabHeader title="Formulários de Inspeção" onAddClick={() => handleOpenModal()} />

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            {forms.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography>Nenhum formulário encontrado. Crie o primeiro!</Typography>
                </Paper>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {forms.map((form) => {
                        const formKey = form.id?.toString() || form.categoria;
                        return (
                            <FormAccordion
                                key={formKey}
                                form={form}
                                expanded={expanded === formKey}
                                onChange={handleChange(formKey)}
                                onEdit={handleOpenModal}
                                onDelete={handleDeleteForm}
                            >
                                <DynamicForm
                                    form={form}
                                    visitaId={visitaId}
                                    onSave={fetchForms}
                                />
                            </FormAccordion>
                        );
                    })}
                </Box>
            )}

            <FormEditorModal
                open={modalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveForm}
                initialData={editingForm}
                tipoForm="INSPECAO"
            />
        </>
    );
}