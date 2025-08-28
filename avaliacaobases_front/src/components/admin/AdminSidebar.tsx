"use client";
import React, { useState } from "react";
import {
    Drawer,
    Toolbar,
    Box,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider
} from "@mui/material";
import {
    Home,
    LocalShipping,
    Assessment,
    History,
    InsertDriveFile,
    LocalHospital,
} from "@mui/icons-material";

const drawerWidth = 280;

export default function AdminSidebar() {
    const [pathname, setPathname] = useState("");

    const menuItems = [
        { label: "Visão Geral", icon: <Home />, href: `/admin` },
        { label: "Bases", icon: <LocalHospital />, href: `/admin/bases` },
        { label: "Viaturas", icon: <LocalShipping />, href: `/admin/viaturas` },
        { label: "Indicadores", icon: <Assessment />, href: `/admin/indicadores` },
        { label: "Relatórios", icon: <InsertDriveFile />, href: `/admin/relatorios` },
        { label: "Histórico", icon: <History />, href: `/admin/historico` },
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
                            item.href === `/admin`
                                ? pathname === `/admin`
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
            </Box>
        </Drawer>
    );
}