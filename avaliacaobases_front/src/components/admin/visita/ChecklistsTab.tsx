"use client";
import React, { useState, useEffect } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Typography,
    Paper,
    Accordion, // Importado
    AccordionSummary, // Importado
    AccordionDetails, // Importado
} from "@mui/material";
import { Add as AddIcon, Delete, Edit as EditIcon } from "@mui/icons-material"; // Importado EditIcon
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Importado
import DynamicForm from "./DynamicForm";
import FormEditorModal from "./modal/FormEditorModal";

interface FormCategory {
    id?: number;
    categoria: string;
    campos: any[];
}

interface ChecklistsTabProps {
    baseId: number;
    visitaId: number;
    onChecklistAdded: () => void;
}

export default function ChecklistsTab({ baseId, visitaId, onChecklistAdded }: ChecklistsTabProps) {
    const [forms, setForms] = useState<FormCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingForm, setEditingForm] = useState<FormCategory | undefined>();
    // Estado para controlar qual acordeão está expandido
    const [expanded, setExpanded] = useState<string | false>(false);

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/form');
            if (!response.ok) throw new Error('Falha ao carregar formulários');
            const data = await response.json();
            setForms(data);
        } catch (err) {
            setError('Erro ao carregar formulários: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setLoading(false);
        }
    };

    const handleSaveForm = async (formData: { id: number; categoria: string; campos: any[] }) => {
        console.log(formData);
        var uri = editingForm ? `/api/form/${formData.id}` : '/api/form/saveForm';
        var method = editingForm ? 'PUT' : 'POST';
        try {
            const response = await fetch(uri, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error('Falha ao salvar formulário');
            fetchForms();
            setModalOpen(false);
            setEditingForm(undefined);
            onChecklistAdded();
        } catch (err) {
            setError('Erro ao salvar formulário: ' + (err instanceof Error ? err.message : String(err)));
        }
    };

    const handleDeleteForm = async (id: number) => {
        try {
            const response = await fetch(`/api/form/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falha ao excluir formulário');
            fetchForms();
        } catch (err) {
            setError('Erro ao excluir formulário: ' + (err instanceof Error ? err.message : String(err)));
        }
    };

    const handleEditForm = (form: FormCategory) => {
        setEditingForm(form);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingForm(undefined);
    };

    const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                <Typography variant="h4" fontWeight="600">
                    Formulários de Inspeção
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setModalOpen(true)}
                    sx={{ bgcolor: '#5a3d30', '&:hover': { bgcolor: '#3d2514' } }}
                >
                    Novo Formulário
                </Button>
            </Box >

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )
            }

            {
                forms.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                            Nenhum formulário encontrado
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                            Crie seu primeiro formulário para começar a coletar dados
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setModalOpen(true)}
                        >
                            Criar Primeiro Formulário
                        </Button>
                    </Paper>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {forms.map((form) => (
                            <Accordion
                                key={form.id || form.categoria}
                                expanded={expanded === (form.id?.toString() || form.categoria)}
                                onChange={handleChange(form.id?.toString() || form.categoria)}
                                elevation={2}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls={`panel-${form.id || form.categoria}-content`}
                                    id={`panel-${form.id || form.categoria}-header`}
                                    sx={{
                                        '&.Mui-expanded': {
                                            backgroundColor: '#f7f7f7',
                                        },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                        <Typography variant="h6">{form.categoria}</Typography>
                                        <div>
                                            <Button
                                                variant="text"
                                                color="warning"
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Impede que o clique no botão expanda o acordeão
                                                    handleEditForm(form);
                                                }}
                                            >
                                            </Button>
                                            <Button
                                                variant="text"
                                                color="error"
                                                size="small"
                                                startIcon={<Delete />}
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Impede que o clique no botão expanda o acordeão
                                                    handleDeleteForm(form.id!);
                                                }}
                                            >
                                            </Button>
                                        </div>
                                    </Box>

                                </AccordionSummary>
                                <AccordionDetails>
                                    <DynamicForm
                                        form={form}
                                        visitaId={visitaId}
                                        onSave={fetchForms}
                                    />
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>
                )
            }

            <FormEditorModal
                open={modalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveForm}
                initialData={editingForm}
            />
        </>
    );
}