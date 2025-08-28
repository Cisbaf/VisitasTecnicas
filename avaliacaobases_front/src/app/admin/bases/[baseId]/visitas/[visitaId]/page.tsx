"use client";
import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    Alert,
    CircularProgress,
    IconButton,
    Tabs,
    Tab,
    Card,
    CardContent,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
    TextField,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import {
    Add as AddIcon,
    ArrowBack as BackIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    CalendarToday as CalendarIcon,
    Save as SaveIcon,
    Person as PersonIcon,
    ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useRouter, useParams } from "next/navigation";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import { CategoriaAgrupada, EquipeTecnica, RelatoDTO, VisitaDetails } from "@/components/types";
import ChecklistService from "@/components/base/service/ChecklistService";

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
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function VisitaDetailPage() {
    const router = useRouter();
    const params = useParams();
    const baseId = Number(params.baseId);
    const visitaId = Number(params.visitaId);

    const [tabValue, setTabValue] = useState(0);
    const [visita, setVisita] = useState<VisitaDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [relatos, setRelatos] = useState<RelatoDTO[]>([]);
    const [categoriasAgrupadas, setCategoriasAgrupadas] = useState<CategoriaAgrupada[]>([]);
    const [checklistLoading, setChecklistLoading] = useState(false);

    useEffect(() => {
        if (visitaId) {
            fetchVisita();
            fetchRelatos();
            fetchChecklists();
        }
    }, [visitaId]);

    const fetchVisita = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/visita/${visitaId}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data: VisitaDetails = await res.json();
            setVisita(data);
        } catch (err: any) {
            setError(String(err?.message ?? err));
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatos = async () => {
        try {
            const rRes = await fetch(`/api/visita/relatos/visita/${visitaId}`);
            if (rRes.ok) {
                const rData: RelatoDTO[] = await rRes.json();
                setRelatos(rData);
            } else {
                setRelatos([]);
            }
        } catch (err) {
            console.error("Erro ao buscar relatos:", err);
        }
    };

    const fetchChecklists = async () => {
        try {
            setChecklistLoading(true);
            const data = ChecklistService.getCategoriasAgrupadas(baseId);
            data.then(setCategoriasAgrupadas);
            console.log(data);
        } catch (err: any) {
            console.error("Erro ao buscar checklists:", err);
        } finally {
            setChecklistLoading(false);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Funções para manipular a visita (membros, relatos, etc.)
    async function addMemberToVisit(nome: string, cargo?: string) {
        if (!visita) return;
        try {
            const res = await fetch(`/api/visita/membro/${visita.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, cargo }),
            });
            if (!res.ok) throw new Error("Erro ao adicionar membro");
            const saved = await res.json();
            setVisita((v) => (v ? { ...v, membros: [...v.membros, saved] } : v));
        } catch (err: any) {
            setError(String(err?.message ?? err));
        }
    }

    async function removeMemberFromVisit(index: number) {
        if (!visita) return;
        const membro = visita.membros[index];
        if (!confirm(`Remover ${membro.nome}?`)) return;
        try {
            const res = await fetch(`/api/visita/membro/${visita.id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome: membro.nome, cargo: membro.cargo }),
            });
            if (!res.ok) throw new Error("Erro ao remover membro");
            setVisita((v) => (v ? { ...v, membros: v.membros.filter((_, i) => i !== index) } : v));
        } catch (err: any) {
            setError(String(err?.message ?? err));
        }
    }

    async function addRelatoToVisit(payload: Partial<RelatoDTO> & { gestorResponsavel: string; resolvido: boolean }) {
        if (!visita) return;
        try {
            const fullPayload = {
                ...payload,
                id_visita: visita.id,
                baseId: baseId,
                data: new Date().toISOString(),
            };

            const res = await fetch(`/api/visita/relatos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(fullPayload),
            });
            if (!res.ok) throw new Error("Erro ao criar relato");
            const r: RelatoDTO = await res.json();
            setRelatos((prev) => [...prev, r]);
        } catch (err: any) {
            setError(String(err?.message ?? err));
        }
    }

    async function updateRelato(relatoId: number, updates: Partial<RelatoDTO>) {
        try {
            const res = await fetch(`/api/visita/relatos`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            if (!res.ok) throw new Error("Erro ao atualizar relato");
            const updated: RelatoDTO = await res.json();
            setRelatos((prev) => prev.map((r) => (r.id === relatoId ? updated : r)));
        } catch (err: any) {
            setError(String(err?.message ?? err));
        }
    }

    async function deleteRelato(relatoId: number) {
        if (!visita) return;
        if (!confirm("Excluir relato?")) return;
        try {
            const res = await fetch(`/api/visita/relatos/${relatoId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Erro ao excluir relato");
            setRelatos((prev) => prev.filter((r) => r.id !== relatoId));
        } catch (err: any) {
            setError(String(err?.message ?? err));
        }
    }

    async function saveCurrentVisit() {
        if (!visita) return;
        try {
            const res = await fetch(`/api/visita/${visita.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(visita),
            });
            if (!res.ok) throw new Error("Falha ao salvar visita");
            const updated = await res.json();
            setVisita(updated);
        } catch (err: any) {
            setError(String(err?.message ?? err));
        }
    }

    // Funções para checklist
    const getConformidadeColor = (percent: number) => {
        if (percent >= 80) return "success";
        if (percent >= 50) return "warning";
        return "error";
    };

    const getCriticidadeColor = (criticidade: string) => {
        switch (criticidade) {
            case "Alta": return "error";
            case "Média": return "warning";
            case "Baixa": return "info";
            default: return "default";
        }
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

    if (!visita) {
        return <Alert severity="warning">Visita não encontrada</Alert>;
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <IconButton onClick={() => router.push(`/admin/bases/${baseId}/visitas`)} sx={{ mr: 1 }}>
                        <BackIcon />
                    </IconButton>
                    <Typography variant="h4">
                        Visita de {new Date(visita.dataVisita).toLocaleDateString("pt-BR")}
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="abas de detalhes da visita">
                        <Tab label="Detalhes" {...a11yProps(0)} />
                        <Tab label="Checklists" {...a11yProps(1)} />
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3 }}>
                        <DatePicker
                            label="Data"
                            value={new Date(visita.dataVisita)}
                            onChange={(d) => {
                                if (!d) return;
                                const s = d.toISOString().split("T")[0];
                                setVisita({ ...visita, dataVisita: s });
                            }}
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                        <Button startIcon={<SaveIcon />} variant="contained" onClick={saveCurrentVisit}>
                            Salvar visita
                        </Button>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1">Membros</Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                            {visita.membros.map((m, idx) => (
                                <Chip
                                    key={idx}
                                    icon={<PersonIcon />}
                                    label={`${m.nome}${m.cargo ? ` — ${m.cargo}` : ""}`}
                                    onDelete={() => removeMemberFromVisit(idx)}
                                    variant="outlined"
                                />
                            ))}
                            <AddMemberInline onAdd={addMemberToVisit} />
                        </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box>
                        <Typography variant="subtitle1" gutterBottom>Relatos</Typography>

                        {relatos.slice(0, 3).map((relato) => (
                            <Paper
                                key={relato.id}
                                sx={{
                                    p: 1.5,
                                    mb: 1,
                                    borderRadius: 2,
                                    borderLeft: `4px solid rgba(0,0,0,0.08)`
                                }}
                            >
                                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                                    <Box>
                                        <Typography variant="subtitle2">{relato.tema ?? "Sem tema"}</Typography>
                                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{relato.mensagem}</Typography>
                                        <Typography variant="caption" display="block" color="text.secondary">
                                            {relato.autor} • {relato.data ? new Date(relato.data).toLocaleDateString('pt-BR') : ""}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                        <IconButton size="small" onClick={() => {
                                            const novo = prompt("Editar relato", relato.mensagem);
                                            if (novo !== null) updateRelato(relato.id, { mensagem: novo });
                                        }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => deleteRelato(relato.id)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Paper>
                        ))}

                        {relatos.length === 0 && (
                            <Typography variant="body2" color="text.secondary">
                                Nenhum relato registrado
                            </Typography>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <AddRelatoInline members={visita.membros} onAdd={(p) => addRelatoToVisit(p)} />
                    </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                        <Typography variant="h4" fontWeight="600">
                            CheckList de Inspeção
                        </Typography>
                        <Button variant="contained" startIcon={<AddIcon />} sx={{ ml: 2 }}>
                            Novo Checklist
                        </Button>
                    </Box>

                    {checklistLoading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                            <CircularProgress />
                        </Box>
                    ) : categoriasAgrupadas.length === 0 ? (
                        <Alert severity="info">Nenhum checklist encontrado para esta visita.</Alert>
                    ) : (
                        categoriasAgrupadas.map(categoria => (
                            <Accordion key={categoria.categoria} sx={{ mb: 2 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                        <Typography variant="h6">
                                            {categoria.categoria}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mr: 2 }}>
                                            Última visita: {categoria.ultimaVisita ? new Date(categoria.ultimaVisita).toLocaleDateString('pt-BR') : "—"}
                                        </Typography>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {categoria.visitas.map(visita => (
                                        <Card key={visita.visitaId} sx={{ marginBottom: 2 }}>
                                            <CardContent>
                                                <Typography variant="subtitle1" gutterBottom color="primary">
                                                    Visita de {visita.dataVisita ? new Date(visita.dataVisita).toLocaleDateString('pt-BR') : "—"}
                                                </Typography>
                                                <Grid container spacing={2}>
                                                    {visita.descricoes.map((descricao) => (
                                                        <Grid item xs={12} md={6} key={descricao.id}>
                                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                                <Typography variant="subtitle2" gutterBottom>
                                                                    {descricao.descricao}
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                                                    <Chip
                                                                        label={`Conformidade: ${descricao.conformidadePercent}%`}
                                                                        color={getConformidadeColor(descricao.conformidadePercent)}
                                                                        size="small"
                                                                    />
                                                                    <Chip
                                                                        label={`Tipo: ${descricao.tipoConformidade}`}
                                                                        variant="outlined"
                                                                        size="small"
                                                                    />
                                                                    <Chip
                                                                        label={`Criticidade: ${descricao.criticidade}`}
                                                                        color={getCriticidadeColor(descricao.criticidade)}
                                                                        size="small"
                                                                    />
                                                                </Box>
                                                                {descricao.observacao && (
                                                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                                                        <strong>Observação:</strong> {descricao.observacao}
                                                                    </Typography>
                                                                )}
                                                            </Paper>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </AccordionDetails>
                            </Accordion>
                        ))
                    )}
                </TabPanel>
            </Box>
        </LocalizationProvider>
    );
}

// Componentes auxiliares
function AddMemberInline({ onAdd }: { onAdd: (nome: string, cargo?: string) => void }) {
    const [nome, setNome] = useState("");
    const [cargo, setCargo] = useState("");
    return (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField size="small" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            <TextField size="small" placeholder="Cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} />
            <Button size="small" variant="contained" onClick={() => { if (!nome) return; onAdd(nome, cargo); setNome(""); setCargo(""); }}>Adicionar</Button>
        </Box>
    );
}

function AddRelatoInline({
    members,
    onAdd,
}: {
    members: EquipeTecnica[];
    onAdd: (p: { autor: string; mensagem: string; tema?: string; gestorResponsavel: string; resolvido: boolean }) => void;
}) {
    const [autor, setAutor] = useState(members[0]?.nome ?? "");
    const [mensagem, setMensagem] = useState("");
    const [tema, setTema] = useState("");
    const [gestorResponsavel, setGestorResponsavel] = useState("");
    const [resolvido, setResolvido] = useState(false);

    useEffect(() => {
        if (members.length && !autor) {
            setAutor(members[0].nome);
        }
    }, [members, autor]);

    const handleSubmit = () => {
        if (!mensagem.trim()) return;
        onAdd({
            autor,
            mensagem,
            tema: tema.trim() || undefined,
            gestorResponsavel,
            resolvido
        });
        setMensagem("");
        setTema("");
        setGestorResponsavel("");
        setResolvido(false);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <FormControl size="small">
                <InputLabel>Autor</InputLabel>
                <Select
                    value={autor}
                    label="Autor"
                    onChange={(e) => setAutor(e.target.value)}
                    sx={{ minWidth: 200 }}
                >
                    {members.map((m, idx) => (
                        <MenuItem key={idx} value={m.nome}>
                            {m.nome}
                            {m.cargo ? ` — ${m.cargo}` : ""}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <TextField
                label="Gestor Responsável"
                size="small"
                value={gestorResponsavel}
                onChange={(e) => setGestorResponsavel(e.target.value)}
                required
            />
            <TextField
                label="Tema"
                size="small"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                required
            />
            <FormControl size="small">
                <InputLabel>Resolvido</InputLabel>
                <Select
                    value={resolvido ? 'sim' : 'não'}
                    label="Resolvido"
                    onChange={(e) => setResolvido(e.target.value === 'sim')}
                >
                    <MenuItem value="sim">Sim</MenuItem>
                    <MenuItem value="não">Não</MenuItem>
                </Select>
            </FormControl>
            <TextField
                label="Mensagem"
                size="small"
                multiline
                rows={3}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!mensagem.trim()}
                >
                    Adicionar Relato
                </Button>
            </Box>
        </Box>
    );
}