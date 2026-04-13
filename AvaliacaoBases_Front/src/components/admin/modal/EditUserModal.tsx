import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { Base, UserResponse } from '../hooks/useUserManagement';

interface EditUserModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (userData: Partial<UserResponse>) => void;
    user: UserResponse | null;
    bases: Base[];
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
    open,
    onClose,
    onSave,
    user,
    bases
}) => {
    const [formData, setFormData] = useState<Partial<UserResponse>>({
        role: '',
        baseId: null
    });

    useEffect(() => {
        if (user) {
            setFormData({
                role: user.role,
                baseId: user.baseId,
                password: user.password
            });
        }
    }, [user]);

    const handleSubmit = () => {
        if (formData.role) {
            onSave(formData);
        }
    };

    const handleSelectChange = (event: any) => {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value === '' ? null : value
        }));
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Editar Funcionário</DialogTitle>
            <DialogContent>
                <TextField
                    margin="dense"
                    label="Username"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={user?.user || ''}
                    disabled
                />
                <FormControl fullWidth margin="dense" variant="standard">
                    <InputLabel id="edit-role-label">Cargo</InputLabel>
                    <Select
                        labelId="edit-role-label"
                        name="role"
                        value={formData.role || ''}
                        onChange={handleSelectChange}
                        label="Cargo"
                    >
                        <MenuItem value="ADMIN">ADMIN</MenuItem>
                        <MenuItem value="FUNCIONARIO">FUNCIONARIO</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="dense" variant="standard">
                    <InputLabel id="edit-base-label">Base</InputLabel>
                    <Select
                        labelId="edit-base-label"
                        name="baseId"
                        value={formData.baseId || ''}
                        onChange={handleSelectChange}
                        label="Base"
                    >
                        <MenuItem value="">
                            <em>Nenhuma</em>
                        </MenuItem>
                        {bases.map((base) => (
                            <MenuItem key={base.id} value={base.id}>
                                {base.nome}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSubmit}>Salvar Alterações</Button>
            </DialogActions>
        </Dialog>
    );
};