// app/gerenciamento-funcionarios/page.tsx
'use client';
import React, { useState } from 'react';
import {
    Box,
    Typography,
    Chip,
    CircularProgress,
    Alert,
    Stack,
    Button,
    TextField,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    Snackbar,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import PersonIcon from '@mui/icons-material/Person';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import BusinessIcon from '@mui/icons-material/Business';
import SearchIcon from '@mui/icons-material/Search';

import { useUserManagement } from '@/components/admin/hooks/useUserManagement';
import { AddUserModal } from '@/components/admin/modal/AddUserModal';
import { EditUserModal } from '@/components/admin/modal/EditUserModal';
import { PasswordModal } from '@/components/admin/modal/PasswordModal';
import { DeleteModal } from '@/components/admin/modal/DeleteModal';

export default function GerenciamentoFuncionarios() {
    const {
        users,
        bases,
        loading,
        error,
        searchTerm,
        currentUser,
        snackbar,
        setSearchTerm,
        setCurrentUser,
        setSnackbar,
        handleAddUser,
        handleUpdateUser,
        handleChangePassword,
        handleDeleteUser
    } = useUserManagement();

    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);


    // Handlers para abrir modais
    const handleOpenEditModal = (user: any) => {
        setCurrentUser(user);
        setEditModalOpen(true);
    };

    const handleOpenPasswordModal = (user: any) => {
        setCurrentUser(user);
        setPasswordModalOpen(true);
    };

    const handleOpenDeleteModal = (user: any) => {
        setCurrentUser(user);
        setDeleteModalOpen(true);
    };

    // Handlers para fechar modais
    const handleCloseModals = () => {
        setAddModalOpen(false);
        setEditModalOpen(false);
        setPasswordModalOpen(false);
        setDeleteModalOpen(false);
    };

    // Handler para adicionar usuário
    const onAddUser = async (userData: any) => {
        const success = await handleAddUser(userData);
        if (success) {
            handleCloseModals();
        }
    };

    // Handler para editar usuário
    const onEditUser = async (userData: any) => {
        const success = await handleUpdateUser(userData);
        if (success) {
            handleCloseModals();
        }
    };

    // Handler para alterar senha
    const onChangePassword = async (newPassword: string) => {
        const success = await handleChangePassword(newPassword);
        if (success) {
            handleCloseModals();
        }
    };

    // Handler para deletar usuário
    const onDeleteUser = async () => {
        const success = await handleDeleteUser();
        if (success) {
            handleCloseModals();
        }
    };

    // Filtra a lista de usuários com base no termo de pesquisa
    const filteredUsers = users.filter(user =>
        user.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bases.find(b => b.id === user.baseId)?.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Cálculo das estatísticas
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role.toUpperCase() === 'ADMIN').length;
    const baseCount = bases.length;

    // Renderização
    if (loading) {
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px"><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                <Typography variant="h4" fontWeight="600">
                    Gerenciamento de Funcionários
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddModalOpen(true)}>
                    Adicionar
                </Button>
            </Box>

            {/* Cards de resumo (com Stack) */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} mb={4} justifyContent="space-around">
                <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'primary.light', color: 'primary.contrastText', width: '100%' }}>
                    <PersonIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5" fontWeight="bold">{totalUsers}</Typography>
                    <Typography variant="subtitle1">Total de Funcionários</Typography>
                </Paper>
                <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'secondary.light', color: 'secondary.contrastText', width: '100%' }}>
                    <SupervisorAccountIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5" fontWeight="bold">{adminCount}</Typography>
                    <Typography variant="subtitle1">Administradores</Typography>
                </Paper>
                <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'info.light', color: 'info.contrastText', width: '100%' }}>
                    <BusinessIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5" fontWeight="bold">{baseCount}</Typography>
                    <Typography variant="subtitle1">Bases de Atendimento</Typography>
                </Paper>
            </Stack>

            {/* Barra de Pesquisa */}
            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    label="Pesquisar funcionários"
                    variant="outlined"
                    InputProps={{
                        startAdornment: (
                            <SearchIcon color="action" sx={{ mr: 1 }} />
                        ),
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Box>

            {/* Tabela de usuários */}
            {filteredUsers.length === 0 ? (
                <Alert severity="info">Nenhum funcionário encontrado com o termo de pesquisa "{searchTerm}".</Alert>
            ) : (
                <TableContainer component={Paper} elevation={3}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ bgcolor: 'grey.200' }}>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Username</TableCell>
                                <TableCell>Cargo</TableCell>
                                <TableCell>Base de Atendimento</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell>{user.user}</TableCell>
                                    <TableCell><Chip label={user.role} color="primary" size="small" /></TableCell>
                                    <TableCell>{bases.find(b => b.id === user.baseId)?.nome || 'Administração'}</TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => handleOpenEditModal(user)}>
                                                Editar
                                            </Button>
                                            <Button size="small" variant="outlined" color="secondary" startIcon={<VpnKeyIcon />} onClick={() => handleOpenPasswordModal(user)}>
                                                Senha
                                            </Button>
                                            <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => handleOpenDeleteModal(user)}>
                                                Excluir
                                            </Button>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Modais */}
            <AddUserModal
                open={isAddModalOpen}
                onClose={handleCloseModals}
                onAdd={onAddUser}
                bases={bases}
            />

            <EditUserModal
                open={isEditModalOpen}
                onClose={handleCloseModals}
                onSave={onEditUser}
                user={currentUser}
                bases={bases}
            />

            <PasswordModal
                open={isPasswordModalOpen}
                onClose={handleCloseModals}
                onChangePassword={onChangePassword}
                user={currentUser}
            />

            <DeleteModal
                open={isDeleteModalOpen}
                onClose={handleCloseModals}
                onDelete={onDeleteUser}
                user={currentUser}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}