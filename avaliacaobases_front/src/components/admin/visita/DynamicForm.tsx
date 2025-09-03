// components/admin/visita/DynamicForm.tsx
"use client";
import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Paper,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { FormCategory, RespostaResponse } from '@/components/types';

interface DynamicFormProps {
    form: FormCategory;
    visitaId: number;
    onSave: () => void;
}

export default function DynamicForm({ form, visitaId, onSave }: DynamicFormProps) {
    const [formData, setFormData] = useState<{ [key: string]: string }>({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeFieldId, setActiveFieldId] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnswers = async () => {
            try {
                const initialData: { [key: string]: string } = {};

                const fetchPromises = form.campos.map(async (field) => {
                    const fieldId = field.id ? field.id.toString() : field.titulo;

                    if (field.id) {
                        const response = await fetch(`/api/form/answers?campoId=${field.id}&visitaId=${visitaId}`);

                        if (response.ok) {
                            const answers: RespostaResponse[] = await response.json();
                            if (answers.length > 0) {
                                const answer = answers[0];
                                if (field.tipo === 'TEXTO') {
                                    initialData[fieldId] = answer.texto || '';
                                } else if (field.tipo === 'CHECKBOX') {
                                    if (answer.checkbox === 'TRUE') {
                                        initialData[fieldId] = 'sim';
                                    } else if (answer.checkbox === 'FALSE') {
                                        initialData[fieldId] = 'nao';
                                    } else {
                                        initialData[fieldId] = '';
                                    }
                                }
                            } else {
                                initialData[fieldId] = '';
                            }
                        } else {
                            initialData[fieldId] = '';
                        }
                    } else {
                        initialData[fieldId] = '';
                    }
                });

                await Promise.all(fetchPromises);
                setFormData(initialData);
            } catch (err) {
                setError('Erro ao carregar respostas existentes.');
                console.error('Fetch answers error:', err);
                const initialData: { [key: string]: string } = {};
                form.campos.forEach(field => {
                    initialData[field.id ? field.id.toString() : field.titulo] = '';
                });
                setFormData(initialData);
            }
        };

        if (form.campos.length > 0) {
            fetchAnswers();
        }
    }, [form.campos, visitaId]);

    const handleFieldChange = (fieldId: string, value: string) => {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleSaveAnswers = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            // Preparar todas as respostas
            const respostasPromises = form.campos
                .filter(field => field.id) // Apenas campos com ID
                .map(async (field) => {
                    const fieldId = field.id!.toString();
                    const value = formData[fieldId] || '';

                    // Converter valores do frontend para o formato do backend
                    let texto = '';
                    let checkbox = 'NOT_GIVEN';

                    if (field.tipo === 'TEXTO') {
                        texto = value;
                    } else if (field.tipo === 'CHECKBOX') {
                        // Converter do frontend para o backend
                        checkbox = value === 'sim' ? 'TRUE' : value === 'nao' ? 'FALSE' : 'NOT_GIVEN';
                    }

                    return {
                        campoId: field.id,
                        texto: texto,
                        checkbox: checkbox,
                        visitaId: visitaId
                    };
                });

            const respostas = await Promise.all(respostasPromises);

            // Enviar cada resposta individualmente
            const savePromises = respostas.map(resposta =>
                fetch(`/api/form/answers/saveAnswers/${resposta.campoId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify([resposta]), // Enviar como array
                })
            );

            const results = await Promise.all(savePromises);
            const allSuccessful = results.every(result => result.ok);

            if (!allSuccessful) {
                throw new Error('Falha ao salvar algumas respostas');
            }

            setSuccess('Respostas salvas com sucesso!');
            setTimeout(() => {
                setSuccess('');
                onSave();
            }, 2000);
        } catch (err) {
            setError('Erro ao salvar respostas: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>

            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            {form.campos.map((field) => {
                const fieldId = field.id ? field.id.toString() : field.titulo;
                const isActive = activeFieldId === fieldId;

                return (
                    <Paper
                        key={fieldId}
                        elevation={isActive ? 3 : 1}
                        onClick={() => setActiveFieldId(fieldId)}
                        sx={{
                            p: 2.5,
                            transition: 'all 0.2s ease-in-out',
                            borderLeft: '6px solid',
                            borderColor: isActive ? 'primary.main' : 'transparent',
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2 }}>
                            {field.titulo}
                        </Typography>

                        {field.tipo === 'TEXTO' ? (
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Sua resposta"
                                value={formData[fieldId] || ''}
                                onChange={(e) => handleFieldChange(fieldId, e.target.value)}
                                multiline
                                rows={3}
                            />
                        ) : (
                            <FormControl component="fieldset">
                                <RadioGroup
                                    row
                                    value={formData[fieldId] || ''}
                                    onChange={(e) => handleFieldChange(fieldId, e.target.value)}
                                >
                                    <FormControlLabel value="sim" control={<Radio />} label="Sim" />
                                    <FormControlLabel value="nao" control={<Radio />} label="Não" />
                                </RadioGroup>
                            </FormControl>
                        )}
                    </Paper>
                );
            })}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                    variant="contained"
                    onClick={handleSaveAnswers}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                    {saving ? 'Salvando...' : 'Salvar Respostas'}
                </Button>
            </Box>
        </Box>
    );
}