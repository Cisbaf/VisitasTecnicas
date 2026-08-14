// src/components/ChecklistPage.tsx
"use client";
import React, { useEffect, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Chip,
    CircularProgress,
    Divider,
    FormControl,
    FormControlLabel,
    Paper,
    Radio,
    RadioGroup,
    Stack,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NotesIcon from "@mui/icons-material/Notes";
import { useParams } from "next/navigation";
import { RespostaResponse, VisitaResponse } from "../types";

interface FormCategory {
    id?: number;
    categoria: string;
    tipoForm: string;
    campos: {
        id?: number;
        titulo: string;
        tipo: string;
    }[];
}

interface FormCategoryWithVisita extends FormCategory {
    visitaId: number;
    dataVisita: string;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`form-tabpanel-${index}`}
            aria-labelledby={`form-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

const formatDate = (date: string) => new Date(date).toLocaleDateString("pt-BR");

const formatAnswer = (value: string) => {
    if (!value) return "Nenhuma resposta registrada";
    if (value === "sim") return "Sim";
    if (value === "nao") return "Não";
    if (value === "conforme") return "Conforme";
    if (value === "parcial") return "Parcial";
    if (value === "não conforme") return "Não conforme";
    return value;
};

export default function InspecaoPage() {
    const params = useParams();
    const rawBaseId = params?.baseId as string | undefined;
    const parsed = rawBaseId ? Number(rawBaseId) : NaN;
    const baseId = Number.isNaN(parsed) ? undefined : parsed;

    const [forms, setForms] = useState<FormCategoryWithVisita[]>([]);
    const [formData, setFormData] = useState<{ [key: string]: { [key: string]: string } }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<string | false>(false);
    const [visitas, setVisitas] = useState<VisitaResponse[]>([]);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        if (baseId) {
            fetchForms();
        }
    }, [baseId]);

    const fetchForms = async () => {
        try {
            setLoading(true);
            setError(null);

            const visitasRes = await fetch(`/api/visita/base/${baseId}`);
            if (!visitasRes.ok) {
                if (visitasRes.status === 404) {
                    setVisitas([]);
                    setForms([]);
                    return;
                }
                throw new Error("Falha ao carregar visitas");
            }

            const visitasData: VisitaResponse[] = await visitasRes.json();
            setVisitas(visitasData);

            if (visitasData.length === 0) {
                setForms([]);
                return;
            }

            visitasData.sort((a, b) => new Date(b.dataVisita).getTime() - new Date(a.dataVisita).getTime());

            const allForms: FormCategoryWithVisita[] = [];
            const allFormData: { [key: string]: { [key: string]: string } } = {};

            // 1. Busca os formulários de TODAS as visitas em paralelo
            const formsPromises = visitasData.map(async (visita) => {
                try {
                    const res = await fetch(`/api/form/visita/${visita.id}`);
                    if (!res.ok) return { visita, forms: [] };
                    const forms: FormCategory[] = await res.json();
                    return { visita, forms };
                } catch (err) {
                    console.error(`Erro ao buscar form da visita ${visita.id}:`, err);
                    return { visita, forms: [] };
                }
            });

            const visitasWithForms = await Promise.all(formsPromises);

            // 2. Busca as respostas de TODOS os formulários em paralelo
            const answersPromises = visitasWithForms.flatMap(({ visita, forms }) =>
                forms.map(async (form) => {
                    const formKey = `${form.tipoForm}-${form.id}-${visita.id}`;
                    try {
                        const ansRes = await fetch(`/api/form/answers/form/${form.id}`);
                        let answers: RespostaResponse[] = [];
                        if (ansRes.ok) {
                            answers = await ansRes.json();
                        }
                        return { form, visita, formKey, answers };
                    } catch (err) {
                        console.error(`Erro ao buscar respostas do form ${form.id}:`, err);
                        return { form, visita, formKey, answers: [] };
                    }
                })
            );

            const allFormsWithAnswers = await Promise.all(answersPromises);

            // 3. Monta a estrutura final de dados sincronamente
            allFormsWithAnswers.forEach(({ form, visita, formKey, answers }) => {
                const answersByField: Record<string, RespostaResponse> = {};
                for (const ans of answers) {
                    if (ans.campoId) {
                        answersByField[ans.campoId.toString()] = ans;
                    }
                }

                const formDataForVisita = buildFormData(form, answersByField);

                allForms.push({
                    ...form,
                    visitaId: visita.id,
                    dataVisita: visita.dataVisita
                });
                allFormData[formKey] = formDataForVisita;
            });

            setForms(allForms);
            setFormData(allFormData);

        } catch (err: any) {
            console.error('Erro geral:', err);
            setError(err?.message ?? "Erro ao carregar formulários");
        } finally {
            setLoading(false);
        }
    };
    const buildFormData = (form: FormCategory, answersByField: Record<string, RespostaResponse>) => {
        const formData: { [key: string]: string } = {};

        for (const field of form.campos) {
            const fieldId = field.id ? field.id.toString() : field.titulo;
            const answer = field.id ? answersByField[field.id.toString()] : undefined;

            if (answer) {
                if (field.tipo === "TEXTO") {
                    formData[fieldId] = answer.texto || "";
                } else if (field.tipo === "CHECKBOX") {
                    formData[fieldId] = answer.checkbox === "TRUE" ? "sim"
                        : answer.checkbox === "FALSE" ? "nao"
                            : "";
                }
            } else {
                formData[fieldId] = "";
            }
        }

        return formData;
    };

    const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleChangeAccordion = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    const filteredForms = forms.filter(form =>
        (tabValue === 0 && form.tipoForm === "INSPECAO") ||
        (tabValue === 1 && form.tipoForm === "PADRONIZACAO")
    );

    const renderAnswer = (field: FormCategory["campos"][number], fieldValue: string) => {
        if (field.tipo === "CHECKBOX") {
            return (
                <FormControl component="fieldset">
                    <RadioGroup row value={fieldValue}>
                        <FormControlLabel value="sim" control={<Radio disabled />} label="Sim" />
                        <FormControlLabel value="nao" control={<Radio disabled />} label="Não" />
                    </RadioGroup>
                    {!fieldValue && (
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            Nenhuma resposta selecionada
                        </Typography>
                    )}
                </FormControl>
            );
        }

        const isEmpty = !fieldValue;
        return (
            <Box
                sx={{
                    bgcolor: isEmpty ? "grey.50" : "action.selected",
                    border: "1px solid",
                    borderColor: isEmpty ? "divider" : "primary.main",
                    borderRadius: 1,
                    px: 1.5,
                    py: 1.25,
                    color: isEmpty ? "text.secondary" : "text.primary",
                    whiteSpace: "pre-wrap",
                }}
            >
                <Typography variant="body2">{formatAnswer(fieldValue)}</Typography>
            </Box>
        );
    };

    const renderFormAccordion = (form: FormCategoryWithVisita) => {
        const formKey = `${form.tipoForm}-${form.id}-${form.visitaId}`;
        const currentFormData = formData[formKey] || {};
        const answeredCount = form.campos.filter((field) => {
            const fieldId = field.id ? field.id.toString() : field.titulo;
            return Boolean(currentFormData[fieldId]);
        }).length;

        return (
            <Accordion
                key={formKey}
                expanded={expanded === formKey}
                onChange={handleChangeAccordion(formKey)}
                disableGutters
                elevation={0}
                sx={{
                    border: "1px solid",
                    borderColor: expanded === formKey ? "primary.main" : "divider",
                    borderRadius: 1,
                    overflow: "hidden",
                    "&:before": { display: "none" },
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel-${formKey}-content`}
                    id={`panel-${formKey}-header`}
                    sx={{
                        px: 2,
                        py: 1,
                        bgcolor: expanded === formKey ? "action.selected" : "background.paper",
                        "&:hover": { bgcolor: "action.hover" },
                        "& .MuiAccordionSummary-content": { my: 1 },
                    }}
                >
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1.5}
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        justifyContent="space-between"
                        sx={{ width: "100%", pr: 2 }}
                    >
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                {form.categoria}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Visita em {formatDate(form.dataVisita)}
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Chip size="small" label={`${answeredCount}/${form.campos.length} respondidos`} color={answeredCount === form.campos.length ? "success" : "default"} />
                            <Chip size="small" label={form.tipoForm === "INSPECAO" ? "Inspeção" : "Padronização"} variant="outlined" />
                        </Stack>
                    </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                    <Stack divider={<Divider />} sx={{ bgcolor: "background.paper" }}>
                        {form.campos.map((field, index) => {
                            const fieldId = field.id ? field.id.toString() : field.titulo;
                            const fieldValue = currentFormData[fieldId] || "";
                            const Icon = field.tipo === "CHECKBOX"
                                ? fieldValue === "sim"
                                    ? CheckCircleOutlineIcon
                                    : HighlightOffIcon
                                : NotesIcon;

                            return (
                                <Box key={fieldId} sx={{ p: 2 }}>
                                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                        <Box
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                flex: "0 0 32px",
                                                borderRadius: 1,
                                                bgcolor: fieldValue ? "action.selected" : "grey.100",
                                                color: fieldValue ? "primary.main" : "text.secondary",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Icon fontSize="small" />
                                        </Box>
                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                                {index + 1}. {field.titulo}
                                            </Typography>
                                            {renderAnswer(field, fieldValue)}
                                        </Box>
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Stack>
                </AccordionDetails>
            </Accordion>
        );
    };

    return (
        <Box sx={{ padding: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="600">
                    Formulários - Visualização
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleChangeTab}>
                    <Tab label="Inspeção" />
                    <Tab label="Padronização" />
                </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
                {filteredForms.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                            Nenhum formulário de inspeção encontrado
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Não há formulários de inspeção disponíveis para nenhuma visita.
                        </Typography>
                    </Paper>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {filteredForms.map(renderFormAccordion)}
                    </Box>
                )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                {filteredForms.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                            Nenhum formulário de padronização encontrado
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Não há formulários de padronização disponíveis para nenhuma visita.
                        </Typography>
                    </Paper>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {filteredForms.map(renderFormAccordion)}
                    </Box>
                )}
            </TabPanel>
        </Box>
    );
}
