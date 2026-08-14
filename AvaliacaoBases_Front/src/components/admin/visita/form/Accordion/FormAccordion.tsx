import React from 'react';
import {
    Accordion, AccordionSummary, AccordionDetails,
    Typography, Box, Chip, IconButton, Stack, Tooltip, useMediaQuery, useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Delete, Edit as EditIcon } from '@mui/icons-material';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
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

    return (
        <Accordion
            expanded={expanded}
            onChange={onChange}
            disableGutters
            elevation={0}
            sx={{
                mt: 1,
                border: '1px solid',
                borderColor: expanded ? 'primary.main' : 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                bgcolor: 'background.paper',
                '&:before': { display: 'none' },
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                    px: isMobile ? 1.5 : 2,
                    py: 0.75,
                    '&:hover': { bgcolor: 'action.hover' },
                    '& .MuiAccordionSummary-content': { my: 1 },
                }}
            >
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                    sx={{ width: '100%', pr: 2, minWidth: 0 }}
                >
                    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                        <Box
                            sx={{
                                width: 30,
                                height: 30,
                                borderRadius: 1,
                                bgcolor: expanded ? 'action.selected' : 'grey.100',
                                color: expanded ? 'primary.main' : 'text.secondary',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flex: '0 0 30px',
                            }}
                        >
                            <AssignmentOutlinedIcon fontSize="small" />
                        </Box>
                        <Typography
                            variant={isMobile ? "body1" : "subtitle1"}
                            sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}
                        >
                            {form.categoria}
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Chip size="small" label={`${form.campos?.length ?? 0} campo${form.campos?.length !== 1 ? 's' : ''}`} variant="outlined" />
                    </Stack>
                </Stack>
            </AccordionSummary>

            <AccordionDetails sx={{ p: isMobile ? 1 : 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, mb: 2 }}>
                    <Tooltip title="Editar formulário">
                        <IconButton
                            color="warning"
                            size={isMobile ? "small" : "medium"}
                            onClick={(event) => {
                                event.stopPropagation();
                                onEdit(form);
                            }}
                        >
                            <EditIcon fontSize={isMobile ? "small" : "medium"} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir formulário">
                        <IconButton
                            color="error"
                            size={isMobile ? "small" : "medium"}
                            onClick={(event) => {
                                event.stopPropagation();
                                form.id && onDelete(form.id);
                            }}
                        >
                            <Delete fontSize={isMobile ? "small" : "medium"} />
                        </IconButton>
                    </Tooltip>
                </Box>

                {children}
            </AccordionDetails>
        </Accordion>
    );
};
