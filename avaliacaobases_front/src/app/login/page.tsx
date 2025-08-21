'use client';
import { Box, Typography, TextField, Button, Paper, Checkbox, FormControlLabel, Link } from '@mui/material';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/user/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ user, password }),
            });
            if (!res.ok) {
                const j = await res.json().catch(() => null);
                setError(j?.error || 'Erro no login');
                return;
            }
            router.push('/');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>

            <Box sx={{
                flex: 1,
                background: 'linear-gradient(135deg,#D71920,#F28C28)',
                color: 'white',
                px: 8,
                py: 6,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',

            }}>
                <Typography variant="h3" fontWeight="bold">
                    Bases Samu Baixada
                </Typography>
                <Typography variant="h6" mt={2}>
                    Sistema de Gerenciamento de Bases Samu da Baixada Fluminese.
                </Typography>
            </Box>

            <Paper
                elevation={3}
                sx={{
                    flex: 1,
                    borderTopRightRadius: 20,
                    borderBottomRightRadius: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
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

                        {error && <Typography color="error" mb={2}>Usuario ou senha não encontrados</Typography>}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                borderRadius: '30px',
                                py: 1.5,
                                fontWeight: 'bold',
                                background: '#D71920',        // vermelho samu
                                '&:hover': { background: 'linear-gradient(135deg,#D71920,#F28C28)' }
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
