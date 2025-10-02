"use client";
import React, { useState, useEffect } from "react";
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
    Person,
} from "@mui/icons-material";
import { usePathname } from "next/navigation";

const drawerWidth = 280;

export default function AdminSidebar() {
    const pathname = usePathname();

    const menuItems = [
        { label: "Visão Geral", icon: <Home />, href: `/admin` },
        { label: "Bases", icon: <LocalHospital />, href: `/admin/bases` },
        { label: "Viaturas", icon: <LocalShipping />, href: `/admin/viaturas` },
        { label: "Indicadores", icon: <Assessment />, href: `/admin/indicadores` },
        { label: "Relatórios", icon: <InsertDriveFile />, href: `/admin/relatorios` },
        { label: "Histórico", icon: <History />, href: `/admin/historico` },
        { label: "Registrar", icon: <Person />, href: `/admin/registrar` },
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
                        const isSelected = pathname === item.href;

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