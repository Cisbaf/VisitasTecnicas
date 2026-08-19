import React from 'react';
import { Paper, Box, Typography } from '@mui/material';


const paperStyles = {
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderRadius: 3,
    boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)'
};
const paperStylesCard = {
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderRadius: 2,
    boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)'
};

export const StatCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: string | number }) => (
    <Paper
        variant="outlined"
        sx={{
            flex: 1,
            minWidth: 0,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.75,
            bgcolor: 'background.paper',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 24px rgba(15, 23, 42, 0.10)' },
            ...paperStyles,
        }}
    >
        <Box sx={{ width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'rgba(25, 118, 210, 0.08)', flexShrink: 0 }}>
            {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>{value}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{title}</Typography>
        </Box>
    </Paper>
);

export const Placeholder = ({ text }: { text: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 150, bgcolor: 'grey.50', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
        <Typography color="text.secondary">{text}</Typography>
    </Box>
);

export const InfoSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <Box>
        <Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ color: 'text.primary' }}>{title}</Typography>
        {children}
    </Box>
);

export const ChartCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <Paper
        variant="outlined"
        sx={{
            flex: 1,
            minWidth: { xs: '100%', md: 400 },
            p: { xs: 2, md: 3 },
            ...paperStylesCard,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            overflow: 'hidden',
        }}
    >
        <Typography variant="h6" fontWeight={800} gutterBottom sx={{ letterSpacing: 0, lineHeight: 1.25 }}>{title}</Typography>
        <Box sx={{ flexGrow: 1, width: '100%', mt: 1.5 }}>{children}</Box>
    </Paper>
);
