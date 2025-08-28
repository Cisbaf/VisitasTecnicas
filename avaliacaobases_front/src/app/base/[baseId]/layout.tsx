"use client";
import React, { useEffect, useState } from "react";
import {
    Box,
    CssBaseline,
    AppBar,
    Toolbar,
    Typography,
    Button
} from "@mui/material";
import Sidebar from "../../../components/base/Sidebar";
import { BaseResponse } from "@/components/types";
import { useParams } from "next/navigation";

type Props = {
    children: React.ReactNode;
    drawerWidth?: number;
};

export default function Layout({ children, drawerWidth = 280 }: Props) {
    const params = useParams();
    const baseId = params?.baseId as string | undefined;

    const [baseData, setBaseData] = useState<BaseResponse | null>(null);
    const [isClient, setIsClient] = useState(false);

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


    const headerFallback = "Base SAMU";

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f8fb" }}>
            <CssBaseline />

            <Sidebar />

            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    bgcolor: "#cc3405",
                    color: "white",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    borderRadius: 10,
                    boxShadow: "0 5px 4px rgba(0, 0, 0, 0.3)",
                }}
            >
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    <Box>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                            {/* aqui evitamos mismatch: antes do mount mostramos fallback estável */}
                            {isClient && baseData
                                ? `${baseData.tipoBase} - ${baseData.nome}`
                                : headerFallback}
                        </Typography>
                    </Box>
                    <Box>
                        <Button
                            variant="contained"
                            href="/logout"
                            sx={{
                                textTransform: 'none',
                                bgcolor: '#ff5722',
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
                sx={{ flexGrow: 1, p: 3, mt: 10, width: `calc(100% - ${drawerWidth}px)` }}
            >
                {children}
            </Box>
        </Box>
    );
}
