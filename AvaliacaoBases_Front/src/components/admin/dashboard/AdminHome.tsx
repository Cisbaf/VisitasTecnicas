"use client";

import React, { useEffect, useRef, useState } from 'react';
import {
    Alert, Box, Button, Chip, CircularProgress, Divider, MenuItem,
    Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TextField, Typography, Tooltip as MuiTooltip,
    useMediaQuery, useTheme,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { Dayjs } from 'dayjs';
import { addDays, format } from 'date-fns';
import {
    Bar, BarChart, Cell, Legend, Pie, PieChart,
    ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

import ApartmentIcon from '@mui/icons-material/Apartment';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { CalendarMonth } from '@mui/icons-material';

import { ChartCard, InfoSection, Placeholder, StatCard } from './utils';
import { useAdminHome } from './hooks/useAdminHome';
import { Viatura } from '@/components/types';
import { useIndicadores } from '../hooks/useIndicadores';

const paperStyles = {
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 3,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
};

export default function AdminHomePage({ baseId }: { baseId?: string }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const {
        bases, resumo, perBaseConformidade, padronizacaoByBaseLastVisit,
        viaturaStatusPorBase, basesComChecklist, loading, error,
        buscarDadosPeriodo, fetchStatusViaturasPorBase,
        basesList, loadingViaturas, viaturasPorBase,
    } = useAdminHome() as any;

    const { dadosFiltrados, fetchMedias, vtrFiltradas, setSearchTerm } = useIndicadores(true);

    const [selectedMunicipio, setSelectedMunicipio] = React.useState<string>('');
    const [dataInicio, setDataInicio] = React.useState<Date | Dayjs | null>(new Date(2001, 0, 1));
    const [dataFim, setDataFim] = React.useState<Date | Dayjs | null>(new Date());
    const [vezes, setVezes] = useState(0);
    const initialFetchDone = useRef(false);

    const getCorPorSummary = (summaryId: number) => {
        const cores = ['#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1', '#D084D0', '#FF7C7C', '#A4DE6C', '#D0ED57', '#0088FE', '#00C49F', '#FFBB28'];
        return cores[summaryId % cores.length + 1];
    };

    /* Trunca labels de gráfico — mais agressivo no mobile */
    const t = (s: string, n = isMobile ? 8 : 15) =>
        s?.length > n ? `${s.substring(0, n)}…` : s;

    const processedData = padronizacaoByBaseLastVisit.map((item: any) => {
        const total = item.conforme + item.naoConforme;
        const conf = total > 0 ? (item.conforme / total) * 100 : 0;
        return { name: t(item.name), conformidade: Number(conf.toFixed(1)) };
    });

    const handleMunicipioChange = (e: React.ChangeEvent<any>) =>
        setSelectedMunicipio(e.target.value as string);

    const handleBuscarClick = async () => {
        try {
            const mun = baseId || selectedMunicipio;
            let termo = '';
            if (mun) {
                if (!isNaN(Number(mun))) {
                    const all = JSON.parse(localStorage.getItem('allBasesData') || '[]');
                    termo = all.find((b: any) => b.id == mun)?.nome || mun;
                } else { termo = mun; }
            }
            setSearchTerm(termo);
            await buscarDadosPeriodo(mun, dataInicio, dataFim);
            if (basesList.length > 0) await fetchStatusViaturasPorBase(mun || null, dataFim, dataInicio);
            await fetchMedias();
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        let mounted = true;
        const init = async () => {
            if (initialFetchDone.current || !basesList?.length) return;
            if (!mounted) return;
            const mun = baseId ?? selectedMunicipio;
            if (mun && !isNaN(Number(mun))) {
                const all = JSON.parse(localStorage.getItem('allBasesData') || '[]');
                setSearchTerm(all.find((b: any) => b.id == mun)?.nome || '');
            }
            await buscarDadosPeriodo(mun, dataInicio, dataFim);
            await fetchStatusViaturasPorBase(mun || null, dataFim, dataInicio);
            await fetchMedias();
            setVezes(v => v + 1);
            initialFetchDone.current = true;
        };
        init();
        return () => { mounted = false; };
    }, [basesList, baseId]);

    const bases100 = perBaseConformidade.filter((b: any) => Math.round(b.avg) >= 100);
    const chartData = viaturaStatusPorBase.map((base: any) => {
        const total = base.status.operacional + base.status.indefinido;
        return {
            name: t(base.baseNome),
            Operacional: total > 0 ? parseFloat(((base.status.operacional / total) * 100).toFixed(1)) : 0,
            Indefinido: total > 0 ? parseFloat(((base.status.indefinido / total) * 100).toFixed(1)) : 0,
        };
    });

    /* Dimensões adaptativas de gráfico */
    const chartH = isMobile ? 220 : 300;
    const pieR = isMobile ? 70 : 100;
    const xAngle = isMobile ? -55 : -45;
    const xHeight = isMobile ? 70 : 80;
    const xFont = isMobile ? 9 : 10;
    const yWidth = isMobile ? 28 : 35;
    const mLeft = isMobile ? -15 : -10;

    const LegendaCores = () => (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 1, sm: 2 }, mt: 1, flexWrap: 'wrap' }}>
            {[['#4caf50', '≥ 80%'], ['#ff9800', '50-79%'], ['#f44336', '< 50%']].map(([c, l]) => (
                <Box key={l} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 10, height: 10, bgcolor: c, borderRadius: 1, flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>{l}</Typography>
                </Box>
            ))}
        </Box>
    );

    /* Timeline: lista no mobile, bolinhas no desktop */
    const VisitaTimeline = ({ visitas, cor }: { visitas: any[], cor: string }) => {
        if (isMobile) {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {visitas.map((v: any, i: number) => (
                        <Box key={i} sx={{
                            p: 1.5, bgcolor: 'background.paper',
                            border: '1px solid', borderColor: 'divider',
                            borderLeft: `3px solid ${cor === 'primary.main' ? '#1976d2' : cor}`,
                            borderRadius: 1,
                        }}>
                            <Typography variant="caption" fontWeight="bold" sx={{ display: 'block' }}>
                                {v.data ? format(addDays(new Date(v.data), 1), 'dd/MM/yyyy') : 'N/D'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {v.municipio || v.baseNome || 'N/D'}
                            </Typography>
                            {v.tipo && (
                                <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                                    {v.tipo}
                                </Typography>
                            )}
                        </Box>
                    ))}
                </Box>
            );
        }
        /* desktop original */
        return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 1, width: '100%', px: 1, minHeight: 60, position: 'relative', zIndex: 2 }}>
                <Box sx={{ position: 'absolute', top: '8px', left: 0, right: 0, transform: 'translateY(-50%)', height: 2, bgcolor: cor, width: '100%', zIndex: 1 }} />
                {visitas.map((visita: any, i: number) => (
                    <Box key={`${visita.baseId}-${visita.data}-${i}`} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flex: '1 0 auto', minWidth: 60, maxWidth: 100 }}>
                        <MuiTooltip
                            title={cor === 'primary.main' ? (
                                <Box sx={{ p: 1, maxWidth: 300 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                        <Box><Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '12px' }}>Município</Typography><Typography variant="body2" sx={{ fontSize: '12px' }}>{visita.baseNome}</Typography></Box>
                                        <Box><Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '12px' }}>Tipo</Typography><Typography variant="body2" sx={{ fontSize: '12px' }}>{visita.tipo || 'N/D'}</Typography></Box>
                                    </Box>
                                    {visita.relatos?.[0] && (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '12px' }}>Motivo</Typography>
                                            <Typography variant="body2" sx={{ fontSize: '12px' }}>{visita.relatos[0]?.tema || 'N/D'}</Typography>
                                        </Box>
                                    )}
                                </Box>
                            ) : visita.tipo}
                            placement="top" arrow
                        >
                            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: cor, border: '2px solid white', boxShadow: 2, mb: 0.5, cursor: 'pointer', ':hover': { transform: 'scale(1.4)', transition: 'transform 0.3s' } }} />
                        </MuiTooltip>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.primary', textAlign: 'center', fontSize: '0.7rem' }}>
                            {visita.data ? format(addDays(new Date(visita.data), 1), 'dd/MM/yy') : 'N/D'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', fontSize: '0.65rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                            {visita.municipio ? visita.municipio.split(' ')[0] : 'N/D'}
                        </Typography>
                    </Box>
                ))}
            </Box>
        );
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <Box sx={{
                p: { xs: 1.5, md: 4 },
                backgroundColor: '#f4f6f8',
                minHeight: '100vh',
                fontFamily: 'Roboto, sans-serif',
                maxWidth: '100vw',
                overflowX: 'hidden',
                boxSizing: 'border-box',
            }}>

                {loading || loadingViaturas ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 2 }}>
                        <CircularProgress size={48} />
                        <Typography color="text.secondary">Carregando...</Typography>
                    </Box>
                ) : (
                    <>
                        {/* ══ FILTROS ═══════════════════════════════════════════ */}
                        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 4, ...paperStyles }}>
                            {isMobile ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {!baseId && (
                                        <TextField select fullWidth label="Base" value={selectedMunicipio} onChange={handleMunicipioChange} size="small">
                                            <MenuItem value=""><em>Todas as Bases</em></MenuItem>
                                            {bases.map((n: string) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                                        </TextField>
                                    )}
                                    <DatePicker label="Data Início" value={dataInicio} onChange={setDataInicio} maxDate={dataFim || new Date()} slotProps={{ textField: { size: 'small', fullWidth: true } }} />
                                    <DatePicker label="Data Fim" value={dataFim} onChange={setDataFim} minDate={dataInicio || new Date(2001, 0, 1)} maxDate={new Date()} slotProps={{ textField: { size: 'small', fullWidth: true } }} />
                                    <Button variant="contained" fullWidth onClick={handleBuscarClick} disabled={!dataInicio || !dataFim || loading} sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}>
                                        {loading ? <CircularProgress size={22} color="inherit" /> : 'Analisar Período'}
                                    </Button>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                                    {!baseId && (
                                        <TextField select label="Base" value={selectedMunicipio} onChange={handleMunicipioChange} sx={{ minWidth: 220, flexGrow: 1 }}>
                                            <MenuItem value=""><em>Todas as Bases</em></MenuItem>
                                            {bases.map((n: string) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                                        </TextField>
                                    )}
                                    <DatePicker label="Data Início" value={dataInicio} onChange={setDataInicio} maxDate={dataFim || new Date()} />
                                    <DatePicker label="Data Fim" value={dataFim} onChange={setDataFim} minDate={dataInicio || new Date(2001, 0, 1)} maxDate={new Date()} />
                                    <Button variant="contained" onClick={handleBuscarClick} disabled={!dataInicio || !dataFim || loading} sx={{ px: 4, py: 1.8, borderRadius: 2 }}>
                                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Analisar Período'}
                                    </Button>
                                </Box>
                            )}
                        </Paper>

                        {loading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 6, gap: 2 }}>
                                <CircularProgress /><Typography color="text.secondary">Processando dados...</Typography>
                            </Box>
                        )}
                        {error && <Alert severity="error" sx={{ mb: 4 }} onClose={() => { }}>{String(error)}</Alert>}

                        {resumo && !loading && (
                            <>
                                {/* ══ STAT CARDS ════════════════════════════════════ */}
                                {isMobile ? (
                                    <Box sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: { xs: 1.5, sm: 3 },
                                        mb: 4,
                                        justifyContent: 'center'
                                    }}>
                                        {/* Próxima Visita (Opcional) */}
                                        {resumo?.visitasDetalhadas?.some((v: any) => v.periodo === 'após') && (
                                            <Box sx={{
                                                flex: { xs: '1 1 100%', sm: '1 1 200px' },
                                                maxWidth: { sm: 250 },
                                                transition: 'transform 0.3s',
                                                '&:hover': { transform: 'scale(1.05)' }
                                            }}>
                                                <StatCard
                                                    icon={<CalendarMonth color="warning" />}
                                                    title="Próxima Visita"
                                                    value={(() => {
                                                        const fut = resumo.visitasDetalhadas
                                                            .filter((v: any) => v.periodo === 'após')
                                                            .sort((a: any, b: any) => +new Date(a.data) - +new Date(b.data));
                                                        return fut[0] ? format(addDays(new Date(fut[0].data), 1), 'dd/MM/yyyy') : 'Nenhuma';
                                                    })()}
                                                />
                                            </Box>
                                        )}

                                        {/* Bases Visitadas */}
                                        <Box sx={{
                                            flex: { xs: '1 1 calc(50% - 12px)', sm: '1 1 200px' },
                                            maxWidth: { sm: 250 },
                                            transition: 'transform 0.3s',
                                            '&:hover': { transform: 'scale(1.05)' }
                                        }}>
                                            <StatCard
                                                icon={<ApartmentIcon color="primary" />}
                                                title="Bases Visitadas"
                                                value={resumo.totalBasesVisitadas}
                                            />
                                        </Box>

                                        {/* Índice de Aprovação */}
                                        <Box sx={{
                                            flex: { xs: '1 1 calc(50% - 12px)', sm: '1 1 200px' },
                                            maxWidth: { sm: 250 },
                                            transition: 'transform 0.3s',
                                            '&:hover': { transform: 'scale(1.05)' }
                                        }}>
                                            <StatCard
                                                icon={<FactCheckIcon color="success" />}
                                                title="Índice"
                                                value={`${resumo.indiceAprovacao.toFixed(1)}%`}
                                            />
                                        </Box>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4, justifyContent: 'space-evenly' }}>
                                        {resumo?.visitasDetalhadas?.filter((v: any) => v.periodo === 'após').length > 0 && (
                                            <Box sx={{ width: 200, ':hover': { transform: 'scale(1.05)', transition: 'transform 0.3s' } }}>
                                                <StatCard icon={<CalendarMonth color="warning" />} title="Próxima Visita"
                                                    value={(() => {
                                                        const fut = resumo.visitasDetalhadas.filter((v: any) => v.periodo === 'após').sort((a: any, b: any) => +new Date(a.data) - +new Date(b.data));
                                                        return fut[0] ? format(addDays(new Date(fut[0].data), 1), 'dd/MM/yyyy') : 'Nenhuma agendada';
                                                    })()} />
                                            </Box>
                                        )}
                                        <Box sx={{ width: 200, ':hover': { transform: 'scale(1.05)', transition: 'transform 0.3s' } }}>
                                            <StatCard icon={<ApartmentIcon color="primary" />} title="Bases Visitadas" value={resumo.totalBasesVisitadas} />
                                        </Box>
                                        <Box sx={{ width: 200, ':hover': { transform: 'scale(1.05)', transition: 'transform 0.3s' } }}>
                                            <StatCard icon={<FactCheckIcon color="success" />} title="Índice de avaliações" value={`${resumo.indiceAprovacao.toFixed(1)}%`} />
                                        </Box>
                                    </Box>
                                )}

                                {/* ══ VISITAS ═══════════════════════════════════════ */}
                                <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 4, ...paperStyles }}>
                                    <InfoSection title="Linha do Tempo de Visitas">
                                        {resumo?.visitasDetalhadas?.filter((v: any) => v.periodo === 'entre').length > 0 ? (
                                            <VisitaTimeline
                                                visitas={resumo.visitasDetalhadas.filter((v: any) => v.periodo === 'entre').sort((a: any, b: any) => +new Date(a.data) - +new Date(b.data))}
                                                cor="primary.main"
                                            />
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">Nenhuma visita registrada no período selecionado.</Typography>
                                        )}
                                    </InfoSection>

                                    <Divider sx={{ my: 2 }} />

                                    <InfoSection title="Resumo de Visitas">
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Typography variant="caption" color="text.secondary">Total de visitas:</Typography>
                                            <Typography variant="caption" fontWeight="bold">
                                                {resumo.visitasDetalhadas?.filter((v: any) => {
                                                    if (v.periodo !== 'entre') return false;
                                                    const d = addDays(new Date(v.data), 1);
                                                    if (!dataInicio || !dataFim) return true;
                                                    const s = dataInicio instanceof Date ? dataInicio : (dataInicio as any).toDate();
                                                    const e = dataFim instanceof Date ? dataFim : (dataFim as any).toDate();
                                                    return d >= s && d <= e;
                                                }).length ?? 0}
                                            </Typography>
                                        </Box>
                                    </InfoSection>

                                    {resumo?.visitasDetalhadas?.some((v: any) => v.periodo === 'após') && (
                                        <>
                                            <Divider sx={{ my: 2 }} />
                                            <InfoSection title="Próximas Visitas">
                                                <VisitaTimeline
                                                    visitas={resumo.visitasDetalhadas.filter((v: any) => v.periodo === 'após').sort((a: any, b: any) => +new Date(a.data) - +new Date(b.data))}
                                                    cor="red"
                                                />
                                            </InfoSection>
                                        </>
                                    )}

                                    <Divider sx={{ my: 2 }} />

                                    <InfoSection title="Municípios Visitados">
                                        {resumo?.municipiosVisitados?.length > 0 ? (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {resumo.municipiosVisitados.map((m: string, i: number) => (
                                                    <Chip key={i} label={m} size="small" sx={{ fontSize: '0.7rem', height: 24, bgcolor: 'success.50', color: 'success.800', border: '1px solid', borderColor: 'success.200' }} />
                                                ))}
                                            </Box>
                                        ) : <Typography variant="body2" color="text.secondary">Nenhum município no período.</Typography>}
                                    </InfoSection>

                                    <Divider sx={{ my: 2 }} />

                                    <InfoSection title="Equipe Técnica por Base">
                                        {resumo?.equipeTecnicaPorBase?.length > 0 ? (
                                            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                                                {resumo.equipeTecnicaPorBase.map((be: any, i: number) => (
                                                    <Box key={i} sx={{ mb: 2 }}>
                                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>{be.baseNome}</Typography>
                                                        {be.equipePorData?.map((gd: any, di: number) => (
                                                            <Box key={di} sx={{ mb: 1.5 }}>
                                                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                                                                    {new Date(gd.data).toLocaleDateString('pt-BR')}:
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                    {gd.membros.map((m: string, mi: number) => (
                                                                        <Chip key={mi} label={m} size="small" sx={{ fontSize: '0.8rem', height: 30, bgcolor: 'grey.100' }} />
                                                                    ))}
                                                                </Box>
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                ))}
                                            </Box>
                                        ) : <Typography variant="body2" color="text.secondary">Nenhuma equipe registrada.</Typography>}
                                    </InfoSection>
                                </Paper>

                                {/* ══ TABELAS ═══════════════════════════════════════ */}
                                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 4, flexDirection: { xs: 'column', md: 'row' } }}>
                                    {[
                                        {
                                            title: 'Media Tempo Resposta e Prontidão por Município',
                                            rows: dadosFiltrados,
                                            cols: [
                                                { header: 'Município', key: 'cidade', align: 'left' as const },
                                                { header: 'T. Resposta', key: 'tempoRespostaMedio', align: 'center' as const },
                                                { header: 'T. Prontidão', key: 'tempoProntidaoMedio', align: 'center' as const },
                                            ],
                                        },
                                        {
                                            title: 'Media atividade Viaturas por Município',
                                            rows: vtrFiltradas,
                                            cols: [
                                                { header: 'Município', key: 'cidade', align: 'left' as const },
                                                { header: 'Ativa', key: 'ativa', align: 'center' as const, suffix: '%' },
                                            ],
                                        },
                                    ].map(({ title, rows, cols }) => (
                                        <Paper key={title} variant="outlined" sx={{
                                            flex: 1,
                                            minWidth: 0,
                                            p: { xs: 2, md: 3 },
                                            ...paperStyles,
                                        }}>
                                            <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'bold', fontSize: { xs: '0.9rem', md: '1.25rem' } }}>{title}</Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                                * Gerada a partir do último envio.
                                            </Typography>
                                            <Box sx={{ overflowX: 'auto' }}>
                                                <Table size="small" sx={{ minWidth: 260 }}>
                                                    <TableHead>
                                                        <TableRow>
                                                            {cols.map(c => (
                                                                <TableCell key={c.key} align={c.align} sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: { xs: '0.72rem', sm: '0.875rem' } }}>{c.header}</TableCell>
                                                            ))}
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {(rows as any[]).map((row, ri) => (
                                                            <TableRow key={ri} sx={{ bgcolor: ri % 2 === 0 ? 'background.default' : 'grey.100', '&:hover': { bgcolor: 'action.hover' } }}>
                                                                {cols.map(c => (
                                                                    <TableCell key={c.key} align={c.align} sx={{ py: 1, fontSize: { xs: '0.72rem', sm: '0.875rem' } }}>
                                                                        {c.align === 'center'
                                                                            ? <Chip label={`${row[c.key]}${'suffix' in c ? (c as any).suffix : ''}`} size="small" variant={row[c.key] === 'N/A' ? 'outlined' : 'filled'} />
                                                                            : <Typography variant="body2" sx={{ fontSize: 'inherit' }}>{row[c.key]}</Typography>
                                                                        }
                                                                    </TableCell>
                                                                ))}
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </Box>
                                        </Paper>
                                    ))}
                                </Box>

                                {/* ══ ITENS NÃO CONFORMES ═══════════════════════════ */}
                                {(() => {
                                    const key = baseId ?? perBaseConformidade?.[0]?.id;
                                    const items = resumo?.camposNaoConformes?.[key] ?? [];
                                    if (!items.length) return null;
                                    return (
                                        <Box sx={{ width: '100%', mt: 4, mb: 4 }}>
                                            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, ...paperStyles, borderTop: '4px solid', borderTopColor: 'error.main' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Box sx={{ bgcolor: 'error.50', p: 1, borderRadius: '50%', display: 'flex' }}>
                                                            <ErrorOutlineIcon color="error" />
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="h6" fontWeight="bold">Itens Não Conformes</Typography>
                                                            <Typography variant="body2" color="text.secondary">Lista de itens que precisam de atenção nesta base.</Typography>
                                                        </Box>
                                                    </Box>
                                                    <Chip label={`${items.length} pendências`} color="error" variant="outlined" size="small" sx={{ fontWeight: 'bold' }} />
                                                </Box>
                                                <Divider sx={{ mb: 3 }} />
                                                <Box sx={{ maxHeight: items.length > 16 ? '400px' : 'none', overflowY: items.length > 16 ? 'auto' : 'visible', scrollbarWidth: 'thin' }}>
                                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
                                                        {items.map((campo: any, i: number) => (
                                                            <Paper key={i} variant="outlined" sx={{ p: 1.5, borderLeft: '3px solid', borderColor: 'error.main', bgcolor: 'error.50', borderRadius: '0 6px 6px 0', transition: 'all 0.2s', '&:hover': { bgcolor: 'error.100', transform: 'translateX(2px)' } }}>
                                                                <Typography variant="body2" color="error.800" sx={{ lineHeight: 1.3 }}>{campo.titulo}</Typography>
                                                            </Paper>
                                                        ))}
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        </Box>
                                    );
                                })()}

                                {/* ══ GRÁFICOS PRINCIPAIS ══ */}
                                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 4, alignItems: 'flex-start', width: '100%', flexDirection: { xs: 'column', lg: 'row' } }}>

                                    {/* ─── coluna esquerda ─── */}
                                    <Box sx={{ flex: 1, width: '100%', minWidth: 0, gap: 2, display: 'flex', flexDirection: 'column' }}>
                                        <ChartCard title="Avaliação da Estrutura Física da Base">
                                            <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
                                                <Typography variant={isMobile ? 'subtitle1' : 'h5'}>
                                                    <b>Média {perBaseConformidade.length === 1 ? 'da base' : 'regional'}:</b>{' '}
                                                    {resumo?.indiceInspecao ? `${resumo.indiceInspecao.toFixed(1)}%` : '—'}
                                                </Typography>
                                            </Box>

                                            {perBaseConformidade.length === 0 ? (
                                                <Placeholder text="Nenhuma conformidade por base encontrada." />
                                            ) : perBaseConformidade.length === 1 ? (() => {
                                                const baseUnica = perBaseConformidade[0];
                                                const cPS = resumo?.conformidadePorSummary?.[baseUnica.id] || [];
                                                return (
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                        {cPS.length > 0 ? (
                                                            <>
                                                                <Box sx={{ width: '100%', mt: 2 }}>
                                                                    <ResponsiveContainer width="100%" height={isMobile ? 400 : 300}>
                                                                        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                                                            <Pie
                                                                                data={cPS}
                                                                                dataKey="porcentagem"
                                                                                nameKey="summaryNome"
                                                                                cx="50%"
                                                                                cy={isMobile ? "40%" : "50%"}
                                                                                outerRadius={isMobile ? "70%" : pieR}
                                                                                labelLine={false}
                                                                            >
                                                                                {cPS.map((e: any, i: number) => (
                                                                                    <Cell key={i} fill={getCorPorSummary(e.summaryId)} stroke="none" />
                                                                                ))}
                                                                            </Pie>

                                                                            <Tooltip
                                                                                formatter={(v: any) => [`${Number(v).toFixed(2)}%`, 'Conformidade']}
                                                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0px 4px 12px rgba(0,0,0,0.1)' }}
                                                                            />

                                                                            <Legend
                                                                                layout={isMobile ? "horizontal" : "vertical"}
                                                                                align="center"
                                                                                verticalAlign={isMobile ? "bottom" : "bottom"}
                                                                                iconType="circle"
                                                                                iconSize={10}
                                                                                wrapperStyle={{
                                                                                    fontSize: isMobile ? '12px' : '14px',
                                                                                    paddingTop: isMobile ? "20px" : "0",
                                                                                    lineHeight: '24px'
                                                                                }}
                                                                            />
                                                                        </PieChart>
                                                                    </ResponsiveContainer>
                                                                </Box>

                                                                <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 3 }, borderRadius: 2 }}>
                                                                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '0.95rem', md: '1.25rem' } }}>Detalhamento por Categoria</Typography>
                                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                                        {cPS.map((summary: any) => {
                                                                            const unicas = summary.categorias?.filter((c: any, i: number, arr: any[]) => i === arr.findIndex((x: any) => x.nome === c.nome)) || [];
                                                                            return (
                                                                                <Paper key={summary.summaryId} variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 2 }}>
                                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, p: 1, bgcolor: `${getCorPorSummary(summary.summaryId)}20`, borderRadius: 1, flexWrap: 'wrap' }}>
                                                                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: getCorPorSummary(summary.summaryId), flexShrink: 0 }} />
                                                                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: { xs: '0.85rem', md: '1rem' } }}>{summary.summaryNome}</Typography>
                                                                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto', fontSize: { xs: '0.72rem', md: '0.875rem' } }}>{unicas.length} cat. • {summary.porcentagem.toFixed(1)}%</Typography>
                                                                                    </Box>
                                                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                                                        {unicas.map((cat: any, ci: number) => {
                                                                                            const tot = cat.total;
                                                                                            const naoCon = tot - cat.conforme;
                                                                                            const dados = [
                                                                                                { name: 'Conforme', value: cat.conforme, porcentagem: tot > 0 ? (cat.conforme / tot) * 100 : 0, fill: '#4caf50' },
                                                                                                { name: 'Não Conforme', value: naoCon, porcentagem: tot > 0 ? (naoCon / tot) * 100 : 0, fill: '#f44336' },
                                                                                            ].filter(d => d.value > 0);
                                                                                            return (
                                                                                                <Paper key={ci} variant="outlined" sx={{ p: { xs: 1.25, md: 2 }, borderRadius: 2 }}>
                                                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, p: 1, bgcolor: `${getCorPorSummary(summary.summaryId)}10`, borderRadius: 1, flexWrap: 'wrap' }}>
                                                                                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: getCorPorSummary(summary.summaryId), flexShrink: 0 }} />
                                                                                                        <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>{cat.nome}</Typography>
                                                                                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>{cat.porcentagem.toFixed(1)}%</Typography>
                                                                                                    </Box>
                                                                                                    {/* Barras horizontais — largura YAxis fixa no mobile para caber */}
                                                                                                    <Box sx={{ width: '100%' }}>
                                                                                                        <ResponsiveContainer width="100%" height={80}>
                                                                                                            <BarChart data={dados} layout="vertical" margin={{ top: 4, right: 16, left: isMobile ? 4 : 20, bottom: 4 }}>
                                                                                                                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                                                                                                                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={isMobile ? 70 : 80} />
                                                                                                                <Tooltip formatter={(v: any) => [`${Number(v).toFixed(1)}%`, '']} />
                                                                                                                <Bar dataKey="porcentagem" radius={[0, 4, 4, 0]}>
                                                                                                                    {dados.map((d, i) => <Cell key={i} fill={d.fill} />)}
                                                                                                                </Bar>
                                                                                                            </BarChart>
                                                                                                        </ResponsiveContainer>
                                                                                                    </Box>
                                                                                                    <Box sx={{ mt: 1, overflowX: 'auto' }}>
                                                                                                        <Table size="small"><TableHead><TableRow>
                                                                                                            <TableCell sx={{ width: '50%', fontSize: { xs: '0.72rem', md: '0.875rem' } }}><strong>Status</strong></TableCell>
                                                                                                            <TableCell align="center" sx={{ fontSize: { xs: '0.72rem', md: '0.875rem' } }}><strong>%</strong></TableCell>
                                                                                                            <TableCell align="center" sx={{ fontSize: { xs: '0.72rem', md: '0.875rem' } }}><strong>Qtd</strong></TableCell>
                                                                                                        </TableRow></TableHead><TableBody>
                                                                                                                {dados.map((item, ii) => (
                                                                                                                    <TableRow key={ii} sx={{ borderLeft: `3px solid ${item.fill}` }}>
                                                                                                                        <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.fill, flexShrink: 0 }} /><Typography variant="body2" sx={{ fontSize: { xs: '0.72rem', md: '0.875rem' } }}>{item.name}</Typography></Box></TableCell>
                                                                                                                        <TableCell align="center"><Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.72rem', md: '0.875rem' } }}>{item.porcentagem.toFixed(1)}%</Typography></TableCell>
                                                                                                                        <TableCell align="center"><Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.72rem', md: '0.875rem' } }}>{item.value}</Typography></TableCell>
                                                                                                                    </TableRow>
                                                                                                                ))}
                                                                                                            </TableBody></Table>
                                                                                                    </Box>
                                                                                                </Paper>
                                                                                            );
                                                                                        })}
                                                                                    </Box>
                                                                                </Paper>
                                                                            );
                                                                        })}
                                                                    </Box>
                                                                </Paper>
                                                            </>
                                                        ) : (
                                                            <Typography align="center" color="text.secondary" sx={{ py: 4 }}>Dados não disponíveis.</Typography>
                                                        )}
                                                    </Box>
                                                );
                                            })() : (() => {
                                                const map = new Map();
                                                perBaseConformidade.forEach((base: any) => {
                                                    (resumo?.conformidadePorSummary?.[base.id] ?? []).forEach((summary: any) => {
                                                        if (!map.has(summary.summaryId)) map.set(summary.summaryId, { ...summary, catMap: new Map() });
                                                        summary.categorias?.forEach((cat: any) => {
                                                            const sm = map.get(summary.summaryId);
                                                            if (!sm.catMap.has(cat.nome)) sm.catMap.set(cat.nome, { categoriaNome: cat.nome, dados: [] });
                                                            sm.catMap.get(cat.nome).dados.push({ baseNome: t(base.nome), porcentagem: cat.porcentagem });
                                                        });
                                                    });
                                                });
                                                return (
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                        {Array.from(map.values()).map((summary: any) => (
                                                            <Paper key={summary.summaryId} variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 2 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, p: 1, bgcolor: `${getCorPorSummary(summary.summaryId)}20`, borderRadius: 1 }}>
                                                                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: getCorPorSummary(summary.summaryId), flexShrink: 0 }} />
                                                                    <Typography variant="subtitle1" fontWeight="bold">{summary.summaryNome}</Typography>
                                                                </Box>
                                                                {Array.from(summary.catMap.values()).map((cat: any) => (
                                                                    <Box key={cat.categoriaNome} sx={{ mb: 3 }}>
                                                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, ml: 1, bgcolor: `${getCorPorSummary(summary.summaryId)}20`, p: 1, borderRadius: 1, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                                                                            {cat.categoriaNome}
                                                                        </Typography>
                                                                        <Box sx={{ width: '100%' }}>
                                                                            <ResponsiveContainer width="100%" height={chartH}>
                                                                                <BarChart data={cat.dados} margin={{ top: 4, right: 8, left: mLeft, bottom: xHeight }}>
                                                                                    <XAxis dataKey="baseNome" angle={xAngle} textAnchor="end" height={xHeight} tick={{ fontSize: xFont }} interval={0} />
                                                                                    <YAxis domain={[0, 100]} tick={{ fontSize: xFont }} tickFormatter={v => `${v}%`} width={yWidth} />
                                                                                    <Tooltip formatter={(v: any) => [`${Number(v).toFixed(1)}%`, 'Conformidade']} />
                                                                                    <Bar dataKey="porcentagem" radius={[2, 2, 0, 0]}>
                                                                                        {cat.dados.map((d: any, i: number) => <Cell key={i} fill={d.porcentagem >= 80 ? '#4caf50' : d.porcentagem >= 50 ? '#ff9800' : '#f44336'} />)}
                                                                                    </Bar>
                                                                                    <Legend content={() => <LegendaCores />} />
                                                                                </BarChart>
                                                                            </ResponsiveContainer>
                                                                        </Box>
                                                                    </Box>
                                                                ))}
                                                            </Paper>
                                                        ))}

                                                        <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 3 }, borderRadius: 2, mt: 1 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, p: 1, bgcolor: '#BBBBFC', borderRadius: 1 }}>
                                                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#6363F8', flexShrink: 0 }} />
                                                                <Typography variant="subtitle1" fontWeight="bold">Conformidade Geral das Categorias</Typography>
                                                            </Box>
                                                            <Box sx={{ width: '100%' }}>
                                                                <ResponsiveContainer width="100%" height={chartH}>
                                                                    <BarChart
                                                                        data={perBaseConformidade.filter((b: any) => !isNaN(Number(b.avg)) && Number(b.avg) >= 0 && Number(b.avg) <= 100).map((b: any) => ({ name: t(b.nome), Conformidade: Number((b.avg || 0).toFixed(1)) }))}
                                                                        margin={{ top: 4, right: 8, left: mLeft, bottom: xHeight }}
                                                                    >
                                                                        <XAxis dataKey="name" angle={xAngle} textAnchor="end" height={xHeight} tick={{ fontSize: xFont }} interval={0} />
                                                                        <YAxis domain={[0, 100]} tick={{ fontSize: xFont }} width={yWidth} />
                                                                        <Tooltip formatter={v => [`${v}%`, 'Conformidade']} labelFormatter={l => `Base: ${l}`} />
                                                                        <Bar dataKey="Conformidade" radius={[4, 4, 0, 0]}>
                                                                            {perBaseConformidade.filter((b: any) => !isNaN(Number(b.avg))).map((b: any, i: number) => <Cell key={i} fill={Number(b.avg) >= 80 ? '#4caf50' : Number(b.avg) >= 50 ? '#ff9800' : '#f44336'} />)}
                                                                            <Legend content={() => <LegendaCores />} />
                                                                        </Bar>
                                                                    </BarChart>
                                                                </ResponsiveContainer>
                                                            </Box>
                                                        </Paper>

                                                        <Divider sx={{ my: 2 }} />
                                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                            <Box sx={{ p: 1.5, border: '1px solid #eee', borderRadius: 2 }}>
                                                                <Typography variant="body2" sx={{ mb: 1 }}><b>Bases com 100% de conformidade:</b></Typography>
                                                                {bases100.length > 0
                                                                    ? <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{bases100.map((b: any) => <Chip key={b.id} label={b.nome} color="success" size="small" />)}</Box>
                                                                    : <Typography variant="caption">Nenhuma no período.</Typography>}
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                );
                                            })()}
                                        </ChartCard>
                                    </Box>

                                    {/* ─── coluna direita ─── */}
                                    <Box sx={{ flex: 1, width: '100%', minWidth: 0, gap: 2, display: 'flex', flexDirection: 'column' }}>
                                        <ChartCard title="Padronização Visual">
                                            <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
                                                <Typography variant={isMobile ? 'subtitle1' : 'h5'}>
                                                    <b>Média {padronizacaoByBaseLastVisit.length === 1 ? 'da base' : 'regional'}:</b>{' '}
                                                    {resumo?.indicePadronizacao ? `${resumo.indicePadronizacao.toFixed(1)}%` : '—'}
                                                </Typography>
                                            </Box>

                                            {padronizacaoByBaseLastVisit.length === 0 ? (
                                                <Placeholder text="Nenhum dado de padronização encontrado na última visita." />
                                            ) : padronizacaoByBaseLastVisit.length === 1 ? (() => {
                                                const bu = padronizacaoByBaseLastVisit[0];
                                                return (
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                                                        <Box sx={{ width: '100%' }}>
                                                            <ResponsiveContainer width="100%" height={isMobile ? 240 : 300}>
                                                                <PieChart>
                                                                    <Pie
                                                                        data={[{ name: 'Conforme', value: Number(bu.conforme), fill: '#64B5F7' }, { name: 'Não Conforme', value: Number(bu.naoConforme), fill: '#FFBE5C' }].filter(d => d.value > 0)}
                                                                        dataKey="value" nameKey="name" outerRadius={pieR}
                                                                        label={({ name, value }) => isMobile ? `${(value as number).toFixed(0)}%` : `${name}: ${(value as number).toFixed(1)}%`}
                                                                        labelLine={!isMobile}
                                                                    />
                                                                    <Tooltip formatter={(v: any) => [`${Number(v).toFixed(1)}%`, 'Percentual']} />
                                                                    <Legend />
                                                                </PieChart>
                                                            </ResponsiveContainer>
                                                        </Box>
                                                        <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 3 }, borderRadius: 2, width: '100%' }}>
                                                            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '0.95rem', md: '1.25rem' } }}>Detalhamento por Categoria</Typography>
                                                            {bu.categorias?.length > 0 ? (
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                                    {bu.categorias.map((cat: any) => {
                                                                        const tot = cat.conforme + cat.parcial + cat.naoConforme + cat.naoAvaliado;
                                                                        const dados = [
                                                                            { name: 'Conforme', value: cat.conforme, porcentagem: tot > 0 ? (cat.conforme / tot) * 100 : 0, fill: '#4caf50' },
                                                                            { name: 'Não Conforme', value: cat.naoConforme, porcentagem: tot > 0 ? (cat.naoConforme / tot) * 100 : 0, fill: '#f44336' },
                                                                        ].filter(d => d.value > 0);
                                                                        return (
                                                                            <Paper key={cat.categoria} variant="outlined" sx={{ p: { xs: 1.25, md: 2 }, borderRadius: 2 }}>
                                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, p: 1, bgcolor: `${getCorPorSummary(2)}20`, borderRadius: 1 }}>
                                                                                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: getCorPorSummary(2), flexShrink: 0 }} />
                                                                                    <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>{cat.categoria}</Typography>
                                                                                </Box>
                                                                                <Box sx={{ width: '100%' }}>
                                                                                    <ResponsiveContainer width="100%" height={80}>
                                                                                        <BarChart data={dados} layout="vertical" margin={{ top: 4, right: 16, left: isMobile ? 4 : 20, bottom: 4 }}>
                                                                                            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                                                                                            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={isMobile ? 70 : 80} />
                                                                                            <Tooltip formatter={(v: any) => [`${Number(v).toFixed(1)}%`, '']} />
                                                                                            <Bar dataKey="porcentagem" radius={[0, 4, 4, 0]}>
                                                                                                {dados.map((d, i) => <Cell key={i} fill={d.fill} />)}
                                                                                            </Bar>
                                                                                        </BarChart>
                                                                                    </ResponsiveContainer>
                                                                                </Box>
                                                                                <Box sx={{ mt: 1, overflowX: 'auto' }}>
                                                                                    <Table size="small"><TableHead><TableRow>
                                                                                        <TableCell sx={{ width: '40%', fontSize: { xs: '0.72rem', md: '0.875rem' } }}><strong>Status</strong></TableCell>
                                                                                        <TableCell align="right" sx={{ fontSize: { xs: '0.72rem', md: '0.875rem' } }}><strong>%</strong></TableCell>
                                                                                    </TableRow></TableHead><TableBody>
                                                                                            {dados.map((item, ii) => (
                                                                                                <TableRow key={ii} sx={{ borderLeft: `3px solid ${item.fill}` }}>
                                                                                                    <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.fill, flexShrink: 0 }} /><Typography variant="body2" sx={{ fontSize: { xs: '0.72rem', md: '0.875rem' } }}>{item.name}</Typography></Box></TableCell>
                                                                                                    <TableCell align="right"><Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.72rem', md: '0.875rem' } }}>{item.porcentagem.toFixed(1)}%</Typography></TableCell>
                                                                                                </TableRow>
                                                                                            ))}
                                                                                        </TableBody></Table>
                                                                                </Box>
                                                                            </Paper>
                                                                        );
                                                                    })}
                                                                </Box>
                                                            ) : (
                                                                <Typography align="center" color="text.secondary" sx={{ py: 4 }}>Nenhum dado disponível.</Typography>
                                                            )}
                                                        </Paper>
                                                    </Box>
                                                );
                                            })() : (
                                                <>
                                                    {padronizacaoByBaseLastVisit[0]?.categorias?.length > 0 ? (
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                                                            <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 3 }, borderRadius: 2 }}>
                                                                {padronizacaoByBaseLastVisit[0].categorias.map((cat: any, ci: number) => {
                                                                    const dadosCat = padronizacaoByBaseLastVisit.map((base: any) => ({
                                                                        baseName: t(base.name),
                                                                        conforme: base.categorias?.[ci]?.conforme || 0,
                                                                        naoConforme: base.categorias?.[ci]?.naoConforme || 0,
                                                                    })).filter((d: any) => d.conforme + d.naoConforme > 0);
                                                                    return (
                                                                        <Box key={cat.categoria}>
                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, p: 1, bgcolor: `${getCorPorSummary(2)}20`, borderRadius: 1 }}>
                                                                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: getCorPorSummary(2), flexShrink: 0 }} />
                                                                                <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>{cat.categoria}</Typography>
                                                                            </Box>
                                                                            <Box sx={{ width: '100%' }}>
                                                                                <ResponsiveContainer width="100%" height={chartH}>
                                                                                    <BarChart
                                                                                        data={dadosCat.map((d: any) => { const tot = d.conforme + d.naoConforme; return { baseName: d.baseName, conformidade: tot > 0 ? Number(((d.conforme / tot) * 100).toFixed(1)) : 0 }; })}
                                                                                        margin={{ top: 4, right: 8, left: mLeft, bottom: xHeight }}
                                                                                    >
                                                                                        <XAxis dataKey="baseName" angle={xAngle} textAnchor="end" height={xHeight} tick={{ fontSize: xFont }} interval={0} />
                                                                                        <YAxis domain={[0, 100]} tick={{ fontSize: xFont }} tickFormatter={v => `${v}%`} width={yWidth} />
                                                                                        <Tooltip formatter={v => `${Number(v).toFixed(1)}%`} labelFormatter={l => `Base: ${l}`} />
                                                                                        <Bar dataKey="conformidade" radius={[4, 4, 0, 0]}>
                                                                                            {dadosCat.map((d: any, i: number) => { const tot = d.conforme + d.naoConforme; const c = tot > 0 ? (d.conforme / tot) * 100 : 0; return <Cell key={i} fill={c >= 80 ? '#4caf50' : c >= 50 ? '#ff9800' : '#f44336'} />; })}
                                                                                        </Bar>
                                                                                        <Legend content={() => <LegendaCores />} />
                                                                                    </BarChart>
                                                                                </ResponsiveContainer>
                                                                            </Box>
                                                                        </Box>
                                                                    );
                                                                })}
                                                            </Paper>
                                                        </Box>
                                                    ) : (
                                                        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>Nenhum dado disponível.</Typography>
                                                    )}
                                                    <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 3 }, borderRadius: 2, mt: 3, width: '100%' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, p: 1, bgcolor: '#BBBBFC', borderRadius: 1 }}>
                                                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#6363F8', flexShrink: 0 }} />
                                                            <Typography variant="subtitle1" fontWeight="bold">Conformidade Geral das Categorias</Typography>
                                                        </Box>
                                                        <Box sx={{ width: '100%' }}>
                                                            <ResponsiveContainer width="100%" height={chartH}>
                                                                <BarChart data={processedData} margin={{ top: 4, right: 8, left: mLeft, bottom: xHeight }}>
                                                                    <XAxis dataKey="name" angle={xAngle} textAnchor="end" height={xHeight} tick={{ fontSize: xFont }} interval={0} />
                                                                    <YAxis domain={[0, 100]} tick={{ fontSize: xFont }} width={yWidth} />
                                                                    <Tooltip formatter={v => [`${v}%`, 'Conformidade']} labelFormatter={l => `Base: ${l}`} />
                                                                    <Bar dataKey="conformidade" radius={[4, 4, 0, 0]}>
                                                                        {processedData.map((d: any, i: number) => <Cell key={i} fill={d.conformidade >= 80 ? '#4caf50' : d.conformidade >= 50 ? '#ff9800' : '#f44336'} />)}
                                                                        <Legend content={() => <LegendaCores />} />
                                                                    </Bar>
                                                                </BarChart>
                                                            </ResponsiveContainer>
                                                        </Box>
                                                    </Paper>
                                                </>
                                            )}
                                        </ChartCard>

                                        {/* ─── VIATURAS ─── */}
                                        <ChartCard title={viaturaStatusPorBase.length === 1 ? "Viatura da Base" : "Viatura das Bases"}>
                                            {viaturaStatusPorBase.length === 1 ? (() => {
                                                const bu = viaturaStatusPorBase[0];
                                                const temCk = basesComChecklist.includes(bu.baseId);
                                                const vtrs = viaturasPorBase[bu.baseId] || [];
                                                return (
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, borderLeft: `4px solid ${temCk ? '#4caf50' : '#f44336'}` }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                                                                {temCk ? <CheckCircleIcon sx={{ color: '#4caf50', fontSize: { xs: 30, md: 40 } }} /> : <ErrorOutlineIcon sx={{ color: '#f44336', fontSize: { xs: 30, md: 40 } }} />}
                                                                <Box>
                                                                    <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight="bold">{temCk ? 'Checklist Preenchido' : 'Checklist Não Preenchido'}</Typography>
                                                                    <Typography variant="body2" color="text.secondary">{bu.baseNome}</Typography>
                                                                </Box>
                                                            </Box>
                                                            {temCk && vtrs.length > 0 && (
                                                                <Box sx={{ mt: 2 }}>
                                                                    <Typography variant="body2" fontWeight="medium" gutterBottom>Data do último preenchimento:</Typography>
                                                                    <Typography variant="body1">
                                                                        {(() => {
                                                                            const dts = vtrs.map((v: Viatura) => new Date(v.dataUltimaAlteracao));
                                                                            if (!dts.length) return 'N/D';
                                                                            const d = new Date(Math.max(...dts.map((x: any) => x.getTime())));
                                                                            d.setDate(d.getDate() + 1);
                                                                            return format(d, 'dd/MM/yyyy');
                                                                        })()}
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </Paper>

                                                        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                                                            <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight="bold" gutterBottom>Resumo de Viaturas</Typography>
                                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 2, md: 4 } }}>
                                                                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e9', borderRadius: 2, flex: 1 }}>
                                                                    <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold" color="#2e7d32">{bu.status.operacional}</Typography>
                                                                    <Typography variant="body2" color="text.secondary">Operacionais</Typography>
                                                                </Box>
                                                                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 2, flex: 1 }}>
                                                                    <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold" color="#757575">{bu.status.indefinido}</Typography>
                                                                    <Typography variant="body2" color="text.secondary">Indefinidos</Typography>
                                                                </Box>
                                                            </Box>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                                                                Total: {bu.status.operacional + bu.status.indefinido} viaturas
                                                            </Typography>
                                                        </Paper>

                                                        {vtrs.length > 0 && (
                                                            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                                                                <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight="bold" gutterBottom>Viaturas da Base ({vtrs.length})</Typography>
                                                                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                                                                    {vtrs.map((v: Viatura, i: number) => (
                                                                        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: { xs: 1.5, md: 2 }, borderBottom: i < vtrs.length - 1 ? '1px solid #eee' : 'none', flexWrap: 'wrap', gap: 1 }}>
                                                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                                                <Typography variant="body1" fontWeight="medium" sx={{ fontSize: { xs: '0.85rem', md: '1rem' } }}>{v.placa || `Viatura ${v.id}`}</Typography>
                                                                                <Typography variant="caption" color="text.secondary">KM: {v.km || 'Não informado'}</Typography>
                                                                            </Box>
                                                                            <Chip label={v.statusOperacional} color={v.statusOperacional === 'Operacional' ? 'success' : 'default'} size="small" />
                                                                        </Box>
                                                                    ))}
                                                                </Box>
                                                            </Paper>
                                                        )}
                                                    </Box>
                                                );
                                            })() : (
                                                <Box>
                                                    <Box mt={2}>
                                                        <Typography variant="body2" fontWeight="bold" sx={{ mb: 2 }}>Status do Checklist</Typography>
                                                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderLeft: '4px solid #4caf50' }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                                    <CheckCircleIcon sx={{ color: '#4caf50' }} />
                                                                    <Typography variant="subtitle2" fontWeight="bold">Com Checklist</Typography>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                    {basesComChecklist.length > 0 ? (
                                                                        basesComChecklist.map((id: number) => {
                                                                            const base = basesList.find((b: any) => b.id === id);
                                                                            const bs = viaturaStatusPorBase.find((b: any) => b.baseId === id);
                                                                            return (
                                                                                <Box key={id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                                                                                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>{base?.nome || `Base ${id}`}</Typography>
                                                                                    {bs && <Chip size="small" label={`${bs.status.operacional} ✓`} color="success" variant="outlined" />}
                                                                                </Box>
                                                                            );
                                                                        })
                                                                    ) : <Typography variant="body2" color="text.secondary">Nenhuma base preencheu recentemente.</Typography>}
                                                                </Box>
                                                            </Paper>
                                                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderLeft: '4px solid #f44336' }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                                    <ErrorOutlineIcon sx={{ color: '#f44336' }} />
                                                                    <Typography variant="subtitle2" fontWeight="bold">Sem Checklist</Typography>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                    {basesList.filter((b: any) => !basesComChecklist.includes(b.id)).length > 0 ? (
                                                                        basesList.filter((b: any) => !basesComChecklist.includes(b.id)).map((base: any) => {
                                                                            const bs = viaturaStatusPorBase.find((b: any) => b.baseId === base.id);
                                                                            return (
                                                                                <Box key={base.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                                                                                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>{base.nome}</Typography>
                                                                                    <Chip size="small" label={bs ? `${bs.status.indefinido} ✗` : 'Sem viaturas'} color="error" variant="outlined" />
                                                                                </Box>
                                                                            );
                                                                        })
                                                                    ) : <Typography variant="body2" color="success.main">Todas as bases preencheram!</Typography>}
                                                                </Box>
                                                            </Paper>
                                                        </Box>
                                                    </Box>

                                                    <Divider sx={{ my: 2 }} />
                                                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>Status das Viaturas por Base</Typography>
                                                    <Box sx={{ width: '100%' }}>
                                                        <ResponsiveContainer width="100%" height={chartH}>
                                                            <BarChart data={chartData} margin={{ top: 4, right: 8, left: mLeft, bottom: xHeight }}>
                                                                <XAxis dataKey="name" angle={xAngle} textAnchor="end" height={xHeight} tick={{ fontSize: xFont }} interval={0} />
                                                                <YAxis tickFormatter={v => `${v}%`} domain={[0, 100]} tick={{ fontSize: xFont }} width={yWidth} />
                                                                <Tooltip formatter={(v: number) => `${v}%`} />
                                                                <Legend wrapperStyle={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }} />
                                                                <Bar dataKey="Operacional" stackId="a" fill="#4caf50" name="Com Check-List" />
                                                                <Bar dataKey="Indefinido" stackId="a" fill="#f21c24" name="Sem Check-List" />
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    </Box>
                                                </Box>
                                            )}
                                        </ChartCard>
                                    </Box>
                                </Box>
                            </>
                        )}
                    </>
                )}
            </Box>
        </LocalizationProvider>
    );
}
