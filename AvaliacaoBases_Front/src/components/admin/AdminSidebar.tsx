"use client";
import React from "react";
import {
    Box, Divider, Drawer, List, ListItemButton,
    ListItemIcon, ListItemText, Toolbar,
} from "@mui/material";
import {
    Assessment, History, Home, InsertDriveFile,
    LocalHospital, LocalShipping, Person,
} from "@mui/icons-material";
import { usePathname } from "next/navigation";

export const DRAWER_WIDTH = 280;

const menuItems = [
    { label: "Visão Geral", icon: <Home />, href: "/admin" },
    { label: "Bases", icon: <LocalHospital />, href: "/admin/bases" },
    { label: "Viaturas", icon: <LocalShipping />, href: "/admin/viaturas" },
    { label: "Indicadores", icon: <Assessment />, href: "/admin/indicadores" },
    { label: "Relatórios", icon: <InsertDriveFile />, href: "/admin/relatorios" },
    { label: "Histórico", icon: <History />, href: "/admin/historico" },
    { label: "Registrar", icon: <Person />, href: "/admin/registrar" },
];

const drawerStyles = {
    "& .MuiDrawer-paper": {
        width: DRAWER_WIDTH,
        boxSizing: "border-box",
        borderRight: 0,
        background: "#f7fbfe",
    },
};

interface Props {
    mobileOpen: boolean;
    onClose: () => void;
}

export default function AdminSidebar({ mobileOpen, onClose }: Props) {
    const pathname = usePathname();

    const content = (
        <Box sx={{ overflow: "auto", p: 2 }}>
            <List>
                {menuItems.map((item) => (
                    <ListItemButton
                        key={item.label}
                        component="a"
                        href={item.href}
                        selected={pathname === item.href}
                        onClick={onClose}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} />
                    </ListItemButton>
                ))}
            </List>
            <Divider sx={{ my: 2 }} />
        </Box>
    );

    return (
        <>
            {/* Mobile: drawer temporário */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: "block", md: "none" },
                    ...drawerStyles,
                    "& .MuiBackdrop-root": {
                        backdropFilter: "blur(2px)",
                        bgcolor: "rgba(0,0,0,0.3)",
                    },
                }}
            >
                <Toolbar />
                {content}
            </Drawer>

            {/* Desktop: drawer permanente */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: "none", md: "block" },
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    ...drawerStyles,
                }}
            >
                <Toolbar />
                {content}
            </Drawer>
        </>
    );
}