import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, IconButton } from '@mui/material';
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
    const formKey = form.id?.toString() || form.categoria;

    return (
        <Accordion key={formKey} expanded={expanded} onChange={onChange} elevation={2} sx={{ mt: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                    <Typography variant="h6">{form.categoria}</Typography>
                </Box>
            </AccordionSummary>
            <AccordionDetails>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2 }}>
                    <IconButton color="warning" onClick={() => onEdit(form)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => form.id && onDelete(form.id)}>
                        <Delete />
                    </IconButton>
                </Box>



                {children}
            </AccordionDetails>
        </Accordion>
    );
};