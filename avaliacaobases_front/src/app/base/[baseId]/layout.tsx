// components/Layout.tsx
"use client";
import React from "react";
import {
    Box,
    CssBaseline,
    AppBar,
    Toolbar,
    Typography,
    Avatar,
    Chip,
    Button,
} from "@mui/material";
import Sidebar from "../../../components/base/Sidebar";

type Props = {
    children: React.ReactNode;
    drawerWidth?: number;
};

export default function Layout({ children, drawerWidth = 280 }: Props) {
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
                            Base Descentralizada SAMU - Japeri
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Chip label="78/100" sx={{ bgcolor: "#cc3405", color: "white" }} />
                        <Chip label="92% Conformidade" sx={{ bgcolor: "#cc3405", color: "white" }} />
                        <Chip label="3 Viaturas" sx={{ bgcolor: "#cc3405", color: "white" }} />
                    </Box>
                </Toolbar>
            </AppBar>

            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 10, width: `calc(100% - ${drawerWidth}px)` }}>
                {children}
            </Box>
        </Box>
    );
}
