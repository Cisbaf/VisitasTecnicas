import React, { useState } from 'react';
import {
    Accordion, AccordionSummary, AccordionDetails,
    Box, Chip, Stack, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
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
        <Accordion
            expanded={expanded}
            onChange={onChange}
            disableGutters
            elevation={0}
            sx={{
                border: '1px solid',
                borderColor: expanded ? 'primary.main' : 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                '&:before': { display: 'none' },
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                    px: isMobile ? 1.5 : 2,
                    py: 1,
                    bgcolor: expanded ? 'action.selected' : 'background.paper',
                    '&:hover': { bgcolor: 'action.hover' },
                    '& .MuiAccordionSummary-content': { my: 1 },
                }}
            >
                <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ width: '100%', pr: 2, minWidth: 0 }}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                        <Box
                            sx={{
                                width: 34,
                                height: 34,
                                borderRadius: 1,
                                bgcolor: 'action.selected',
                                color: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flex: '0 0 34px',
                            }}
                        >
                            <PlaylistAddCheckIcon fontSize="small" />
                        </Box>
                        <Typography
                            variant={isMobile ? "body1" : "h6"}
                            sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}
                        >
                            {summary.titulo}
                        </Typography>
                    </Stack>
                    <Chip
                        size="small"
                        label={`${forms.length} formulário${forms.length !== 1 ? 's' : ''}`}
                        color={expanded ? 'primary' : 'default'}
                        sx={{ flex: '0 0 auto' }}
                    />
                </Stack>
            </AccordionSummary>

            <AccordionDetails sx={{ p: isMobile ? 1 : 2, bgcolor: 'grey.50' }}>
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
