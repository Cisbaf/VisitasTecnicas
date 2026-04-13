import React, { useState } from 'react';
import {
    Accordion, AccordionSummary, AccordionDetails,
    Typography, useMediaQuery, useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Summary, FormCategory } from '@/components/types';
import { FormAccordion } from './FormAccordion';
import DynamicForm from '../../DynamicForm';

interface SummaryAccordionProps {
    summary: Summary;
    forms: FormCategory[];
    expanded: boolean;
    onChange: (event: React.SyntheticEvent, isExpanded: boolean) => void;
    onEditForm: (form: FormCategory) => void;
    onDeleteForm: (id: number) => void;
    visitaId: number;
    onFormSave: () => void;
}

export const SummaryAccordion = ({
    summary, forms, expanded, onChange,
    onEditForm, onDeleteForm, onFormSave,
}: SummaryAccordionProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [expandedForm, setExpandedForm] = useState<string | false>(false);

    const handleFormChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedForm(isExpanded ? panel : false);
    };

    if (forms.length === 0) return null;

    return (
        <Accordion expanded={expanded} onChange={onChange} elevation={1}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                {/* No mobile, empilha título e contagem */}
                <Typography
                    variant={isMobile ? "body1" : "h6"}
                    sx={{ fontWeight: 600, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}
                >
                    {summary.titulo}
                    <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: 'text.secondary' }}
                    >
                        ({forms.length} formulário{forms.length !== 1 ? 's' : ''})
                    </Typography>
                </Typography>
            </AccordionSummary>

            <AccordionDetails sx={{ p: isMobile ? 1 : 2 }}>
                {forms.map((form) => {
                    const formKey = form.id?.toString() || form.categoria;
                    return (
                        <FormAccordion
                            key={formKey}
                            form={form}
                            expanded={expandedForm === formKey}
                            onChange={handleFormChange(formKey)}
                            onEdit={onEditForm}
                            onDelete={onDeleteForm}
                        >
                            <DynamicForm form={form} onSave={onFormSave} />
                        </FormAccordion>
                    );
                })}
            </AccordionDetails>
        </Accordion>
    );
};