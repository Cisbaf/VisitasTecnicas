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
    useMediaQuery,
    useTheme,
    Skeleton
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

interface SidebarProps {
    mobileOpen: boolean;
    handleDrawerClose: () => void;
}

export default function Sidebar({ mobileOpen, handleDrawerClose }: SidebarProps) {
    const params = useParams();
    const pathname = usePathname();
    const baseId = params.baseId as string;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [ultimaVisita, setUltimaVisita] = useState<VisitaResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUltimaVisita() {
            try {
                setLoading(true);

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

                visitasData.sort((a, b) =>
                    new Date(b.dataVisita).getTime() - new Date(a.dataVisita).getTime()
                );

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

    const drawerContent = (
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
                            onClick={isMobile ? handleDrawerClose : undefined}
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
                    <Box sx={{ mt: 1 }}>
                        <Skeleton variant="text" width="60%" height={20} />
                        <Skeleton variant="text" width="90%" height={20} />
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
    );

    return (
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
            {/* VERSÃO MOBILE: Variante temporary controlada pelo CSS */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerClose}
                ModalProps={{ keepMounted: true }} // Melhora performance mobile
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, background: "#f7fbfe" },
                }}
            >
                <Toolbar />
                {drawerContent}
            </Drawer>

            {/* VERSÃO DESKTOP: Variante permanent fixa */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, background: "#f7fbfe", borderRight: 0 },
                }}
                open
            >
                <Toolbar />
                {drawerContent}
            </Drawer>
        </Box>
    );
}