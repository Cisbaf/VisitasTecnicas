// components/AddUserModal.tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Base, UserRequest } from '../hooks/useUserManagement';
import { useState } from 'react';

interface AddUserModalProps {
    open: boolean;
    onClose: () => void;
    onAdd: (user: UserRequest) => void;
    bases: Base[];
}

export const AddUserModal = ({ open, onClose, onAdd, bases }: AddUserModalProps) => {
    const [formData, setFormData] = useState<Partial<UserRequest>>({});

    const handleSubmit = () => {
        if (formData.user && formData.password && formData.role) {
            onAdd(formData as UserRequest);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Adicionar Novo Funcionário</DialogTitle>
            <DialogContent>
                <TextField margin="dense" name="user" label="Username" fullWidth variant="standard"
                    onChange={(e) => setFormData(prev => ({ ...prev, user: e.target.value }))} />
                <TextField margin="dense" name="password" label="Senha" type="password" fullWidth variant="standard"
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} />
                <FormControl fullWidth margin="dense" variant="standard">
                    <InputLabel>Cargo</InputLabel>
                    <Select name="role" value={formData.role || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}>
                        <MenuItem value="ADMIN">ADMIN</MenuItem>
                        <MenuItem value="FUNCIONARIO">FUNCIONARIO</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="dense" variant="standard">
                    <InputLabel>Base</InputLabel>
                    <Select name="baseId" value={formData.baseId || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, baseId: e.target.value }))}>
                        {bases.map((base) => (
                            <MenuItem key={base.id} value={base.id}>{base.nome}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSubmit}>Salvar</Button>
            </DialogActions>
        </Dialog>
    );
};