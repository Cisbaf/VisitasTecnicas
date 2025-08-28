"use client";
import React, {useEffect, useState} from "react";
import {Alert, Box, CircularProgress, IconButton, Tab, Tabs, Typography,} from "@mui/material";
import {ArrowBack as BackIcon} from "@mui/icons-material";
import {useParams, useRouter} from "next/navigation";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";

import {CategoriaAgrupada, RelatoDTO, VisitaDetails} from "@/components/types";
import ChecklistService from "@/components/base/service/ChecklistService";
import DetalhesVisitaTab from "@/components/admin/visita/DetalhesVisitaTab";
import ChecklistsTab from "@/components/admin/visita/ChecklistsTab";


interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{p: 3}}>{children}</Box>}
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
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({nome, cargo}),
            });
            if (!res.ok) throw new Error("Erro ao adicionar membro");
            const saved = await res.json();
            setVisita((v) => (v ? {...v, membros: [...v.membros, saved]} : v));
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
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({nome: membro.nome, cargo: membro.cargo}),
            });
            if (!res.ok) throw new Error("Erro ao remover membro");
            setVisita((v) => (v ? {...v, membros: v.membros.filter((_, i) => i !== index)} : v));
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
                headers: {"Content-Type": "application/json"},
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
                headers: {"Content-Type": "application/json"},
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
            const res = await fetch(`/api/visita/relatos/${relatoId}`, {method: "DELETE"});
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
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(visita),
            });
            if (!res.ok) throw new Error("Falha ao salvar visita");
            const updated = await res.json();
            setVisita(updated);
        } catch (err: any) {
            setError(String(err?.message ?? err));
        }
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress/>
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
            <Box sx={{p: 3}}>
                <Box sx={{display: "flex", alignItems: "center", mb: 3}}>
                    <IconButton onClick={() => router.push(`/admin/bases/${baseId}/visitas`)} sx={{mr: 1}}>
                        <BackIcon/>
                    </IconButton>
                    <Typography variant="h4">
                        Visita de {new Date(visita.dataVisita).toLocaleDateString("pt-BR")}
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{mb: 2}} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="abas de detalhes da visita">
                        <Tab label="Detalhes" {...a11yProps(0)} />
                        <Tab label="Checklists" {...a11yProps(1)} />
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    <DetalhesVisitaTab
                        visita={visita}
                        relatos={relatos}
                        onSaveVisit={saveCurrentVisit}
                        onAddMember={addMemberToVisit}
                        onRemoveMember={removeMemberFromVisit}
                        onAddRelato={addRelatoToVisit}
                        onUpdateRelato={updateRelato}
                        onDeleteRelato={deleteRelato}
                    />
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <ChecklistsTab
                        categoriasAgrupadas={categoriasAgrupadas}
                        checklistLoading={checklistLoading}
                        baseId={baseId}
                        visitaId={visitaId}
                        onChecklistAdded={fetchChecklists} // Para recarregar os checklists após adicionar um novo
                    />
                </TabPanel>
            </Box>
        </LocalizationProvider>
    );
}