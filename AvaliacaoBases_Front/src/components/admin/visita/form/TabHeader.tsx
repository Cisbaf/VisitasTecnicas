import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface TabHeaderProps {
    title: string;
    onAddClick: () => void;
}

export const TabHeader = ({ title, onAddClick }: TabHeaderProps) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" fontWeight="600">{title}</Typography>
        <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddClick}
            sx={{ bgcolor: '#5a3d30', '&:hover': { bgcolor: '#3d2514' } }}
        >
            Novo Formulário
        </Button>
    </Box>
);