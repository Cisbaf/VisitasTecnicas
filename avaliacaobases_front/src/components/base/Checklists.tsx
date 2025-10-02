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
    Chip,
    Tabs,
    Tab,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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

export default function ChecklistPage() {
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
        fetchForms();
    }, []);

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

            for (const visita of visitasData) {
                try {
                    const response = await fetch(`/api/form/visita/${visita.id}`);
                    if (!response.ok) continue;

                    const formsData: FormCategory[] = await response.json();
                    console.log('Formulários para visita', visita.id, formsData);

                    for (const form of formsData) {
                        const formKey = `${form.tipoForm}-${form.id?.toString() || form.categoria}`;

                        if (allForms.some(f => `${f.tipoForm}-${f.id?.toString() || f.categoria}` === formKey)) continue;

                        const formDataForVisita = await fetchAnswersForForm(form, visita.id);

                        const hasData = Object.values(formDataForVisita).some(value => value !== '');

                        if (hasData) {
                            allForms.push({
                                ...form,
                                visitaId: visita.id,
                                dataVisita: visita.dataVisita
                            });
                            allFormData[formKey] = formDataForVisita;
                        }
                    }
                } catch (err) {
                    console.error(`Erro ao processar visita ${visita.id}:`, err);
                }
            }

            setForms(allForms);
            setFormData(allFormData);

        } catch (err: any) {
            setError(err?.message ?? "Erro ao carregar formulários");
        } finally {
            setLoading(false);
        }
    };

    const fetchAnswersForForm = async (form: FormCategory, visitaId: number) => {
        const formData: { [key: string]: string } = {};
        const formKey = `${form.tipoForm}-${form.id?.toString() || form.categoria}`;

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
                                formData[fieldId] = answer.texto || '';
                            } else if (field.tipo === 'CHECKBOX') {
                                if (answer.checkbox === 'TRUE') {
                                    formData[fieldId] = 'sim';
                                } else if (answer.checkbox === 'FALSE') {
                                    formData[fieldId] = 'nao';
                                } else {
                                    formData[fieldId] = '';
                                }
                            } else {
                                if (answer.select === 'CONFORME') {
                                    formData[fieldId] = 'conforme';
                                } else if (answer.select === 'PARCIAL') {
                                    formData[fieldId] = 'parcial';
                                } else if (answer.select === 'NAO_CONFORME') {
                                    formData[fieldId] = 'não conforme';
                                }
                            }
                        } else {
                            formData[fieldId] = '';
                        }
                    } else {
                        formData[fieldId] = '';
                    }
                } catch (err) {
                    console.error(`Erro ao buscar resposta para campo ${field.id}:`, err);
                    formData[fieldId] = '';
                }
            } else {
                formData[fieldId] = '';
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
        tabValue === 0 ? form.tipoForm === "INSPECAO" : form.tipoForm === "PADRONIZACAO"
    );

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
                        {filteredForms.map((form) => {
                            const formKey = `${form.tipoForm}-${form.id?.toString() || form.categoria}`;
                            const currentFormData = formData[formKey] || {};

                            return (
                                <Accordion
                                    key={formKey}
                                    expanded={expanded === formKey}
                                    onChange={handleChangeAccordion(formKey)}
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
                                            <Box>
                                                <Typography variant="h6">{form.categoria}</Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    Data da visita: {new Date(form.dataVisita).toLocaleDateString('pt-BR')}
                                                </Typography>
                                            </Box>
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
                        {filteredForms.map((form) => {
                            const formKey = `${form.tipoForm}-${form.id?.toString() || form.categoria}`;
                            const currentFormData = formData[formKey] || {};

                            return (
                                <Accordion
                                    key={formKey}
                                    expanded={expanded === formKey}
                                    onChange={handleChangeAccordion(formKey)}
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
                                            <Box>
                                                <Typography variant="h6">{form.categoria}</Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    Data da visita: {new Date(form.dataVisita).toLocaleDateString('pt-BR')}
                                                </Typography>
                                            </Box>
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
                                                        ) : field.tipo === 'CHECKBOX' ? (
                                                            <FormControl component="fieldset">
                                                                <RadioGroup row value={fieldValue}>
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
                                                        ) : (
                                                            // Renderização para campos SELECT (padronização)
                                                            <FormControl fullWidth>
                                                                <InputLabel>Seleção</InputLabel>
                                                                <Select
                                                                    value={fieldValue}
                                                                    label="Seleção"
                                                                    disabled
                                                                    displayEmpty
                                                                    renderValue={(value) => {
                                                                        if (!value) return "Nenhuma resposta selecionada";
                                                                        if (value === "conforme") return "Conforme";
                                                                        if (value === "parcial") return "Parcial";
                                                                        if (value === "não conforme") return "Não Conforme";
                                                                        return value;
                                                                    }}
                                                                >
                                                                    <MenuItem value="conforme">Conforme</MenuItem>
                                                                    <MenuItem value="parcial">Parcial</MenuItem>
                                                                    <MenuItem value="não conforme">Não Conforme</MenuItem>
                                                                </Select>
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
            </TabPanel>
        </Box>
    );
}