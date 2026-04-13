'use client';
import {
    Box,
    Button,
    Paper,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginForm() {
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); // breakpoint 900px

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user, password }),
            });

            if (!res.ok) {
                const j = await res.json().catch(() => null);
                setError(j?.message || 'Erro no login');
                return;
            }

            router.push('/');
        } catch (err) {
            setError('Erro de conexão com o proxy');
        } finally {
            setLoading(false);
        }
    }

    // Versão desktop: duas colunas
    if (!isMobile) {
        return (
            <Box sx={{ display: 'flex', height: '100vh' }}>
                {/* Lado gradiente */}
                <Box
                    sx={{
                        flex: 1,
                        background: 'linear-gradient(135deg,#D71920,#F28C28)',
                        color: 'white',
                        px: 8,
                        py: 6,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                    }}
                >
                    <Typography variant="h3" fontWeight="bold">
                        Bases Samu Baixada
                    </Typography>
                    <Typography variant="h6" mt={2}>
                        Sistema de Gerenciamento de Bases Samu da Baixada Fluminense.
                    </Typography>
                </Box>

                {/* Lado formulário */}
                <Paper
                    elevation={3}
                    sx={{
                        flex: 1,
                        borderTopRightRadius: 20,
                        borderBottomRightRadius: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Box sx={{ width: 350 }}>
                        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={4}>
                            Login
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Usuário"
                                value={user}
                                onChange={(e) => setUser(e.target.value)}
                                sx={{ mb: 3, bgcolor: '#fafafa', borderRadius: '30px' }}
                                InputProps={{ sx: { pl: 2, borderRadius: '30px' } }}
                            />
                            <TextField
                                fullWidth
                                variant="outlined"
                                type="password"
                                placeholder="Senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                sx={{ mb: 1, bgcolor: '#fafafa', borderRadius: '30px' }}
                                InputProps={{ sx: { pl: 2, borderRadius: '30px' } }}
                            />
                            {error && (
                                <Typography color="error" mb={2}>
                                    Usuário ou senha não encontrados
                                </Typography>
                            )}
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    bgcolor: '#cd9805',
                                    borderRadius: '30px',
                                    py: 1.5,
                                    fontWeight: 'bold',
                                    background: '#D71920',
                                    '&:hover': { background: 'linear-gradient(135deg,#D71920,#F28C28)' },
                                }}
                            >
                                {loading ? 'Entrando...' : 'Entrar'}
                            </Button>
                        </form>
                    </Box>
                </Paper>
            </Box>
        );
    }

    // Versão mobile: fundo gradiente e card centralizado
    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg,#D71920,#F28C28)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    width: '100%',
                    maxWidth: 400,
                    borderRadius: 4,
                    overflow: 'hidden',
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                }}
            >
                <Box sx={{ p: 4 }}>
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        textAlign="center"
                        mb={1}
                    >
                        Login
                    </Typography>
                    <Typography
                        variant="body2"
                        textAlign="center"
                        color="text.secondary"
                        mb={4}
                    >
                        Sistema de Gerenciamento de Bases Samu da Baixada Fluminense.
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Usuário"
                            value={user}
                            onChange={(e) => setUser(e.target.value)}
                            sx={{ mb: 3 }}
                            InputProps={{ sx: { borderRadius: 3 } }}
                        />
                        <TextField
                            fullWidth
                            variant="outlined"
                            type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{ mb: 2 }}
                            InputProps={{ sx: { borderRadius: 3 } }}
                        />
                        {error && (
                            <Typography color="error" mb={2} textAlign="center">
                                Usuário ou senha não encontrados
                            </Typography>
                        )}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                borderRadius: 3,
                                py: 1.5,
                                fontWeight: 'bold',
                                background: '#D71920',
                                '&:hover': { background: '#b3131a' },
                                textTransform: 'none',
                                fontSize: '1rem',
                            }}
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </Button>
                    </form>
                </Box>
            </Paper>
        </Box>
    );
}