// components/ChecklistsTab.tsx
import React, {useState} from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    Paper,
    Typography,
} from "@mui/material";
import {Add as AddIcon, ExpandMore as ExpandMoreIcon} from "@mui/icons-material";
import {CategoriaAgrupada} from "@/components/types";
import ChecklistModal from "./modal/ChecklistModal";

interface ChecklistsTabProps {
    categoriasAgrupadas: CategoriaAgrupada[];
    checklistLoading: boolean;
    baseId: number;
    visitaId: number;
    onChecklistAdded: () => void;
}

export default function ChecklistsTab({
                                          categoriasAgrupadas,
                                          checklistLoading,
                                          baseId,
                                          visitaId,
                                          onChecklistAdded
                                      }: ChecklistsTabProps) {
    const [modalOpen, setModalOpen] = useState(false);

    const getConformidadeColor = (percent: number) => {
        if (percent >= 80) return "success";
        if (percent >= 50) return "warning";
        return "error";
    };

    const getCriticidadeColor = (criticidade: string) => {
        switch (criticidade) {
            case "Alta":
                return "error";
            case "Média":
                return "warning";
            case "Baixa":
                return "info";
            default:
                return "default";
        }
    };

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleChecklistAdded = () => {
        onChecklistAdded();
        handleCloseModal();
    };

    return (
        <>
            <Box sx={{display: 'flex', alignItems: 'center', mb: 4}}>
                <Typography variant="h4" fontWeight="600">
                    CheckList de Inspeção
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon/>}
                    sx={{ml: 2}}
                    onClick={handleOpenModal}
                >
                    Novo Checklist
                </Button>
            </Box>

            {checklistLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress/>
                </Box>
            ) : categoriasAgrupadas.length === 0 ? (
                <Alert severity="info">Nenhum checklist encontrado para esta visita.</Alert>
            ) : (
                categoriasAgrupadas.map(categoria => (
                    <Accordion key={categoria.categoria} sx={{mb: 2}}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%',
                                alignItems: 'center'
                            }}>
                                <Typography variant="h6">
                                    {categoria.categoria}
                                </Typography>
                                <Typography variant="body2" sx={{color: 'text.secondary', mr: 2}}>
                                    Última
                                    visita: {categoria.ultimaVisita ? new Date(categoria.ultimaVisita).toLocaleDateString('pt-BR') : "—"}
                                </Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            {categoria.visitas.map(visita => (
                                <Card key={visita.visitaId} sx={{marginBottom: 2}}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom color="primary">
                                            Visita
                                            de {visita.dataVisita ? new Date(visita.dataVisita).toLocaleDateString('pt-BR') : "—"}
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {visita.descricoes.map((descricao) => (
                                                <Paper variant="outlined" sx={{p: 2}}>
                                                    <Typography variant="subtitle2" gutterBottom>
                                                        {descricao.descricao}
                                                    </Typography>
                                                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1}}>
                                                        <Chip
                                                            label={`Conformidade: ${descricao.conformidadePercent}%`}
                                                            color={getConformidadeColor(descricao.conformidadePercent)}
                                                            size="small"
                                                        />
                                                        <Chip
                                                            label={`Tipo: ${descricao.tipoConformidade}`}
                                                            variant="outlined"
                                                            size="small"
                                                        />
                                                        <Chip
                                                            label={`Criticidade: ${descricao.criticidade}`}
                                                            color={getCriticidadeColor(descricao.criticidade)}
                                                            size="small"
                                                        />
                                                    </Box>
                                                    {descricao.observacao && (
                                                        <Typography variant="body2" sx={{mt: 1}}>
                                                            <strong>Observação:</strong> {descricao.observacao}
                                                        </Typography>
                                                    )}
                                                </Paper>
                                            ))}
                                        </Grid>
                                    </CardContent>
                                </Card>
                            ))}
                        </AccordionDetails>
                    </Accordion>
                ))
            )}

            <ChecklistModal
                open={modalOpen}
                onClose={handleCloseModal}
                categorias={categoriasAgrupadas}
                baseId={baseId}
                visitaId={visitaId}
                onSave={handleChecklistAdded}
            />
        </>
    );
}