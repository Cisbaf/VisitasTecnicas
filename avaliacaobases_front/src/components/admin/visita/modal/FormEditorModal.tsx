// components/admin/visita/FormEditorModal.tsx
"use client";
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    IconButton,
    Box,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    List,
    ListItem,
    ListItemText,
    Chip,
    Divider,
    Alert,
    Typography
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import { FormField, FormCategory } from '@/components/types';

interface FormEditorModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (formData: { id?: number; categoria: string; campos: FormField[]; tipoForm: string }) => void;
    initialData?: FormCategory;
    tipoForm: string;
}

export default function FormEditorModal({ open, onClose, onSave, initialData, tipoForm }: FormEditorModalProps) {
    const [id, setId] = useState(initialData?.id || undefined);
    const [categoria, setCategoria] = useState(initialData?.categoria || '');
    const [campos, setCampos] = useState<FormField[]>(initialData?.campos || []);
    const [novoCampo, setNovoCampo] = useState<FormField>({
        titulo: '',
        tipo: tipoForm === 'PADRONIZACAO' ? 'SELECT' : 'CHECKBOX'
    });
    const [editandoCampoIndex, setEditandoCampoIndex] = useState<number | null>(null);
    const [erro, setErro] = useState('');

    useEffect(() => {
        if (open) {
            setId(initialData?.id || undefined);
            setCategoria(initialData?.categoria || '');
            setCampos(initialData?.campos || []);
            setNovoCampo({
                titulo: '',
                tipo: tipoForm === 'PADRONIZACAO' ? 'SELECT' : 'CHECKBOX'
            });
            setEditandoCampoIndex(null);
            setErro('');
        }
    }, [open, initialData, tipoForm]);

    const handleAddCampo = () => {
        if (!novoCampo.titulo.trim()) {
            setErro('O título do campo é obrigatório');
            return;
        }

        setErro('');
        if (editandoCampoIndex !== null) {
            const novosCampos = [...campos];
            novosCampos[editandoCampoIndex] = { ...novoCampo };
            setCampos(novosCampos);
            setEditandoCampoIndex(null);
        } else {
            setCampos([...campos, { ...novoCampo }]);
        }
        setNovoCampo({
            titulo: '',
            tipo: tipoForm === 'PADRONIZACAO' ? 'SELECT' : 'CHECKBOX'
        });
    };

    const handleEditCampo = (index: number) => {
        const campo = campos[index];
        setNovoCampo({ ...campo });
        setEditandoCampoIndex(index);
    };

    const handleDeleteCampo = (index: number) => {
        setCampos(campos.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoria.trim()) {
            setErro('O nome da categoria é obrigatório');
            return;
        }
        if (campos.length === 0) {
            setErro('Adicione pelo menos um campo ao formulário');
            return;
        }

        setErro('');
        onSave({ id, categoria, campos, tipoForm });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EditIcon />
                    {initialData ? 'Editar Formulário' : 'Criar Novo Formulário'}
                </DialogTitle>
                <DialogContent>
                    {erro && <Alert severity="error" sx={{ mt: 2 }}>{erro}</Alert>}

                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nome do Formulário"
                        fullWidth
                        variant="outlined"
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                        required
                        sx={{ mt: 2 }}
                    />

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" component="h2">
                            Campos do Formulário
                        </Typography>
                        <Chip
                            label={`${campos.length} campo(s)`}
                            size="small"
                            color="primary"
                            sx={{ ml: 2 }}
                        />
                    </Box>

                    <Box sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 2,
                        backgroundColor: 'grey.50'
                    }}>
                        <Typography variant="subtitle2" gutterBottom>
                            {editandoCampoIndex !== null ? 'Editar Campo' : 'Adicionar Novo Campo'}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'start', flexWrap: 'wrap' }}>
                            <TextField
                                placeholder="Título do campo"
                                size="small"
                                value={novoCampo.titulo}
                                onChange={(e) => setNovoCampo({ ...novoCampo, titulo: e.target.value })}
                                sx={{ flexGrow: 1 }}
                            />

                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Tipo</InputLabel>
                                <Select
                                    value={novoCampo.tipo}
                                    label="Tipo"
                                    onChange={(e) => setNovoCampo({
                                        ...novoCampo,
                                        tipo: e.target.value as 'CHECKBOX' | 'TEXTO' | 'SELECT'
                                    })}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: { zIndex: 1301 },
                                        },
                                    }}
                                >
                                    {tipoForm === 'PADRONIZACAO' && (
                                        <MenuItem value="SELECT">Select</MenuItem>

                                    )}
                                    {tipoForm !== 'PADRONIZACAO' && (
                                        <MenuItem value="CHECKBOX">Checkbox</MenuItem>

                                    )}
                                    {tipoForm !== 'PADRONIZACAO' && (
                                        <MenuItem value="TEXTO">Texto</MenuItem>

                                    )}


                                </Select>
                            </FormControl>

                            <Button
                                variant="contained"
                                onClick={handleAddCampo}
                                startIcon={<AddIcon />}
                            >
                                {editandoCampoIndex !== null ? 'Atualizar' : 'Adicionar'}
                            </Button>
                        </Box>
                    </Box>

                    {campos.length > 0 ? (
                        <List sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            {campos.map((campo, index) => (
                                <ListItem key={index} divider={index < campos.length - 1}>
                                    <ListItemText
                                        sx={{ width: 200 }}
                                        primary={campo.titulo}
                                        secondary={
                                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                                <Chip
                                                    label={campo.tipo}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Box>
                                        }
                                        secondaryTypographyProps={{ component: 'div' }}
                                    />
                                    <ListItem secondaryAction sx={{ justifyContent: 'flex-end' }}>
                                        <IconButton
                                            onClick={() => handleEditCampo(index)}
                                            sx={{ mr: 1 }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteCampo(index)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItem>
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            Nenhum campo adicionado ainda. Adicione pelo menos um campo ao formulário.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={campos.length === 0 || !categoria.trim()}
                    >
                        Salvar Formulário
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}