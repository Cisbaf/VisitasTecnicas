'use client';
import { useEffect, useState } from 'react';
import { AppBar, Box, Button, IconButton, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import AdminSidebar, { DRAWER_WIDTH } from '@/components/admin/AdminSidebar';

export default function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => { setMounted(true); }, []);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f8fb' }}>
            <AdminSidebar
                mobileOpen={mobileOpen}
                onClose={() => setMobileOpen(false)}
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

                    {/* Esquerda: hamburguer (mobile) ou espaço vazio (desktop) */}
                    <Box sx={{ width: 48, display: 'flex', alignItems: 'center' }}>
                        {isMobile && (
                            <IconButton
                                onClick={() => setMobileOpen(true)}
                                sx={{ color: 'white', p: 1 }}
                                aria-label="Abrir menu"
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
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
                            href="/logout"
                            sx={{
                                textTransform: 'none',
                                bgcolor: '#830101',
                                '&:hover': { bgcolor: '#5a0000' },
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
                    width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
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