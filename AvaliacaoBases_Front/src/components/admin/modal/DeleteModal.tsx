import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button
} from '@mui/material';
import { UserResponse } from '../hooks/useUserManagement';

interface DeleteModalProps {
    open: boolean;
    onClose: () => void;
    onDelete: () => void;
    user: UserResponse | null;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
    open,
    onClose,
    onDelete,
    user
}) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Tem certeza que deseja excluir o usuário <strong>{user?.user}</strong>?
                    Esta ação é irreversível.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={onDelete} color="error">Excluir</Button>
            </DialogActions>
        </Dialog>
    );
};