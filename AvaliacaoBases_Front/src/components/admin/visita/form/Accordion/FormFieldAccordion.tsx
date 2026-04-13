// components/FormFieldAccordion.tsx
import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Edit as EditIcon, Delete } from '@mui/icons-material';
import { FormField } from '@/components/types';

interface FormFieldAccordionProps {
    field: FormField;
    onEdit: (field: FormField) => void;
    onDelete: (id: number) => void;
}

export const FormFieldAccordion = ({ field, onEdit, onDelete }: FormFieldAccordionProps) => {
    const getTipoColor = (tipo: string) => {
        switch (tipo) {
            case 'TEXTO': return 'primary';
            case 'CHECKBOX': return 'secondary';
            case 'SELECT': return 'success';
            default: return 'default';
        }
    };

    return (
        <Accordion elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="subtitle1">{field.titulo}</Typography>
                        <Typography
                            variant="caption"
                            color={getTipoColor(field.tipo)}
                            sx={{
                                px: 1,
                                py: 0.5,
                                bgcolor: `${getTipoColor(field.tipo)}.light`,
                                borderRadius: 1
                            }}
                        >
                            {field.tipo}
                        </Typography>
                    </Box>
                    <Box>
                        <IconButton
                            size="small"
                            color="warning"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(field);
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                                e.stopPropagation();
                                field.id && onDelete(field.id);
                            }}
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
            </AccordionSummary>
            <AccordionDetails>
                <Box sx={{ p: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        <strong>ID:</strong> {field.id || 'Não salvo'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Tipo:</strong> {field.tipo}
                    </Typography>
                    {field.formId && (
                        <Typography variant="body2" color="text.secondary">
                            <strong>Form ID:</strong> {field.formId}
                        </Typography>
                    )}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};