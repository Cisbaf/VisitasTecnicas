// components/CircularWordCloud.tsx
import { Box, Typography, Tooltip } from '@mui/material';
import { WordData, useWordCloud } from './hooks/useWordCloud';

interface CircularWordCloudProps {
    relatos: any[];
    maxWords?: number;
}

export function CircularWordCloud({ relatos, maxWords = 25 }: CircularWordCloudProps) {
    const words = useWordCloud(relatos, maxWords);

    if (words.length === 0) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 300,
                width: '100%'
            }}>
                <Typography variant="body2" color="text.secondary">
                    Nenhuma palavra frequente encontrada.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{
            position: 'relative',
            width: '100%',
            height: 300,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            {words.map((word, index) => {
                const angle = (index / words.length) * 2 * Math.PI;
                const radius = 100 + (word.count * 5); // Raio baseado na frequência
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                    <Tooltip key={word.text} title={`${word.text} (${word.count}x)`} arrow>
                        <Typography
                            component="span"
                            sx={{
                                position: 'absolute',
                                left: `calc(50% + ${x}px)`,
                                top: `calc(50% + ${y}px)`,
                                transform: 'translate(-50%, -50%)',
                                fontSize: `${Math.max(10, word.value / 10)}px`,
                                fontWeight: word.count > 5 ? 'bold' : 'normal',
                                color: getColorByFrequency(word.count),
                                cursor: 'pointer',
                                padding: '2px 6px',
                                borderRadius: 1,
                                backgroundColor: 'background.paper',
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    transform: 'translate(-50%, -50%) scale(1.2)'
                                }
                            }}
                        >
                            {word.text}
                        </Typography>
                    </Tooltip>
                );
            })}
        </Box>
    );
    function getColorByFrequency(count: number): string {
        if (count >= 10) return '#d32f2f'; // Vermelho - muito frequente
        if (count >= 7) return '#f57c00'; // Laranja
        if (count >= 5) return '#fbc02d'; // Amarelo
        if (count >= 3) return '#388e3c'; // Verde
        return '#1976d2'; // Azul - pouco frequente
    }
}