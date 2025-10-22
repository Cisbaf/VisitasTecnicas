// src/components/ChecklistPage.tsx
"use client";
import React, { useEffect, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    CircularProgress,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Paper,
    Radio,
    RadioGroup,
    Select,
    Tab,
    Tabs,
    TextField,
    Typography,
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

            console.log('Buscando visitas para baseId:', baseId);
            const visitasRes = await fetch(`/api/visita/base/${baseId}`);
            if (!visitasRes.ok) {
                if (visitasRes.status === 404) {
                    console.log('Nenhuma visita encontrada');
                    setVisitas([]);
                    setForms([]);
                    return;
                }
                throw new Error("Falha ao carregar visitas");
            }

            const visitasData: VisitaResponse[] = await visitasRes.json();
            console.log('Visitas encontradas:', visitasData);
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
                    console.log(`Processando visita ${visita.id}`);
                    const response = await fetch(`/api/form/visita/${visita.id}`);
                    if (!response.ok) {
                        console.log(`Nenhum formulário encontrado para visita ${visita.id}`);
                        continue;
                    }

                    const formsData: FormCategory[] = await response.json();
                    console.log(`Formulários para visita ${visita.id}:`, formsData);

                    // Buscar respostas para esta visita
                    const answersRes = await fetch(`/api/form/answers/visit/${visita.id}`);
                    let answers: RespostaResponse[] = [];
                    if (answersRes.ok) {
                        answers = await answersRes.json();
                        console.log(`Respostas para visita ${visita.id}:`, answers);
                    } else {
                        console.log(`Nenhuma resposta encontrada para visita ${visita.id}`);
                    }

                    // Criar map de respostas por campoId
                    const answersByField: Record<string, RespostaResponse> = {};
                    for (const ans of answers) {
                        if (ans.campoId) {
                            answersByField[ans.campoId.toString()] = ans;
                        }
                    }

                    for (const form of formsData) {
                        const formKey = `${form.tipoForm}-${form.id}-${visita.id}`;

                        // 🔹 CORREÇÃO: Não pular forms duplicados - cada visita pode ter seu próprio preenchimento
                        // if (allForms.some(f => `${f.tipoForm}-${f.id?.toString() || f.categoria}` === formKey)) continue;

                        const formDataForVisita = buildFormData(form, answersByField);
                        console.log(`Form data para ${form.categoria}:`, formDataForVisita);

                        // 🔹 CORREÇÃO: Mostrar o form mesmo sem dados, para visualização
                        const hasData = Object.values(formDataForVisita).some(value => value !== '');
                        console.log(`Form ${form.categoria} tem dados?`, hasData);

                        // 🔹 CORREÇÃO: Adicionar mesmo forms sem dados para visualização
                        allForms.push({
                            ...form,
                            visitaId: visita.id,
                            dataVisita: visita.dataVisita
                        });
                        allFormData[formKey] = formDataForVisita;
                    }
                } catch (err) {
                    console.error(`Erro ao processar visita ${visita.id}:`, err);
                }
            }

            console.log('Todos os forms processados:', allForms);
            console.log('Todos os formData:', allFormData);

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

            console.log(`Campo ${field.titulo} (ID: ${field.id}, Tipo: ${field.tipo})`, answer);

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

    // 🔹 CORREÇÃO: Filtrar forms baseado na tab selecionada
    const filteredForms = forms.filter(form =>
        (tabValue === 0 && form.tipoForm === "INSPECAO") ||
        (tabValue === 1 && form.tipoForm === "PADRONIZACAO")
    );

    console.log('Forms filtrados para tab', tabValue, ':', filteredForms);

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
                            const formKey = `${form.tipoForm}-${form.id}-${form.visitaId}`;
                            const currentFormData = formData[formKey] || {};

                            console.log(`Renderizando form ${form.categoria}`, currentFormData);

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
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            width: '100%'
                                        }}>
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

                                                console.log(`Campo ${field.titulo}:`, fieldValue);

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
                                                                    <Typography variant="body2"
                                                                        sx={{ color: 'text.secondary', mt: 1 }}>
                                                                        Nenhuma resposta selecionada
                                                                    </Typography>
                                                                )}
                                                            </FormControl>
                                                        ) : (
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
                            const formKey = `${form.tipoForm}-${form.id}-${form.visitaId}`;
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
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            width: '100%'
                                        }}>
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
                                                                    <Typography variant="body2"
                                                                        sx={{ color: 'text.secondary', mt: 1 }}>
                                                                        Nenhuma resposta selecionada
                                                                    </Typography>
                                                                )}
                                                            </FormControl>
                                                        ) : (
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