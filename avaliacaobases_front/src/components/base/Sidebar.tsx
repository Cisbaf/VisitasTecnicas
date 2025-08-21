// components/Sidebar.tsx
"use client";
import React from "react";
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

const drawerWidth = 280;

export default function Sidebar() {
    const params = useParams();
    const pathname = usePathname();
    const baseId = params.baseId as string;

    const menuItems = [
        { label: "Visão Geral", icon: <Home />, href: `/base/${baseId}` },
        { label: "Checklists", icon: <CheckBox />, href: `/base/${baseId}/checklists` },
        { label: "Viaturas", icon: <LocalShipping />, href: `/base/${baseId}/viatura` },
        { label: "Indicadores", icon: <Assessment />, href: `/base/${baseId}/indicadores` },
        { label: "Relatórios", icon: <InsertDriveFile />, href: `/base/${baseId}/relatorios` },
        { label: "Histórico", icon: <History />, href: `/base/${baseId}/historico` },
    ];

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
                                ? pathname === `/base/${baseId}` // Visão Geral só marca se for exatamente a home
                                : pathname.startsWith(item.href); // os outros marcam se começar com o caminho

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
                    <Typography variant="caption" display="block">
                        Data: 26/06/2025
                    </Typography>
                    <Typography variant="caption" display="block">
                        Equipe: João Paulo, Maria Silva
                    </Typography>
                    <Typography variant="caption" display="block">
                        Status: <strong>Concluída</strong>
                    </Typography>
                    <Typography variant="caption" display="block">
                        Conformidade: 92%
                    </Typography>
                </Paper>
            </Box>
        </Drawer>
    );
}
