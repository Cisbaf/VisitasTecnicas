// components/ChecklistModal.tsx
import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface ChecklistModalProps {
    open: boolean;
    onClose: () => void;
    baseId: number;
    visitaId: number;
    onSave: () => void;
}

interface Categoria {
    id: number;
    categoria: string;
}

interface DescricaoChecklist {
    descricao: string;
    conformidadePercent: number;
    observacao: string;
    tipoConformidade: string;
    criticidade: string;
    visitaId?: number;
    checklistId?: number;
}

export default function ChecklistModal({ open, onClose, visitaId, onSave }: ChecklistModalProps) {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('');
    const [novaCategoria, setNovaCategoria] = useState<string>('');
    const [editandoCategoria, setEditandoCategoria] = useState<boolean>(false);
    const [nomeEditado, setNomeEditado] = useState<string>('');
    const [descricoes, setDescricoes] = useState<DescricaoChecklist[]>([
        { descricao: '', conformidadePercent: 100, observacao: '', tipoConformidade: 'CONFORME', criticidade: 'BAIXA' }
    ]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchCategorias();
            // Reset form when modal opens
            setCategoriaSelecionada('');
            setNovaCategoria('');
            setEditandoCategoria(false);
            setNomeEditado('');
            setDescricoes([{
                descricao: '',
                conformidadePercent: 100,
                observacao: '',
                tipoConformidade: 'CONFORME',
                criticidade: 'BAIXA'
            }]);
        }
    }, [open]);

    const fetchCategorias = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/checklist');
            if (res.ok) {
                const data = await res.json();
                setCategorias(data);
            }
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddDescricao = () => {
        setDescricoes([...descricoes, {
            descricao: '',
            conformidadePercent: 100,
            observacao: '',
            tipoConformidade: 'CONFORME',
            criticidade: 'BAIXA'
        }]);
    };

    const handleRemoveDescricao = (index: number) => {
        if (descricoes.length > 1) {
            setDescricoes(descricoes.filter((_, i) => i !== index));
        }
    };

    const handleDescricaoChange = (index: number, field: keyof DescricaoChecklist, value: string | number) => {
        const newDescricoes = [...descricoes];
        newDescricoes[index] = { ...newDescricoes[index], [field]: value };
        setDescricoes(newDescricoes);
    };

    const handleEditarCategoria = () => {
        if (categoriaSelecionada && categoriaSelecionada !== 'new') {
            setEditandoCategoria(true);
            setNomeEditado(categoriaSelecionada);
        }
    };

    const handleSalvarEdicaoCategoria = async () => {
        try {
            const categoriaExistente = categorias.find(cat => cat.categoria === categoriaSelecionada);
            if (!categoriaExistente) return;

            const res = await fetch(`/api/checklist/${categoriaExistente.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categoria: nomeEditado }),
            });

            if (res.ok) {
                setCategoriaSelecionada(nomeEditado);
                setEditandoCategoria(false);
                fetchCategorias(); // Recarregar a lista de categorias
            } else {
                throw new Error('Erro ao editar categoria');
            }
        } catch (error) {
            console.error('Erro ao editar categoria:', error);
            alert('Erro ao editar categoria. Verifique o console para mais detalhes.');
        }
    };

    const handleExcluirCategoria = async () => {
        if (categoriaSelecionada && categoriaSelecionada !== 'new') {
            if (!confirm(`Tem certeza que deseja excluir a categoria "${categoriaSelecionada}"?`)) return;

            try {
                const categoriaExistente = categorias.find(cat => cat.categoria === categoriaSelecionada);
                if (!categoriaExistente) return;

                const res = await fetch(`/api/checklist/${categoriaExistente.id}`, {
                    method: 'DELETE',
                });

                if (res.ok) {
                    setCategoriaSelecionada('');
                    fetchCategorias(); // Recarregar a lista de categorias
                } else {
                    throw new Error('Erro ao excluir categoria');
                }
            } catch (error) {
                console.error('Erro ao excluir categoria:', error);
                alert('Erro ao excluir categoria. Verifique o console para mais detalhes.');
            }
        }
    };

    const handleSubmit = async () => {
        try {
            // Determine the category to use
            const categoriaFinal = categoriaSelecionada === 'new' ? novaCategoria : categoriaSelecionada;
            let checklistId;

            if (categoriaSelecionada === 'new') {
                // Create new checklist
                const checklistRes = await fetch('/api/checklist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        categoria: categoriaFinal
                    }),
                });

                if (!checklistRes.ok) throw new Error('Erro ao criar checklist');
                const checklistData = await checklistRes.json();
                checklistId = checklistData.id;
            } else {
                // Use existing checklist
                const categoriaExistente = categorias.find(cat => cat.categoria === categoriaSelecionada);
                if (!categoriaExistente) throw new Error('Categoria não encontrada');
                checklistId = categoriaExistente.id;
            }

            // Then, add descriptions to the checklist
            for (const descricao of descricoes) {
                if (!descricao.descricao) continue;

                const descricaoRes = await fetch(`/api/checklist/description/${checklistId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...descricao,
                        visitaId,
                    }),
                });

                if (!descricaoRes.ok) throw new Error('Erro ao adicionar descrição');
                console.log('Descrição adicionada com sucesso', descricao);
            }

            onSave();
            onClose();
        } catch (error) {
            console.error('Erro ao salvar checklist:', error);
            alert('Erro ao salvar checklist. Verifique o console para mais detalhes.');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Adicionar Novo Checklist</Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box display="flex" alignItems="flex-end" gap={1}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Categoria</InputLabel>
                        <Select
                            value={categoriaSelecionada}
                            onChange={(e) => {
                                setCategoriaSelecionada(e.target.value as string);
                                setEditandoCategoria(false);
                            }}
                            label="Categoria"
                            disabled={loading || editandoCategoria}
                        >
                            <MenuItem value="new">Nova Categoria</MenuItem>
                            {categorias.map((categoria) => (
                                <MenuItem key={categoria.id} value={categoria.categoria}>
                                    {categoria.categoria}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {categoriaSelecionada && categoriaSelecionada !== 'new' && (
                        <Box display="flex" gap={0.5} mb={1}>
                            <IconButton
                                size="small"
                                onClick={handleEditarCategoria}
                                disabled={editandoCategoria}
                            >
                                <EditIcon />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={handleExcluirCategoria}
                                color="error"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    )}
                </Box>

                {editandoCategoria && (
                    <Box display="flex" alignItems="flex-end" gap={1} mt={1}>
                        <TextField
                            fullWidth
                            label="Novo nome da categoria"
                            value={nomeEditado}
                            onChange={(e) => setNomeEditado(e.target.value)}
                        />
                        <Button
                            variant="contained"
                            onClick={handleSalvarEdicaoCategoria}
                            sx={{ mb: 1 }}
                        >
                            Salvar
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => setEditandoCategoria(false)}
                            sx={{ mb: 1 }}
                        >
                            Cancelar
                        </Button>
                    </Box>
                )}

                {categoriaSelecionada === 'new' && (
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Nova Categoria"
                        value={novaCategoria}
                        onChange={(e) => setNovaCategoria(e.target.value)}
                    />
                )}

                <Box mt={3}>
                    <Typography variant="h6" gutterBottom>
                        Descrições
                    </Typography>
                    {descricoes.map((descricao, index) => (
                        <Box key={index} mb={2} p={2} border={1} borderColor="grey.300" borderRadius={1}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="subtitle2">Descrição #{index + 1}</Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => handleRemoveDescricao(index)}
                                    disabled={descricoes.length === 1}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>

                            <TextField
                                fullWidth
                                margin="normal"
                                label="Descrição"
                                value={descricao.descricao}
                                onChange={(e) => handleDescricaoChange(index, 'descricao', e.target.value)}
                                required
                            />

                            <FormControl fullWidth margin="normal">
                                <InputLabel>Tipo de Conformidade</InputLabel>
                                <Select
                                    value={descricao.tipoConformidade}
                                    onChange={(e) => handleDescricaoChange(index, 'tipoConformidade', e.target.value as string)}
                                    label="Tipo de Conformidade"
                                >
                                    <MenuItem value="CONFORME">Conforme</MenuItem>
                                    <MenuItem value="PARCIAL">Parcial</MenuItem>
                                    <MenuItem value="NAO_CONFORME">Não Conforme</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth margin="normal">
                                <InputLabel>Criticidade</InputLabel>
                                <Select
                                    value={descricao.criticidade}
                                    onChange={(e) => handleDescricaoChange(index, 'criticidade', e.target.value as string)}
                                    label="Criticidade"
                                >
                                    <MenuItem value="ALTA">Alta</MenuItem>
                                    <MenuItem value="MEDIA">Média</MenuItem>
                                    <MenuItem value="BAIXA">Baixa</MenuItem>
                                    <MenuItem value="NENHUMA">Nenhuma</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                margin="normal"
                                type="number"
                                label="Percentual de Conformidade"
                                value={descricao.conformidadePercent}
                                onChange={(e) => handleDescricaoChange(index, 'conformidadePercent', Number(e.target.value))}
                                inputProps={{ min: 0, max: 100 }}
                            />

                            <TextField
                                fullWidth
                                margin="normal"
                                multiline
                                rows={2}
                                label="Observação"
                                value={descricao.observacao}
                                onChange={(e) => handleDescricaoChange(index, 'observacao', e.target.value)}
                            />
                        </Box>
                    ))}

                    <Button
                        startIcon={<AddIcon />}
                        onClick={handleAddDescricao}
                        variant="outlined"
                    >
                        Adicionar Descrição
                    </Button>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    Salvar Checklist
                </Button>
            </DialogActions>
        </Dialog>
    );
}