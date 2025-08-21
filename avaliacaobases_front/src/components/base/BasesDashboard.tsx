"use client";
import React from "react";
import { Box, Paper, Typography, Chip, Avatar, AvatarGroup, LinearProgress, List, ListItem, ListItemText } from "@mui/material";

export default function DashboardPage() {
    // MOCKS - substitua pelos seus endpoints
    const kpis = {
        indiceSaude: "78/100",
        conformidade: "92%",
        viaturas: 3,
        profissionais: 15,
    };

    return (
        <div>
            {/* Container principal substituindo Grid container */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, p: 0 }}>
                {/* Linha superior (grande gráfico + card de viaturas) */}
                <Box sx={{ width: { xs: '100%', md: 'calc(70% - 12px)' } }}>
                    <Paper sx={{ p: 2, borderRadius: 2, minHeight: 320 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Evolução de Indicadores</Typography>
                            <Chip label="+5% no último mês" color="success" size="small" />
                        </Box>

                        {/* Placeholder de gráfico */}
                        <Box sx={{ height: 180, borderRadius: 1, bgcolor: "#f3f7fb", display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
                            <Typography color="text.secondary">[Gráfico de linhas - substituir por chart]</Typography>
                        </Box>

                        <Box sx={{ mt: 1 }}>
                            <Typography variant="body2">Tempo de Resposta</Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <LinearProgress variant="determinate" value={60} sx={{ flex: 1, height: 10, borderRadius: 5 }} />
                                <Typography variant="caption">12min (meta: 10min)</Typography>
                            </Box>

                            <Box sx={{ mt: 1 }}>
                                <Typography variant="body2">Adesão Código J4</Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <LinearProgress variant="determinate" value={70} color="error" sx={{ flex: 1, height: 10, borderRadius: 5 }} />
                                    <Typography variant="caption">70% (meta: 90%)</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Box>

                <Box sx={{ width: { xs: '100%', md: 'calc(30% - 12px)' } }}>
                    <Paper sx={{ p: 2, borderRadius: 2, minHeight: 320 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Viaturas e Equipamentos</Typography>
                            <Chip label="1 item crítico" color="warning" size="small" />
                        </Box>

                        {/* Substituindo o Grid container interno por Box com flex */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <Box sx={{ width: { xs: 'calc(50% - 4px)', sm: 'calc(50% - 4px)', md: '100%' } }}>
                                <Paper sx={{ p: 1.5, borderRadius: 2, textAlign: "center" }}>
                                    <LocalVehicleIcon />
                                    <Typography variant="caption" display="block">Viatura USA-01</Typography>
                                    <Chip label="Conforme" size="small" sx={{ mt: 1 }} />
                                </Paper>
                            </Box>

                            <Box sx={{ width: { xs: 'calc(50% - 4px)', sm: 'calc(50% - 4px)', md: '100%' } }}>
                                <Paper sx={{ p: 1.5, borderRadius: 2, textAlign: "center" }}>
                                    <LocalVehicleIcon />
                                    <Typography variant="caption" display="block">Viatura USB-02</Typography>
                                    <Chip label="Parcial" size="small" sx={{ mt: 1 }} />
                                </Paper>
                            </Box>

                            <Box sx={{ width: '100%', mt: 2 }}>
                                <Box sx={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#fff6f4", borderRadius: 2 }}>
                                    <Typography color="text.secondary">[Donut Chart - substituir]</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Box>

                {/* Segunda linha: checklist + relatos */}
                <Box sx={{ width: { xs: '100%', md: 'calc(70% - 12px)' } }}>
                    <Paper sx={{ p: 2, borderRadius: 2, minHeight: 260 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Checklist Digital</Typography>
                            <Chip label="Em uso" color="success" size="small" />
                        </Box>

                        <Typography variant="body2">Taxa de Adesão</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <LinearProgress variant="determinate" value={70} sx={{ flex: 1, height: 10, borderRadius: 5 }} />
                            <Typography variant="caption">70%</Typography>
                        </Box>

                        <Box sx={{ height: 140, mt: 2, bgcolor: "#f7fbff", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Typography color="text.secondary">[Gráfico de barras - substituir]</Typography>
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
                            <Chip label="2 pendentes" color="warning" size="small" />
                        </Box>

                        <Box>
                            <Paper sx={{ p: 1.5, mb: 1, borderRadius: 2, borderLeft: "4px solid #ff7043" }}>
                                <Typography variant="subtitle2">Hostilidade em Hospitais</Typography>
                                <Typography variant="caption" display="block">Profissionais cobram acesso venoso em casos não indicados</Typography>
                                <Typography variant="caption" display="block">Enf. Carlos Silva • 26/06/2025</Typography>
                            </Paper>

                            <Paper sx={{ p: 1.5, mb: 1, borderRadius: 2, borderLeft: "4px solid #ffd54f" }}>
                                <Typography variant="subtitle2">Falta de Insumos</Typography>
                                <Typography variant="caption" display="block">Reposição irregular de materiais básicos</Typography>
                                <Typography variant="caption" display="block">Tec. Ana Oliveira • 20/06/2025</Typography>
                            </Paper>

                            <Paper sx={{ p: 1.5, mb: 1, borderRadius: 2, borderLeft: "4px solid #66bb6a" }}>
                                <Typography variant="subtitle2">Dificuldade com Código J4</Typography>
                                <Typography variant="caption" display="block">Adaptação em alguns plantões ainda desafiadora</Typography>
                                <Typography variant="caption" display="block">Dr. Roberto Almeida • 15/06/2025</Typography>
                            </Paper>
                        </Box>
                    </Paper>
                </Box>

                {/* Terceira linha: histórico + equipe */}
                <Box sx={{ width: { xs: '100%', md: 'calc(70% - 12px)' } }}>
                    <Paper sx={{ p: 2, borderRadius: 2, minHeight: 320 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Histórico de Visitas</Typography>
                        <Box sx={{ display: "flex", flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <Paper sx={{ p: 2, mb: 1, borderRadius: 2 }}>
                                    <Typography variant="subtitle2">26/06/2025 - Visita Completa</Typography>
                                    <Typography variant="caption">Checklist: 92% | 3 itens críticos</Typography>
                                </Paper>

                                <Paper sx={{ p: 2, mb: 1, borderRadius: 2 }}>
                                    <Typography variant="subtitle2">15/05/2025 - Visita Parcial</Typography>
                                    <Typography variant="caption">Foco em padronização viaturas e uso códigos J</Typography>
                                </Paper>

                                <Paper sx={{ p: 2, mb: 1, borderRadius: 2 }}>
                                    <Typography variant="subtitle2">10/04/2025 - Visita Completa</Typography>
                                    <Typography variant="caption">Checklist: 85% | 5 itens críticos</Typography>
                                </Paper>
                            </Box>

                            <Box sx={{ width: { xs: '100%', sm: 220 }, bgcolor: "#f7fbff", borderRadius: 2, p: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Typography color="text.secondary">[Radar Chart - substituir]</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Box>

                <Box sx={{ width: { xs: '100%', md: 'calc(30% - 12px)' } }}>
                    <Paper sx={{ p: 2, borderRadius: 2, minHeight: 320 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Equipe e Treinamentos</Typography>
                            <Chip label="2 pendentes" color="warning" size="small" />
                        </Box>

                        <AvatarGroup max={4} sx={{ mb: 1 }}>
                            <Avatar>JS</Avatar>
                            <Avatar>MC</Avatar>
                            <Avatar>AS</Avatar>
                            <Avatar>RO</Avatar>
                        </AvatarGroup>

                        <Typography variant="caption" display="block">Códigos de Deslocamento</Typography>
                        <LinearProgress variant="determinate" value={60} sx={{ height: 10, borderRadius: 5, mb: 1 }} />
                        <Typography variant="caption" display="block">Novo Checklist Digital</Typography>
                        <LinearProgress variant="determinate" value={30} sx={{ height: 10, borderRadius: 5 }} />

                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2">Próximos Eventos</Typography>
                            <List dense>
                                <ListItem><ListItemText primary="Atualização Protocolos Emergenciais - 10/07/2025" /></ListItem>
                                <ListItem><ListItemText primary="Workshop Humanização - 25/07/2025" /></ListItem>
                                <ListItem><ListItemText primary="Treinamento Suporte Avançado - 05/08/2025" /></ListItem>
                            </List>
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </div>
    );
}

/** Pequeno ícone local para viaturas (substituir quando quiser) */
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