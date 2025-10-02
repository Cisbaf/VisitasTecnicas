"use client";
import React, { useState, useEffect } from "react";
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
    Select,
    MenuItem,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import { FormCategory, RespostaResponse } from "@/components/types";

interface DynamicFormProps {
    form: FormCategory;
    visitaId: number;
    onSave: () => void;
}

export default function DynamicForm({ form, visitaId, onSave }: DynamicFormProps) {
    const [formData, setFormData] = useState<{ [key: string]: string }>({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [activeFieldId, setActiveFieldId] = useState<string | null>(null);

    useEffect(() => {
        let aborted = false;
        const controller = new AbortController();

        const fetchAnswers = async () => {
            try {
                const initialData: { [key: string]: string } = {};

                const fetchPromises = (form.campos || []).map(async (field: any) => {
                    const fieldId = field.id ? field.id.toString() : field.titulo;
                    initialData[fieldId] = "";

                    if (!field.id) return;

                    try {
                        const resp = await fetch(
                            `/api/form/answers?campoId=${field.id}&visitaId=${visitaId}`,
                            { signal: controller.signal }
                        );

                        if (!resp.ok) {
                            return;
                        }

                        const answers: RespostaResponse[] = await resp.json();
                        if (!answers || answers.length === 0) return;

                        const answer = answers[0];

                        if (field.tipo === "TEXTO") {
                            initialData[fieldId] = answer.texto ?? "";
                        } else if (field.tipo === "CHECKBOX") {
                            initialData[fieldId] = answer.checkbox ?? "";
                        } else if (field.tipo === "SELECT") {
                            initialData[fieldId] = answer.select ?? "";
                        }
                    } catch (err) {
                        if ((err as any).name === "AbortError") return;
                        console.error(`Erro ao carregar resposta do campo ${field.id}:`, err);
                    }
                });

                await Promise.all(fetchPromises);

                if (!aborted) {
                    setFormData(initialData);
                }
            } catch (err) {
                if ((err as any).name === "AbortError") return;
                console.error("Fetch answers error:", err);
                const initialData: { [key: string]: string } = {};
                (form.campos || []).forEach((field: any) => {
                    initialData[field.id ? field.id.toString() : field.titulo] = "";
                });
                if (!aborted) setFormData(initialData);
                setError("Erro ao carregar respostas existentes.");
            }
        };

        if ((form.campos || []).length > 0) {
            fetchAnswers();
        } else {
            const initialData: { [key: string]: string } = {};
            setFormData(initialData);
        }

        return () => {
            aborted = true;
            controller.abort();
        };
    }, [form.campos, visitaId]);

    const handleFieldChange = (fieldId: string, value: string) => {
        setFormData((prev) => ({ ...prev, [fieldId]: value }));
    };

    const handleSaveAnswers = async () => {
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const respostas = (form.campos || [])
                .filter((field: any) => field.id)
                .map((field: any) => {
                    const fieldId = field.id!.toString();
                    const value = formData[fieldId] ?? "";

                    let texto = "";
                    let checkbox = "NOT_GIVEN";
                    let select = "NAO_AVALIADO";

                    if (field.tipo === "TEXTO") {
                        texto = value;
                    } else if (field.tipo === "CHECKBOX") {
                        checkbox = value === "TRUE" ? "TRUE" : value === "FALSE" ? "FALSE" : "NOT_GIVEN";
                    } else if (field.tipo === "SELECT") {
                        select = value || "NAO_AVALIADO";
                    }

                    return {
                        campoId: field.id,
                        texto,
                        checkbox,
                        select,
                        visitaId,
                    };
                });

            if (respostas.length === 0) {
                setSuccess("Nenhuma resposta para salvar.");
                setTimeout(() => {
                    setSuccess("");
                    onSave();
                }, 1000);
                return;
            }

            const savePromises = respostas.map((resposta) =>
                fetch(`/api/form/answers/saveAnswers/${resposta.campoId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify([resposta]),
                })
            );

            const results = await Promise.all(savePromises);

            const failed = results
                .map((r) => ({ ok: r.ok, status: r.status, url: r.url }))
                .filter((r) => !r.ok);

            if (failed.length > 0) {
                console.error("Algumas respostas não foram salvas:", failed);
                throw new Error("Falha ao salvar algumas respostas (ver console).");
            }

            setSuccess("Respostas salvas com sucesso!");
            setTimeout(() => {
                setSuccess("");
                onSave();
            }, 1200);
        } catch (err) {
            console.error("Erro ao salvar respostas:", err);
            setError("Erro ao salvar respostas: " + (err instanceof Error ? err.message : String(err)));
        } finally {
            setSaving(false);
        }
    };

    const renderField = (field: any, fieldId: string) => {
        const fieldValue = formData[fieldId] ?? "";

        switch (field.tipo) {
            case "TEXTO":
                return (
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Sua resposta"
                        value={fieldValue}
                        onChange={(e) => handleFieldChange(fieldId, e.target.value)}
                        multiline
                        rows={3}
                    />
                );

            case "CHECKBOX":
                return (
                    <FormControl component="fieldset">
                        <RadioGroup
                            row
                            value={fieldValue}
                            onChange={(e) => handleFieldChange(fieldId, e.target.value)}
                        >
                            <FormControlLabel value="TRUE" control={<Radio />} label="Sim" />
                            <FormControlLabel value="FALSE" control={<Radio />} label="Não" />
                        </RadioGroup>
                    </FormControl>
                );

            case "SELECT":
                return (
                    <FormControl fullWidth>
                        <Select value={fieldValue} onChange={(e) => handleFieldChange(fieldId, e.target.value)} displayEmpty>
                            <MenuItem value="">
                                <em>-- Selecione --</em>
                            </MenuItem>
                            <MenuItem value="CONFORME">Conforme</MenuItem>
                            <MenuItem value="PARCIAL">Parcial</MenuItem>
                            <MenuItem value="NAO_CONFORME">Não Conforme</MenuItem>
                        </Select>
                    </FormControl>
                );

            default:
                return null;
        }
    };

    return (
        <Box sx={{ p: 0, display: "flex", flexDirection: "column", gap: 3 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            {(form.campos || []).map((field: any) => {
                const fieldId = field.id ? field.id.toString() : field.titulo;
                const isActive = activeFieldId === fieldId;

                return (
                    <Paper
                        key={fieldId}
                        elevation={isActive ? 3 : 1}
                        onClick={() => setActiveFieldId(fieldId)}
                        sx={{
                            p: 2.5,
                            transition: "all 0.2s ease-in-out",
                            borderLeft: "6px solid",
                            borderColor: isActive ? "primary.main" : "transparent",
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2 }}>
                            {field.titulo}
                        </Typography>

                        {renderField(field, fieldId)}
                    </Paper>
                );
            })}

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                    variant="contained"
                    onClick={handleSaveAnswers}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                    {saving ? "Salvando..." : "Salvar Respostas"}
                </Button>
            </Box>
        </Box>
    );
}