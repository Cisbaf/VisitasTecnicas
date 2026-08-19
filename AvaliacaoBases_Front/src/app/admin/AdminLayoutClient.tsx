'use client';
import { useEffect, useState } from 'react';
import { AppBar, Box, Button, IconButton, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import AdminSidebar, { COLLAPSED_DRAWER_WIDTH, DRAWER_WIDTH } from '@/components/admin/AdminSidebar';

export default function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });

    useEffect(() => {
        setSidebarCollapsed(localStorage.getItem('adminSidebarCollapsed') === 'true');
        setMounted(true);
    }, []);

    const toggleSidebarCollapsed = () => {
        setSidebarCollapsed((value) => {
            const next = !value;
            localStorage.setItem('adminSidebarCollapsed', String(next));
            return next;
        });
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f8fb' }}>
            <AdminSidebar
                mobileOpen={mobileOpen}
                onClose={() => setMobileOpen(false)}
                collapsed={sidebarCollapsed}
            />

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
                <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>

                    {/* Esquerda: menu */}
                    <Box sx={{ width: 48, display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            onClick={() => {
                                if (isMobile) {
                                    setMobileOpen(true);
                                    return;
                                }
                                toggleSidebarCollapsed();
                            }}
                            sx={{ color: 'white', p: 1 }}
                            aria-label={isMobile ? "Abrir menu" : sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Box>

                    {/* Centro: logo */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                        <Button
                            href="/"
                            sx={{
                                p: 0, minWidth: 0,
                                '&:hover': { transform: 'scale(1.05)', bgcolor: 'transparent' },
                                transition: 'transform 0.2s',
                            }}
                        >
                            <img src="/cisbaf.png" alt="Logo" style={{ height: 40, display: 'block' }} />
                        </Button>
                    </Box>

                    {/* Direita: botão sair */}
                    <Box sx={{ width: 48, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Button
                            variant="contained"
                            color="error"
                            href="/logout"
                            sx={{
                                boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
                                borderRadius: 5,
                                whiteSpace: 'nowrap',
                                fontSize: { xs: '0.72rem', sm: '0.875rem' },
                                px: { xs: 1.5, sm: 2 },
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
                    /* no mobile não subtrai a sidebar (ela fica por cima) */
                    width: { xs: '100%', md: `calc(100% - ${sidebarCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH}px)` },
                    maxWidth: '100vw',
                    overflowX: 'hidden',
                    boxSizing: 'border-box',
                    visibility: mounted ? 'visible' : 'hidden',
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
