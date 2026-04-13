import React from 'react';
import { Paper, Box, Typography } from '@mui/material';


const paperStyles = {
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
};
const paperStylesCard = {
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
};

export const StatCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: string | number }) => (
    <Paper variant="outlined" sx={{ flex: 1, minWidth: 240, p: 2.5, display: 'flex', alignItems: 'center', gap: 2, ...paperStyles }}>
        {icon}
        <Box>
            <Typography variant="h5" fontWeight="bold">{value}</Typography>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
        </Box>
    </Paper>
);

export const Placeholder = ({ text }: { text: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 150 }}>
        <Typography color="text.secondary">{text}</Typography>
    </Box>
);

export const InfoSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <Box>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{title}</Typography>
        {children}
    </Box>
);

export const ChartCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <Paper variant="outlined" sx={{ flex: 1, minWidth: { xs: '100%', md: 400 }, p: 3, ...paperStylesCard, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>{title}</Typography>
        <Box sx={{ flexGrow: 1, width: '100%', mt: 2 }}>{children}</Box>
    </Paper>
);