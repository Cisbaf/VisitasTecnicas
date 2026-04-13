"use client";
import React, { useState, useEffect } from "react";
import {
    Box, TextField, Button, Typography, Alert, CircularProgress,
    Paper, Radio, RadioGroup, FormControlLabel, FormControl,
    Select, MenuItem, useMediaQuery, useTheme,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import { FormCategory, RespostaResponse } from "@/components/types";

interface DynamicFormProps {
    form: FormCategory;
    onSave: () => void;
}

export default function DynamicForm({ form, onSave }: DynamicFormProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [formData, setFormData] = useState<{ [key: string]: string }>({});
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [activeFieldId, setActiveFieldId] = useState<string | null>(null);

    useEffect(() => {
        let aborted = false;
        const controller = new AbortController();

        const fetchAnswers = async () => {
            setLoading(true);
            try {
                const initialData: { [key: string]: string } = {};
                (form.campos || []).forEach((field: any) => {
                    if (!field.id) return;
                    initialData[field.id.toString()] = "";
                });

                const campoIds = (form.campos || [])
                    .filter((field: any) => field.id)
                    .map((field: any) => field.id);

                if (campoIds.length > 0) {
                    const resp = await fetch(`/api/form/answers/fields`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(campoIds),
                        signal: controller.signal,
                    });
                    if (!resp.ok) throw new Error("Erro ao carregar respostas");
                    const answers: RespostaResponse[] = await resp.json();
                    answers.forEach((answer) => {
                        const fieldId = answer.campoId?.toString();
                        if (fieldId && initialData.hasOwnProperty(fieldId)) {
                            if (answer.texto !== undefined && answer.texto !== null && answer.texto !== "") {
                                initialData[fieldId] = answer.texto;
                            } else if (answer.checkbox !== undefined && answer.checkbox !== null) {
                                initialData[fieldId] = answer.checkbox;
                            }
                        }
                    });
                }

                if (!aborted) setFormData(initialData);
            } catch (err) {
                if ((err as any).name === "AbortError") return;
                const initialData: { [key: string]: string } = {};
                (form.campos || []).forEach((field: any) => {
                    if (field.id) initialData[field.id.toString()] = "";
                });
                if (!aborted) setFormData(initialData);
                setError("Erro ao carregar respostas existentes.");
            } finally {
                if (!aborted) setLoading(false);
            }
        };

        if ((form.campos || []).length > 0) fetchAnswers();
        else setLoading(false);

        return () => { aborted = true; controller.abort(); };
    }, [form.campos]);

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
                    const fieldId = field.id.toString();
                    const value = formData[fieldId] ?? "";
                    let texto = "";
                    let checkbox = "NOT_GIVEN";
                    if (field.tipo === "TEXTO") {
                        texto = value;
                    } else if (field.tipo === "CHECKBOX") {
                        checkbox = value === "TRUE" ? "TRUE" : value === "FALSE" ? "FALSE" : "NOT_GIVEN";
                    }
                    return { campoId: field.id, texto, checkbox };
                });

            if (respostas.length === 0) { setSuccess("Nenhuma resposta para salvar."); return; }

            const saveResponse = await fetch(`/api/form/answers/saveAnswers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(respostas),
            });
            if (!saveResponse.ok) throw new Error("Erro ao salvar respostas");

            setSuccess("Respostas salvas com sucesso!");
            onSave?.();
        } catch (err) {
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
                        disabled={loading}
                    />
                );
            case "CHECKBOX":
                return (
                    <FormControl component="fieldset">
                        {/* No mobile, empilha os radio buttons verticalmente */}
                        <RadioGroup
                            row={!isMobile}
                            value={fieldValue}
                            onChange={(e) => handleFieldChange(fieldId, e.target.value)}
                        >
                            <FormControlLabel value="TRUE" control={<Radio />} label="Sim" disabled={loading} />
                            <FormControlLabel value="FALSE" control={<Radio />} label="Não" disabled={loading} />
                        </RadioGroup>
                    </FormControl>
                );
            case "SELECT":
                return (
                    <FormControl fullWidth>
                        <Select
                            value={fieldValue}
                            onChange={(e) => handleFieldChange(fieldId, e.target.value)}
                            displayEmpty
                            disabled={loading}
                        >
                            <MenuItem value=""><em>-- Selecione --</em></MenuItem>
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

    if (loading) {
        return <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ p: 0, display: "flex", flexDirection: "column", gap: isMobile ? 2 : 3 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            {(form.campos || []).map((field: any) => {
                if (!field.id) return null;
                const fieldId = field.id.toString();
                const isActive = activeFieldId === fieldId;

                return (
                    <Paper
                        key={fieldId}
                        elevation={isActive ? 3 : 1}
                        onClick={() => setActiveFieldId(fieldId)}
                        sx={{
                            p: isMobile ? 1.5 : 2.5, // 👈 padding menor no mobile
                            transition: "all 0.2s ease-in-out",
                            borderLeft: "6px solid",
                            borderColor: isActive ? "primary.main" : "transparent",
                            cursor: "pointer",
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2, fontSize: isMobile ? '0.9rem' : '1rem' }}>
                            {field.titulo}
                        </Typography>
                        {renderField(field, fieldId)}
                    </Paper>
                );
            })}

            {/* Botão salvar — largura total no mobile */}
            <Box sx={{ display: "flex", justifyContent: isMobile ? "stretch" : "flex-end", mt: 2 }}>
                <Button
                    variant="contained"
                    onClick={handleSaveAnswers}
                    disabled={saving || loading}
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    fullWidth={isMobile}
                >
                    {saving ? "Salvando..." : "Salvar Respostas"}
                </Button>
            </Box>
        </Box>
    );
}