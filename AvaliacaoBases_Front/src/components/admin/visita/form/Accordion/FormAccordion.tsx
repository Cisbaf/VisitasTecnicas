import React from 'react';
import {
    Accordion, AccordionSummary, AccordionDetails,
    Typography, Box, IconButton, useMediaQuery, useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Edit as EditIcon, Delete } from '@mui/icons-material';
import { FormCategory } from '@/components/types';

interface FormAccordionProps {
    form: FormCategory;
    expanded: boolean;
    onChange: (event: React.SyntheticEvent, isExpanded: boolean) => void;
    onEdit: (form: FormCategory) => void;
    onDelete: (id: number) => void;
    children?: React.ReactNode;
}

export const FormAccordion = ({ form, expanded, onChange, onEdit, onDelete, children }: FormAccordionProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const formKey = form.id?.toString() || form.categoria;

    return (
        <Accordion expanded={expanded} onChange={onChange} elevation={2} sx={{ mt: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                    {/* Título menor no mobile para não colidir com o ícone de expand */}
                    <Typography
                        variant={isMobile ? "body1" : "h6"}
                        sx={{ fontWeight: 600, pr: 1 }}
                        noWrap={isMobile}
                    >
                        {form.categoria}
                    </Typography>
                </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: isMobile ? 1 : 2 }}>
                {/* Botões de ação menores no mobile */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, mb: 2 }}>
                    <IconButton
                        color="warning"
                        size={isMobile ? "small" : "medium"}
                        onClick={() => onEdit(form)}
                    >
                        <EditIcon fontSize={isMobile ? "small" : "medium"} />
                    </IconButton>
                    <IconButton
                        color="error"
                        size={isMobile ? "small" : "medium"}
                        onClick={() => form.id && onDelete(form.id)}
                    >
                        <Delete fontSize={isMobile ? "small" : "medium"} />
                    </IconButton>
                </Box>

                {children}
            </AccordionDetails>
        </Accordion>
    );
};