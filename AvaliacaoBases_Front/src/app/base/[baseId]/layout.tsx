"use client";
import React, { useEffect, useState } from "react";
import {
    Box,
    CssBaseline,
    AppBar,
    Toolbar,
    Typography,
    Button,
    useMediaQuery,
    useTheme,
    IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar, { COLLAPSED_DRAWER_WIDTH, DRAWER_WIDTH } from "../../../components/base/Sidebar";
import { BaseResponse } from "@/components/types";
import { useParams } from "next/navigation";

type Props = {
    children: React.ReactNode;
};

export default function Layout({ children }: Props) {
    const params = useParams();
    const baseId = params?.baseId as string | undefined;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [baseData, setBaseData] = useState<BaseResponse | null>(null);
    const [isClient, setIsClient] = useState(false);

    const handleDrawerToggle = () => {
        if (isMobile) {
            setMobileOpen(!mobileOpen);
            return;
        }
        toggleSidebarCollapsed();
    };

    const handleDrawerClose = () => {
        setMobileOpen(false);
    };

    useEffect(() => {
        setSidebarCollapsed(localStorage.getItem("baseSidebarCollapsed") === "true");
        setIsClient(true);
    }, []);

    const toggleSidebarCollapsed = () => {
        setSidebarCollapsed((value) => {
            const next = !value;
            localStorage.setItem("baseSidebarCollapsed", String(next));
            return next;
        });
    };

    useEffect(() => {
        if (!isClient) return;
        if (!baseId) return;

        const localKey = `baseData_${baseId}`;
        const localData = localStorage.getItem(localKey);

        if (localData) {
            try {
                setBaseData(JSON.parse(localData));
                return;
            } catch {
                console.warn("Erro ao parsear baseData do localStorage");
            }
        }

        const buscarBase = async () => {
            try {
                const res = await fetch(`/api/base/${baseId}`, { cache: "no-store" });
                if (!res.ok) throw new Error("Falha ao carregar dados da base");
                const dados: BaseResponse = await res.json();
                setBaseData(dados);
                localStorage.setItem(localKey, JSON.stringify(dados));
            } catch (err) {
                console.error("Erro ao buscar dados da base:", err);
            }
        };
        buscarBase();
    }, [isClient, baseId]);

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f8fb" }}>
            <CssBaseline />

            <Sidebar mobileOpen={mobileOpen} handleDrawerClose={handleDrawerClose} collapsed={sidebarCollapsed} />
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    bgcolor: '#430000',
                    color: 'white',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    borderRadius: 10,
                    boxShadow: '0 5px 4px rgba(0,0,0,0.3)',
                }}
            >
                <Toolbar sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto minmax(88px, 1fr)', alignItems: 'center', gap: 2, px: { xs: 1, sm: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={handleDrawerToggle}
                            aria-label={isMobile ? "Abrir menu" : sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
                        >
                            <MenuIcon />
                        </IconButton>
                        {!isMobile && (
                            <Typography variant="subtitle1" component="div" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                                {isClient && baseData ? `Base Samu - ${baseData.nome}` : ''}
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button sx={{ "&:hover": { transform: "scale(1.05)" }, cursor: "pointer", minWidth: 'auto', p: 0 }} href='/'>
                            <img src='/cisbaf.png' alt="Logo" style={{ height: 40, display: 'block' }} />
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            color="error"
                            href="/logout"
                            sx={{
                                boxShadow: '0 3px 5px rgba(0, 0, 0, 0.2)',
                                borderRadius: 5
                            }}
                        >
                            Sair
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 1.5, md: 3 },
                    mt: 10,
                    width: { xs: '100%', md: `calc(100% - ${sidebarCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH}px)` },
                    maxWidth: '100vw',
                    overflowX: 'hidden',
                    boxSizing: 'border-box',
                    visibility: isClient ? 'visible' : 'hidden',
                    transition: 'all 0.3s ease',
                }}
            >
                {children}
            </Box>
        </Box >
    );
}
