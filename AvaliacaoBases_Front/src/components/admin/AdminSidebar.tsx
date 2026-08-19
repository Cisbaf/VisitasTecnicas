"use client";
import React from "react";
import {
    Box, Divider, Drawer, List, ListItemButton,
    ListItemIcon, ListItemText, Toolbar, Tooltip,
} from "@mui/material";
import {
    Assessment, History, Home, InsertDriveFile,
    LocalHospital, LocalShipping, Person,
} from "@mui/icons-material";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const DRAWER_WIDTH = 280;
export const COLLAPSED_DRAWER_WIDTH = 76;

const menuItems = [
    { label: "Visão Geral", icon: <Home />, href: "/admin" },
    { label: "Bases", icon: <LocalHospital />, href: "/admin/bases" },
    { label: "Viaturas", icon: <LocalShipping />, href: "/admin/viaturas" },
    { label: "Indicadores", icon: <Assessment />, href: "/admin/indicadores" },
    { label: "Relatórios", icon: <InsertDriveFile />, href: "/admin/relatorios" },
    { label: "Histórico", icon: <History />, href: "/admin/historico" },
    { label: "Registrar", icon: <Person />, href: "/admin/registrar" },
];

const drawerStyles = (width: number) => ({
    "& .MuiDrawer-paper": {
        width,
        boxSizing: "border-box",
        borderRight: 0,
        background: "#f7fbfe",
        overflowX: "hidden",
        transition: "width 0.2s ease",
    },
});

interface Props {
    mobileOpen: boolean;
    onClose: () => void;
    collapsed?: boolean;
}

export default function AdminSidebar({ mobileOpen, onClose, collapsed = false }: Props) {
    const pathname = usePathname();

    const content = (compact = false) => (
        <Box sx={{ overflow: "auto", px: compact ? 1 : 2, py: 2 }}>
            <List>
                {menuItems.map((item) => (
                    <Tooltip key={item.label} title={compact ? item.label : ""} placement="right">
                        <ListItemButton
                            component={Link}
                            href={item.href}
                            selected={pathname === item.href}
                            onClick={onClose}
                            sx={{
                                minHeight: 46,
                                justifyContent: compact ? "center" : "flex-start",
                                px: compact ? 1 : 2,
                                borderRadius: 2,
                                mb: 0.5,
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: compact ? 0 : 40, justifyContent: "center" }}>{item.icon}</ListItemIcon>
                            {!compact && <ListItemText primary={item.label} />}
                        </ListItemButton>
                    </Tooltip>
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
                    ...drawerStyles(DRAWER_WIDTH),
                    "& .MuiBackdrop-root": {
                        backdropFilter: "blur(2px)",
                        bgcolor: "rgba(0,0,0,0.3)",
                    },
                }}
            >
                <Toolbar />
                {content(false)}
            </Drawer>

            {/* Desktop: drawer permanente */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: "none", md: "block" },
                    width: collapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH,
                    flexShrink: 0,
                    transition: "width 0.2s ease",
                    ...drawerStyles(collapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH),
                }}
            >
                <Toolbar />
                {content(collapsed)}
            </Drawer>
        </>
    );
}
