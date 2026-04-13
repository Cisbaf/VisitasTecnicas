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
import Sidebar from "../../../components/base/Sidebar";
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
    const [baseData, setBaseData] = useState<BaseResponse | null>(null);
    const [isClient, setIsClient] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleDrawerClose = () => {
        setMobileOpen(false);
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

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

            <Sidebar mobileOpen={mobileOpen} handleDrawerClose={handleDrawerClose} />
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    bgcolor: "#cc3405",
                    color: 'white',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    borderRadius: 10,
                    boxShadow: '0 5px 4px rgba(0,0,0,0.3)',
                }}
            >
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flex: 1,
                        gap: 2
                    }}>
                        {/* Esquerda: botão do menu (mobile) */}
                        {isMobile && (
                            <IconButton
                                color="inherit"
                                edge="start"
                                onClick={handleDrawerToggle}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}

                        {/* Centro: logo */}
                        <Box sx={{
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <Button sx={{ "&:hover": { transform: "scale(1.1)" }, cursor: "pointer", minWidth: 'auto' }} href='/'>
                                <img src='/cisbaf.png' alt="Logo" style={{ height: 40 }} />
                            </Button>
                        </Box>

                        {/* Direita: espaço vazio para balancear (mobile) OU título (desktop) */}
                        {!isMobile && (
                            <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                                {isClient && baseData ? `Base Samu - ${baseData.nome}` : ''}
                            </Typography>
                        )}

                        {isMobile && <Box sx={{ width: 48 }} />} {/* Espaço reservado para balancear */}
                    </Box>
                    <Box>
                        <Button
                            variant="contained"
                            href="/logout"
                            sx={{
                                textTransform: 'none',
                                bgcolor: "#cd9805",
                                '&:hover': { bgcolor: '#e64a19' },
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
                    p: 3,
                    mt: isMobile ? 8 : 10,
                    width: isMobile ? '100%' : `calc(100% - 280px)`,
                    transition: 'all 0.3s ease',
                }}
            >
                {children}
            </Box>
        </Box >
    );
}