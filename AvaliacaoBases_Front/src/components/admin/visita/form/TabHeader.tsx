import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface TabHeaderProps {
    title: string;
    onAddClick: () => void;
    children?: React.ReactNode;
}

export const TabHeader = ({ title, onAddClick, children }: TabHeaderProps) => (
    <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Typography variant="h4" fontWeight="600">{title}</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', sm: 'auto' } }}>
            {children}
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onAddClick}
                sx={{ bgcolor: '#5a3d30', '&:hover': { bgcolor: '#3d2514' } }}
            >
                Novo Formulário
            </Button>
        </Box>
    </Box>
);
