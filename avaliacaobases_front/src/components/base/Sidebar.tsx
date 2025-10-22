// components/Sidebar.tsx
"use client";
import React, { useEffect, useState } from "react";
import {
    Drawer,
    Toolbar,
    Box,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Paper,
    Typography,
    CircularProgress,
} from "@mui/material";
import {
    Home,
    CheckBox,
    LocalShipping,
    Assessment,
    History,
    InsertDriveFile,
} from "@mui/icons-material";
import { useParams, usePathname } from "next/navigation";

interface VisitaResponse {
    id: number;
    dataVisita: string;
    idBase: number;
    membros: Array<{
        id: number;
        nome: string;
        especialidade: string;
    }>;
}

const drawerWidth = 280;

export default function Sidebar() {
    const params = useParams();
    const pathname = usePathname();
    const baseId = params.baseId as string;

    const [ultimaVisita, setUltimaVisita] = useState<VisitaResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUltimaVisita() {
            try {
                setLoading(true);

                // Buscar visitas da base
                const visitasRes = await fetch(`/api/visita/base/${baseId}`);

                if (!visitasRes.ok) {
                    if (visitasRes.status === 404) {
                        setUltimaVisita(null);
                        return;
                    }
                    throw new Error("Falha ao carregar visitas");
                }

                const visitasText = await visitasRes.text();
                const visitasData: VisitaResponse[] = visitasText ? JSON.parse(visitasText) : [];

                // Ordenar visitas por data (mais recente primeiro)
                visitasData.sort((a, b) =>
                    new Date(b.dataVisita).getTime() - new Date(a.dataVisita).getTime()
                );

                // Pegar a visita mais recente
                const visitaRecente = visitasData.length > 0 ? visitasData[0] : null;
                setUltimaVisita(visitaRecente);

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        if (baseId) {
            fetchUltimaVisita();
        }
    }, [baseId]);

    const menuItems = [
        { label: "Visão Geral", icon: <Home />, href: `/base/${baseId}` },
        { label: "Inspeção", icon: <CheckBox />, href: `/base/${baseId}/inspecao` },
        { label: "Viaturas", icon: <LocalShipping />, href: `/base/${baseId}/viatura` },
        { label: "Relatórios", icon: <InsertDriveFile />, href: `/base/${baseId}/relatorios` },
        { label: "Histórico", icon: <History />, href: `/base/${baseId}/historico` },
    ];

    const formatarData = (dataString: string) => {
        return new Date(dataString).toLocaleDateString('pt-BR');
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: drawerWidth,
                    boxSizing: "border-box",
                    borderRight: 0,
                    background: "#f7fbfe",
                },
            }}
        >
            <Toolbar />
            <Box sx={{ overflow: "auto", p: 2 }}>
                <List>
                    {menuItems.map((item) => {
                        const isSelected =
                            item.href === `/base/${baseId}`
                                ? pathname === `/base/${baseId}`
                                : pathname.startsWith(item.href);

                        return (
                            <ListItemButton
                                key={item.label}
                                component="a"
                                href={item.href}
                                selected={isSelected}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.label} />
                            </ListItemButton>
                        );
                    })}
                </List>

                <Divider sx={{ my: 2 }} />

                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                        Última Visita Técnica
                    </Typography>

                    {loading ? (
                        <Box display="flex" justifyContent="center" py={2}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : error ? (
                        <Typography variant="caption" color="error">
                            Erro ao carregar dados
                        </Typography>
                    ) : !ultimaVisita ? (
                        <Typography variant="caption">
                            Nenhuma visita realizada
                        </Typography>
                    ) : (
                        <>
                            <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                                Data: {formatarData(ultimaVisita.dataVisita)}
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                                Equipe: {ultimaVisita.membros.map(m => m.nome).join(", ")}
                            </Typography>

                        </>
                    )}
                </Paper>
            </Box>
        </Drawer>
    );
}