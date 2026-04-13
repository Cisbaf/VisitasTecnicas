"use client";
import React, { useEffect, useState } from "react";
import {
    Alert, Box, Button, Card, CardActions, CardContent,
    Chip, CircularProgress, IconButton, Paper, Typography,
    useMediaQuery, useTheme,
} from "@mui/material";
import { Grid } from "@mui/material";
import {
    Add as AddIcon, Delete as DeleteIcon, DirectionsCar as CarIcon,
    Edit as EditIcon, LocalHospital as HospitalIcon,
    People as PeopleIcon, Visibility as ViewIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { BaseRequest, BaseResponse, UserResponse, Viatura } from "../types";
import BaseDialog from "./visita/modal/BaseDialog";

interface Base extends BaseResponse {
    viaturasCount?: number;
    userCount?: number;
}

export default function AdminBasesPage() {
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [bases, setBases] = useState<Base[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingBase, setEditingBase] = useState<Base | null>(null);
    const [formData, setFormData] = useState<BaseRequest>();
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);

    async function fetchJsonSafe(url: string) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} (${url})`);
        if (res.status === 204) return null;
        const text = await res.text();
        if (!text) return null;
        try { return JSON.parse(text); } catch { return null; }
    }

    useEffect(() => {
        const init = async () => {
            try {
                const storedData = localStorage.getItem("allBasesData");
                if (storedData) {
                    try {
                        const parsedData: Base[] = JSON.parse(storedData);
                        setBases(parsedData);
                    } catch (e) {
                        localStorage.removeItem("allBasesData");
                    }
                }
                const fetchedBases = await fetchBases();
                if (!fetchedBases || fetchedBases.length === 0) return;
                await Promise.all([
                    fetchCountsForBases(fetchedBases),
                    fetchCountsForUsers(fetchedBases),
                ]);
            } catch (err) {
                console.error("Erro no init:", err);
            }
        };
        init();
    }, []);

    const fetchBases = async (): Promise<Base[]> => {
        try {
            setLoading(true);
            const data = await fetchJsonSafe("/api/base");
            const fetchedBases = Array.isArray(data) ? data : [];
            setBases(fetchedBases);
            localStorage.setItem("allBasesData", JSON.stringify(fetchedBases));
            return fetchedBases;
        } catch (err: any) {
            setError(err.message ?? String(err));
            return [];
        } finally {
            setLoading(false);
        }
    };

    const fetchCountsForBases = async (currentBases: Base[]) => {
        try {
            setError(null);
            const res = await fetch(`/api/viatura`);
            if (!res.ok || res.status === 204) throw new Error("Erro ao buscar viaturas");
            const arr: Viatura[] = await res.json().catch(() => []);
            const results = currentBases.map((base) => ({
                id: base.id,
                count: arr.filter((v) => v.idBase === base.id).length,
            }));
            setBases((prev) =>
                prev.map((base) => ({
                    ...base,
                    viaturasCount: results.find((r) => r.id === base.id)?.count ?? 0,
                }))
            );
        } catch (err: any) {
            setError(String(err?.message ?? err));
        }
    };

    const fetchCountsForUsers = async (currentBases: Base[]) => {
        try {
            setError(null);
            const res = await fetch(`/api/auth/user`);
            if (!res.ok || res.status === 204) throw new Error("Erro ao buscar usuários");
            const arr: UserResponse[] = await res.json().catch(() => []);
            const results = currentBases.map((base) => ({
                id: base.id,
                count: arr.filter((u) => u.baseId === base.id).length,
            }));
            setBases((prev) =>
                prev.map((base) => ({
                    ...base,
                    userCount: results.find((r) => r.id === base.id)?.count ?? 0,
                }))
            );
        } catch (err: any) {
            setError(String(err?.message ?? err));
        }
    };

    const handleOpenDialog = (base?: Base) => {
        if (base) {
            setEditingBase(base);
            setFormData({
                id: base.id, nome: base.nome, endereco: base.endereco,
                telefone: base.telefone, email: base.email,
                bairro: base.bairro, municipio: base.municipio,
            });
        } else {
            setEditingBase(null);
            setFormData({ id: 0, nome: "", endereco: "", telefone: "", email: "", bairro: "", municipio: "" });
        }
        setEmailError(null);
        setPhoneError(null);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => { setOpenDialog(false); setEditingBase(null); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let hasError = false;
        const phone = formData?.telefone || '';
        const email = formData?.email || '';
        const phoneRegex = /^\(?(?:[14689][1-9]|2[12478]|3[1234578]|5[1345]|7[134579])\)? ?(9\d{4}|\d{4})-?\d{4}$/;
        if (!phone || !phoneRegex.test(phone)) { setPhoneError("Formato de telefone inválido."); hasError = true; }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email || !emailRegex.test(email)) { setEmailError("Formato de email inválido."); hasError = true; }
        if (hasError) return;
        try {
            const url = editingBase ? `/api/base/${editingBase.id}` : "/api/base";
            const method = editingBase ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error("Erro ao salvar base");
            await fetchBases();
            handleCloseDialog();
        } catch (err: any) {
            setError(err.message ?? String(err));
        }
    };

    const handleDelete = async (baseId: number) => {
        if (!confirm("Tem certeza que deseja excluir esta base?")) return;
        try {
            const res = await fetch(`/api/base/${baseId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Falha ao excluir base");
            await fetchBases();
        } catch (err: any) {
            setError(err.message ?? String(err));
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const phone = e.target.value;
        setFormData({ ...formData!, telefone: phone });
        const regex = /^\(?(?:[14689][1-9]|2[12478]|3[1234578]|5[1345]|7[134579])\)? ?(9\d{4}|\d{4})-?\d{4}$/;
        setPhoneError(phone && !regex.test(phone) ? "Formato de telefone inválido." : null);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const email = e.target.value;
        setFormData({ ...formData!, email });
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        setEmailError(email && !emailRegex.test(email) ? "Formato de email inválido." : null);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: isMobile ? 1.5 : 3 }}>
            {/* Cabeçalho — empilha no mobile */}
            <Box sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between",
                alignItems: isMobile ? "flex-start" : "center",
                gap: isMobile ? 2 : 0,
                mb: 3,
            }}>
                <Typography variant={isMobile ? "h5" : "h4"} component="h1">
                    Administração de Bases
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    fullWidth={isMobile} // 👈 botão largo no mobile
                >
                    Nova Base
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: isMobile ? 1.5 : 2 }}>
                <Typography variant="h6" gutterBottom>
                    Bases Cadastradas ({bases.length})
                </Typography>

                {/* Grid corrigido com item + breakpoints responsivos */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',           // 1 coluna no mobile
                        sm: 'repeat(2, 1fr)', // 2 colunas no tablet
                        lg: 'repeat(3, 1fr)', // 3 colunas no desktop
                    },
                    gap: isMobile ? 1.5 : 2,
                }}>                    {bases.map((base) => (
                    <Card key={base.id} sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.02)', boxShadow: 3 },
                    }}>                        <Card sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.02)', boxShadow: 3 },
                    }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                    <HospitalIcon sx={{ mr: 1, color: "primary.main", flexShrink: 0 }} />
                                    <Typography variant="h6" component="h2" sx={{ wordBreak: 'break-word' }}>
                                        {base.nome}
                                    </Typography>
                                </Box>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {base.bairro} - {base.municipio}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {base.endereco}
                                </Typography>

                                {/* Chips de contato com quebra de linha */}
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                    <Chip
                                        label={base.telefone}
                                        size="small"
                                        sx={{ maxWidth: '100%' }} // 👈 não transborda
                                    />
                                    <Chip
                                        label={base.email}
                                        size="small"
                                        sx={{ maxWidth: '100%' }}
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip
                                        icon={<CarIcon />}
                                        label={base.viaturasCount === undefined ? "..." : `${base.viaturasCount} viaturas`}
                                        size="small"
                                        color={base.viaturasCount === 0 ? "default" : "primary"}
                                        variant="outlined"
                                    />
                                    <Chip
                                        icon={<PeopleIcon />}
                                        label={base.userCount === undefined ? "..." : `${base.userCount} usuários`}
                                        size="small"
                                        color={base.userCount === 0 ? "default" : "secondary"}
                                        variant="outlined"
                                    />
                                </Box>
                            </CardContent>

                            {/* Ações — botão de visitas com texto reduzido no mobile */}
                            <CardActions sx={{ justifyContent: 'space-between', px: 1 }}>
                                <Button
                                    size="small"
                                    startIcon={<ViewIcon />}
                                    onClick={() => router.push(`/admin/bases/${base.id}/visitas`)}
                                >
                                    {isMobile ? "Visitas" : "Ver Visitas"}
                                </Button>
                                <Box>
                                    <IconButton size="small" onClick={() => handleOpenDialog(base)} color="primary">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleDelete(base.id)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </CardActions>
                        </Card>
                    </Card>
                ))}
                </Box>
            </Paper>

            <BaseDialog
                open={openDialog}
                onClose={handleCloseDialog}
                onSubmit={handleSubmit}
                formData={formData!}
                setFormData={setFormData}
                editingBase={!!editingBase}
                handlePhoneChange={handlePhoneChange}
                handleEmailChange={handleEmailChange}
                phoneError={phoneError}
                emailError={emailError}
            />
        </Box>
    );
}