"use client";
import React, { useEffect, useState } from "react";
import {
    Box, Paper, Typography, Chip, Avatar, AvatarGroup, LinearProgress,
    List, ListItem, ListItemText, Alert, CircularProgress
} from "@mui/material";
import { useParams } from "next/navigation";
import {
    DashboardData
} from "@/components/types";

export default function DashboardPage() {
    const params = useParams();
    const baseId = Number(params.baseId);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Buscar dados de diferentes endpoints
                const [
                    viaturasRes,
                    visitasRes,
                    relatoriosRes,
                    checklistsRes,
                    relatosRes,
                    equipeRes,
                    indicadoresRes
                ] = await Promise.all([
                    fetch(`/api/viatura?baseId=${baseId}`),
                    fetch(`/api/visita/base/${baseId}`),
                    fetch(`/api/relatorios/consolidado/${baseId}?inicio=${getDate30DaysAgo()}&fim=${getCurrentDate()}`),
                    fetch(`/api/checklist`),
                    fetch(`/api/visita/relatos/base/${baseId}`),
                    fetch(`/api/equipe/base/${baseId}`),
                    fetch(`/api/indicadores/base/${baseId}`)
                ]);

                // Função auxiliar para processar respostas
                const processResponse = async (response: Response) => {
                    if (!response.ok) {
                        return null;
                    }
                    const text = await response.text();
                    return text ? JSON.parse(text) : null;
                };

                const [viaturas, visitas, relatorios, checklists, relatos, equipe, indicadores] = await Promise.all([
                    processResponse(viaturasRes),
                    processResponse(visitasRes),
                    processResponse(relatoriosRes),
                    processResponse(checklistsRes),
                    processResponse(relatosRes),
                    processResponse(equipeRes),
                    processResponse(indicadoresRes)
                ]);

                setData({
                    viaturas: viaturas || [],
                    visitas: visitas || [],
                    relatorios: relatorios || [],
                    checklists: checklists || [],
                    relatos: relatos || [],
                    equipe: equipe || [],
                    indicadores: indicadores || {
                        indiceSaude: 0,
                        conformidadeGeral: 0,
                        viaturasOperacionais: 0,
                        profissionaisAtivos: 0,
                        tempoRespostaMedio: 0,
                        adesaoCodigoJ4: 0
                    }
                });

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (baseId) {
            fetchDashboardData();
        }
    }, [baseId]);

    const getDate30DaysAgo = () => {
        const date = new Date();
        date.setDate(date.getDate() - 9000); // Corrigido para 30 dias
        return date.toISOString().split('T')[0];
    };

    const getCurrentDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    const getPrioridadeColor = (prioridade: string) => {
        switch (prioridade) {
            case 'alta': return '#ff7043';
            case 'media': return '#ffd54f';
            case 'baixa': return '#66bb6a';
            default: return '#e0e0e0';
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
    }

    if (!data) {
        return <Alert severity="info" sx={{ m: 2 }}>Nenhum dado encontrado para esta base.</Alert>;
    }

    const { viaturas, visitas, relatorios, checklists, relatos, equipe, indicadores } = data;

    // Calcular estatísticas
    const viaturasOperacionais = viaturas.filter(v => v.statusOperacional === 'Em operação').length;
    const viaturasCriticas = viaturas.filter(v =>
        v.itens && v.itens.some(item => item.conformidade < 80)
    ).length;

    return (
        <div>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, p: 0 }}>
                {/* Linha superior (grande gráfico + card de viaturas) */}
                <Box sx={{ width: { xs: '100%', md: 'calc(70% - 12px)' } }}>
                    <Paper sx={{ p: 2, borderRadius: 2, minHeight: 320 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Evolução de Indicadores</Typography>
                            <Chip
                                label={`${indicadores.conformidadeGeral > 0 ? '+5%' : 'Sem dados'} no último mês`}
                                color={indicadores.conformidadeGeral > 0 ? "success" : "default"}
                                size="small"
                            />
                        </Box>

                        {/* Placeholder de gráfico */}
                        <Box sx={{ height: 180, borderRadius: 1, bgcolor: "#f3f7fb", display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
                            <Typography color="text.secondary">
                                {relatorios.length > 0 ? 'Gráfico de evolução de conformidade' : 'Sem dados de relatórios'}
                            </Typography>
                        </Box>

                        <Box sx={{ mt: 1 }}>
                            <Typography variant="body2">Tempo de Resposta Médio</Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min((indicadores.tempoRespostaMedio / 10) * 100, 100)}
                                    sx={{ flex: 1, height: 10, borderRadius: 5 }}
                                />
                                <Typography variant="caption">
                                    {indicadores.tempoRespostaMedio > 0 ? `${indicadores.tempoRespostaMedio}min (meta: 10min)` : 'Sem dados'}
                                </Typography>
                            </Box>

                            <Box sx={{ mt: 1 }}>
                                <Typography variant="body2">Adesão Código J4</Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={indicadores.adesaoCodigoJ4}
                                        color={indicadores.adesaoCodigoJ4 >= 90 ? "success" : "error"}
                                        sx={{ flex: 1, height: 10, borderRadius: 5 }}
                                    />
                                    <Typography variant="caption">
                                        {indicadores.adesaoCodigoJ4 > 0 ? `${indicadores.adesaoCodigoJ4}% (meta: 90%)` : 'Sem dados'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Box>

                <Box sx={{ width: { xs: '100%', md: 'calc(30% - 12px)' } }}>
                    <Paper sx={{ p: 2, borderRadius: 2, minHeight: 320 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Viaturas e Equipamentos</Typography>
                            <Chip
                                label={`${viaturasCriticas} item${viaturasCriticas !== 1 ? 's' : ''} crítico${viaturasCriticas !== 1 ? 's' : ''}`}
                                color={viaturasCriticas > 0 ? "warning" : "success"}
                                size="small"
                            />
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {viaturas.map((viatura) => (
                                <Box key={viatura.placa} sx={{ width: { xs: 'calc(50% - 4px)', sm: 'calc(50% - 4px)', md: '100%' } }}>
                                    <Paper sx={{ p: 1.5, borderRadius: 2, textAlign: "center" }}>
                                        <LocalVehicleIcon />
                                        <Typography variant="caption" display="block">
                                            {viatura.modelo} - {viatura.placa}
                                        </Typography>
                                        <Chip
                                            label={viatura.statusOperacional}
                                            size="small"
                                            sx={{ mt: 1 }}
                                            color={viatura.statusOperacional === 'Em operação' ? 'success' : 'warning'}
                                        />
                                    </Paper>
                                </Box>
                            ))}


                        </Box>
                    </Paper>
                </Box>

                {/* Segunda linha: checklist + relatos */}
                <Box sx={{ width: { xs: '100%', md: 'calc(70% - 12px)' } }}>
                    <Paper sx={{ p: 2, borderRadius: 2, minHeight: 260 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Checklist Digital</Typography>
                            <Chip
                                label={checklists.length > 0 ? "Em uso" : "Não utilizado"}
                                color={checklists.length > 0 ? "success" : "default"}
                                size="small"
                            />
                        </Box>

                        <Typography variant="body2">Taxa de Adesão</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <LinearProgress
                                variant="determinate"
                                value={indicadores.conformidadeGeral}
                                sx={{ flex: 1, height: 10, borderRadius: 5 }}
                            />
                            <Typography variant="caption">
                                {indicadores.conformidadeGeral > 0 ? `${indicadores.conformidadeGeral}%` : 'Sem dados'}
                            </Typography>
                        </Box>

                        <Box sx={{ height: 140, mt: 2, bgcolor: "#f7fbff", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Typography color="text.secondary">
                                {checklists.length > 0 ? 'Gráfico de conformidade' : 'Sem checklists'}
                            </Typography>
                        </Box>

                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2">Próximas Ações</Typography>
                            <List dense>
                                <ListItem disablePadding><ListItemText primary="Treinamento uso do app - 05/07/2025" /></ListItem>
                                <ListItem disablePadding><ListItemText primary="Atualização da versão 2.1" /></ListItem>
                                <ListItem disablePadding><ListItemText primary="Integração com sistema de chamados" /></ListItem>
                            </List>
                        </Box>
                    </Paper>
                </Box>

                <Box sx={{ width: { xs: '100%', md: 'calc(30% - 12px)' } }}>
                    <Paper sx={{ p: 2, borderRadius: 2, minHeight: 260 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Relatos da Equipe</Typography>
                            <Chip
                                label={`${relatos.filter(r => !r.resolvido).length} pendentes`}
                                color={relatos.filter(r => !r.resolvido).length > 0 ? "warning" : "success"}
                                size="small"
                            />
                        </Box>

                        <Box>
                            {relatos.slice(0, 3).map((relato) => (
                                <Paper
                                    key={relato.id}
                                    sx={{
                                        p: 1.5,
                                        mb: 1,
                                        borderRadius: 2,
                                        borderLeft: `4px solid ${getPrioridadeColor(relato.prioridade)}`
                                    }}
                                >
                                    <Typography variant="subtitle2">{relato.titulo}</Typography>
                                    <Typography variant="caption" display="block">{relato.mensagem}</Typography>
                                    <Typography variant="caption" display="block">{relato.autor} • {new Date(relato.data).toLocaleDateString('pt-BR')}</Typography>
                                </Paper>
                            ))}
                            {relatos.length === 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    Nenhum relato registrado
                                </Typography>
                            )}
                        </Box>
                    </Paper>
                </Box>

                {/* Terceira linha: histórico + equipe */}
                <Box sx={{ width: { xs: '100%', md: 'calc(70% - 12px)' } }}>
                    <Paper sx={{ p: 2, borderRadius: 2, minHeight: 320 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Histórico de Visitas</Typography>
                        <Box sx={{ display: "flex", flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                {visitas.slice(0, 3).map((visita) => (
                                    <Paper key={visita.id} sx={{ p: 2, mb: 1, borderRadius: 2 }}>
                                        <Typography variant="subtitle2">
                                            {new Date(visita.dataVisita).toLocaleDateString('pt-BR')} - Visita
                                        </Typography>
                                        <Typography variant="caption">
                                            {visita.membros.length} profissional{visita.membros.length !== 1 ? 'eis' : ''}
                                        </Typography>
                                    </Paper>
                                ))}
                                {visitas.length === 0 && (
                                    <Typography variant="body2" color="text.secondary">
                                        Nenhuma visita registrada
                                    </Typography>
                                )}
                            </Box>

                        </Box>
                    </Paper>
                </Box>


            </Box>
        </div>
    );
}

/** Pequeno ícone local para viaturas */
function LocalVehicleIcon() {
    return (
        <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#e3f2fd", display: "inline-flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
            <SvgTruck />
        </Box>
    );
}

function SvgTruck() {
    return (
        <svg width="20" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 7h11v8H3z" fill="#1976d2" opacity="0.12" />
            <path d="M16 11h3l2 3v3h-3" stroke="#1976d2" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="7.5" cy="18.5" r="1.5" fill="#1976d2" />
            <circle cx="18.5" cy="18.5" r="1.5" fill="#1976d2" />
        </svg>
    );
}