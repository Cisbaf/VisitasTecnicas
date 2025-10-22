'use client';
import { useEffect, useState } from 'react';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import AdminSidebar from '@/components/admin/AdminSidebar';


export default function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const drawerWidth = 280;


    // Mantemos o mesmo DOM sempre — apenas alternamos visibilidade após o mount
    useEffect(() => {
        setMounted(true);
    }, []);


    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f8fb' }}>
            <AdminSidebar />


            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    bgcolor: '#342b27',
                    color: 'white',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    borderRadius: 10,
                    boxShadow: '0 5px 4px rgba(0, 0, 0, 0.3)',
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                            Administração - Sistema SAMU
                        </Typography>
                    </Box>
                    <Box>
                        <Button
                            variant="contained"
                            href="/logout"
                            sx={{
                                textTransform: 'none',
                                bgcolor: '#5a3d30',
                                '&:hover': { bgcolor: '#3e281e' },
                                boxShadow: '0 3px 5px rgba(0, 0, 0, 0.2)',
                                borderRadius: 5,
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
                    mt: 10,
                    width: `calc(100% - ${drawerWidth}px)`,
                    // esconde visualmente até o useEffect rodar para evitar flashes
                    visibility: mounted ? 'visible' : 'hidden',
                }}
            >
                {children}
            </Box>
        </Box>
    );
}