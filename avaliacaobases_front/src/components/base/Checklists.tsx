// src/components/ChecklistPage.tsx
"use client";
import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
    TextField,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useParams } from "next/navigation";
import { RespostaResponse, VisitaResponse } from "../types";

interface FormCategory {
    id?: number;
    categoria: string;
    campos: {
        id?: number;
        titulo: string;
        tipo: string;
    }[];
}

export default function ChecklistPage() {
    const params = useParams();
    const rawBaseId = params?.baseId as string | undefined;
    const parsed = rawBaseId ? Number(rawBaseId) : NaN;
    const baseId = Number.isNaN(parsed) ? undefined : parsed;


    const [forms, setForms] = useState<FormCategory[]>([]);
    const [formData, setFormData] = useState<{ [key: string]: { [key: string]: string } }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<string | false>(false);
    const [visitas, setVisitas] = useState<VisitaResponse[]>([]);

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Buscar visitas primeiro
            const visitasRes = await fetch(`/api/visita/base/${baseId}`);
            if (!visitasRes.ok) {
                if (visitasRes.status === 404) {
                    setVisitas([]);
                    setForms([]);
                    return;
                }
                throw new Error("Falha ao carregar visitas");
            }

            const visitasData = await visitasRes.json();
            setVisitas(visitasData);

            if (visitasData.length === 0) {
                setForms([]);
                return;
            }

            // 2. Buscar formulários da última visita
            const ultimaVisita = visitasData[visitasData.length - 1];
            const response = await fetch(`/api/form/visita/${ultimaVisita.id}`);
            if (!response.ok) throw new Error('Falha ao carregar formulários');

            const formsData = await response.json();
            setForms(formsData);

            // 3. Buscar respostas para os formulários
            await fetchAnswersForAllForms(formsData, ultimaVisita.id);

        } catch (err: any) {
            setError(err?.message ?? "Erro ao carregar formulários");
        } finally {
            setLoading(false);
        }
    };

    const fetchAnswersForAllForms = async (formsData: FormCategory[], visitaId: number) => {
        const allFormData: { [key: string]: { [key: string]: string } } = {};

        for (const form of formsData) {
            const formKey = form.id?.toString() || form.categoria;
            allFormData[formKey] = {};

            for (const field of form.campos) {
                const fieldId = field.id ? field.id.toString() : field.titulo;

                if (field.id) {
                    try {
                        const response = await fetch(
                            `/api/form/answers?campoId=${field.id}&visitaId=${visitaId}`
                        );

                        if (response.ok) {
                            const answers: RespostaResponse[] = await response.json();
                            if (answers.length > 0) {
                                const answer = answers[0];
                                if (field.tipo === 'TEXTO') {
                                    allFormData[formKey][fieldId] = answer.texto || '';
                                } else if (field.tipo === 'CHECKBOX') {
                                    if (answer.checkbox === 'TRUE') {
                                        allFormData[formKey][fieldId] = 'sim';
                                    } else if (answer.checkbox === 'FALSE') {
                                        allFormData[formKey][fieldId] = 'nao';
                                    } else {
                                        allFormData[formKey][fieldId] = '';
                                    }
                                }
                            } else {
                                allFormData[formKey][fieldId] = '';
                            }
                        } else {
                            allFormData[formKey][fieldId] = '';
                        }
                    } catch (err) {
                        console.error(`Erro ao buscar resposta para campo ${field.id}:`, err);
                        allFormData[formKey][fieldId] = '';
                    }
                } else {
                    allFormData[formKey][fieldId] = '';
                }
            }
        }

        setFormData(allFormData);
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

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box sx={{ padding: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="600">
                    Formulários de Inspeção - Visualização
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {forms.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                        Nenhum formulário encontrado
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Não há formulários disponíveis no momento.
                    </Typography>
                </Paper>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {forms.map((form) => {
                        const formKey = form.id?.toString() || form.categoria;
                        const currentFormData = formData[formKey] || {};

                        return (
                            <Accordion
                                key={formKey}
                                expanded={expanded === formKey}
                                onChange={handleChange(formKey)}
                                elevation={2}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls={`panel-${formKey}-content`}
                                    id={`panel-${formKey}-header`}
                                    sx={{
                                        '&.Mui-expanded': {
                                            backgroundColor: '#f7f7f7',
                                        },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                        <Typography variant="h6">{form.categoria}</Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mr: 2 }}>
                                            {form.campos.length} campo{form.campos.length !== 1 ? 's' : ''}
                                        </Typography>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>


                                        {form.campos.map((field) => {
                                            const fieldId = field.id ? field.id.toString() : field.titulo;
                                            const fieldValue = currentFormData[fieldId] || '';

                                            return (
                                                <Paper
                                                    key={fieldId}
                                                    elevation={1}
                                                    sx={{
                                                        p: 2.5,
                                                        borderLeft: '6px solid',
                                                        borderColor: 'primary.main',
                                                    }}
                                                >
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2 }}>
                                                        {field.titulo}
                                                    </Typography>

                                                    {field.tipo === 'TEXTO' ? (
                                                        <TextField
                                                            fullWidth
                                                            variant="outlined"
                                                            placeholder="Nenhuma resposta registrada"
                                                            value={fieldValue}
                                                            InputProps={{
                                                                readOnly: true,
                                                            }}
                                                            multiline
                                                            rows={1}
                                                            sx={{
                                                                '& .MuiInputBase-input': {
                                                                    color: fieldValue ? 'text.primary' : 'text.secondary'
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <FormControl component="fieldset">
                                                            <RadioGroup
                                                                row
                                                                value={fieldValue}
                                                            >
                                                                <FormControlLabel
                                                                    value="sim"
                                                                    control={<Radio disabled />}
                                                                    label="Sim"
                                                                />
                                                                <FormControlLabel
                                                                    value="nao"
                                                                    control={<Radio disabled />}
                                                                    label="Não"
                                                                />
                                                            </RadioGroup>
                                                            {!fieldValue && (
                                                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                                                                    Nenhuma resposta selecionada
                                                                </Typography>
                                                            )}
                                                        </FormControl>
                                                    )}
                                                </Paper>
                                            );
                                        })}
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}
                </Box>
            )}
        </Box>
    );
}