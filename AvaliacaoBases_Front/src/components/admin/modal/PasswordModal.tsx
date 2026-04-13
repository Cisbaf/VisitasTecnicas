import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    TextField
} from '@mui/material';
import { UserResponse } from '../hooks/useUserManagement';

interface PasswordModalProps {
    open: boolean;
    onClose: () => void;
    onChangePassword: (newPassword: string) => void;
    user: UserResponse | null;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
    open,
    onClose,
    onChangePassword,
    user
}) => {
    const [newPassword, setNewPassword] = useState('');

    const handleSubmit = () => {
        if (newPassword) {
            onChangePassword(newPassword);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Alterar Senha de {user?.user}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Digite a nova senha para o usuário. Esta ação não pode ser desfeita.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Nova Senha"
                    type="password"
                    fullWidth
                    variant="standard"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSubmit} color="primary">Confirmar</Button>
            </DialogActions>
        </Dialog>
    );
};