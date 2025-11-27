// components/admin/visita/Accordion/SummaryAccordion.tsx
import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
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
    summary,
    forms,
    expanded,
    onChange,
    onEditForm,
    onDeleteForm,
    visitaId,
    onFormSave
}: SummaryAccordionProps) => {

    // Estado para controlar a expansão individual dos formulários
    const [expandedForm, setExpandedForm] = useState<string | false>(false);

    const handleFormChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedForm(isExpanded ? panel : false);
    };

    return (
        <Accordion expanded={expanded} onChange={onChange} elevation={1}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">
                    {summary.titulo}
                    <Typography
                        component="span"
                        variant="body2"
                        sx={{ ml: 1, color: 'text.secondary' }}
                    >
                        ({forms.length} formulário{forms.length !== 1 ? 's' : ''})
                    </Typography>
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                {forms.length > 0 ? (
                    forms.map((form) => {
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
                                <DynamicForm
                                    form={form}
                                    visitaId={visitaId}
                                    onSave={onFormSave}
                                />
                            </FormAccordion>
                        );
                    })
                ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ p: 2, textAlign: 'center' }}>
                        Nenhum formulário adicionado a este sumário.
                    </Typography>
                )}
            </AccordionDetails>
        </Accordion>
    );
};