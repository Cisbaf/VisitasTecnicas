"use client";

import React, { useEffect, useState } from 'react';
import { Box, Paper, TextField, Button, CircularProgress, MenuItem, Divider, Chip, Typography, Stack, List, ListItem, ListItemText, Alert, Accordion, AccordionSummary, AccordionDetails, Stack as MuiStack } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';

import ApartmentIcon from '@mui/icons-material/Apartment';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import DirectionsCar from '@mui/icons-material/DirectionsCar';
import Block from '@mui/icons-material/Block';
import Build from '@mui/icons-material/Build';
import HelpOutline from '@mui/icons-material/HelpOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

import { StatCard, ChartCard, InfoSection, Placeholder, } from './utils';

import { useAdminHome } from './hooks/useAdminHome';

const paperStyles = {
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 3,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
};

export default function AdminHomePage() {
    const {
        bases, resumo, perBaseConformidade, padronizacaoByBaseLastVisit,
        viaturaStatusPorBase, relatos, loading, error, buscarDadosPeriodo
    } = useAdminHome() as any;

    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [selectedMunicipio, setSelectedMunicipio] = React.useState<string>('');
    const [dataInicio, setDataInicio] = React.useState<Date | null>(new Date(2001, 0, 1));
    const [dataFim, setDataFim] = React.useState<Date | null>(new Date());

    const handleMunicipioChange = (event: React.ChangeEvent<any>) => setSelectedMunicipio(event.target.value as string);
    const handleBuscarClick = () => buscarDadosPeriodo(selectedMunicipio, dataInicio, dataFim);

    useEffect(() => {
        const fetchData = async () => {
            if (dataInicio && dataFim) {
                await buscarDadosPeriodo(selectedMunicipio, dataInicio, dataFim);
                setIsInitialLoad(false);
            }
        };
        fetchData();
    }, [selectedMunicipio, dataInicio, dataFim, buscarDadosPeriodo]);

    const mediaRegional = perBaseConformidade.length > 0
        ? perBaseConformidade.reduce((s: number, b: any) => s + b.avg, 0) / perBaseConformidade.length
        : 0;
    const bases100 = perBaseConformidade.filter((b: any) => Math.round(b.avg) >= 100);
    const chartData = viaturaStatusPorBase.map((base: any) => ({ name: base.baseNome, Operacional: base.status.operacional, Manutenção: base.status.manutencao, Inoperante: base.status.inoperante, Indefinido: base.status.indefinido }));

    const getChipProps = (status: string) => {
        const st = status;
        if (st === 'CONFORME') {
            return { label: 'CONFORME', color: 'success' as const, sx: { bgcolor: '#e8f5e9', color: '#2e7d32' } };
        }
        if (st === 'PARCIAL') {
            return { label: 'PARCIAL', color: 'warning' as const, sx: { bgcolor: '#fffde7', color: '#f57f17' } };
        }
        if (st === 'NAO_AVALIADO') {
            return { label: 'NÃO AVALIADO', color: 'default' as const, sx: { bgcolor: '#f5f5f5', color: '#616161' } };
        }
        return { label: 'NÃO CONFORME', color: 'error' as const, sx: { bgcolor: '#ffebee', color: '#c62828' } };
    };

    const categoriesMap = React.useMemo(() => {
        const map: Record<string, Array<any>> = {};
        (padronizacaoByBaseLastVisit || []).forEach((b: any) => {
            (b.categorias || []).forEach((c: any) => {
                const nomeCat = c.categoria ?? c.category ?? 'Sem categoria';
                if (!map[nomeCat]) map[nomeCat] = [];
                map[nomeCat].push({
                    baseId: b.id,
                    baseName: b.name,
                    status: c.status,
                    conforme: c.conforme,
                    parcial: c.parcial,
                    naoConforme: c.naoConforme,
                    naoAvaliado: c.naoAvaliado,
                    total: c.total ?? (c.raw?.total ?? 0),
                    raw: c.raw ?? null
                });
            });
        });
        return map;
    }, [padronizacaoByBaseLastVisit]);

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f4f6f8', minHeight: '100vh', fontFamily: 'Roboto, sans-serif' }}>

                {isInitialLoad ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 6, gap: 2 }}>
                        <CircularProgress />
                        <Typography variant="body1" color="text.secondary">Carregando dados iniciais...</Typography>
                    </Box>
                ) : (
                    <>
                        <Paper variant="outlined" sx={{ p: 3, mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', ...paperStyles }}>
                            <TextField select label="Base" value={selectedMunicipio} onChange={handleMunicipioChange} sx={{ minWidth: 220, flexGrow: 1 }}>
                                <MenuItem value=""><em>Todas as Bases</em></MenuItem>
                                {bases.map((baseNome: string) => (<MenuItem key={baseNome} value={baseNome}>{baseNome}</MenuItem>))}
                            </TextField>
                            <DatePicker label="Data Início" value={dataInicio} onChange={setDataInicio} maxDate={dataFim || new Date()} />
                            <DatePicker label="Data Fim" value={dataFim} onChange={setDataFim} minDate={dataInicio || new Date(2001, 0, 1)} maxDate={new Date()} />
                            <Button variant="contained" onClick={handleBuscarClick} disabled={!dataInicio || !dataFim || loading} sx={{ px: 4, py: 1.8, borderRadius: 2 }}>
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Analisar Período'}
                            </Button>
                        </Paper>

                        {loading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 6, gap: 2 }}>
                                <CircularProgress />
                                <Typography variant="body1" color="text.secondary">Processando dados...</Typography>
                            </Box>
                        )}

                        {error && (
                            <Alert severity="error" sx={{ mb: 4 }} onClose={() => { }}>
                                {String(error)}
                            </Alert>
                        )}

                        {resumo && !loading && (
                            <>
                                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
                                    <StatCard icon={<ApartmentIcon color="primary" />} title="Bases Visitadas" value={resumo.totalBasesVisitadas} />
                                    <StatCard icon={<ErrorOutlineIcon color="warning" />} title="Inconformidades" value={resumo.totalInconformidades} />
                                    <StatCard icon={<FactCheckIcon color="success" />} title="Índice de Aprovação" value={`${resumo.indiceAprovacao.toFixed(1)}%`} />
                                </Box>

                                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 4 }}>
                                    <Box sx={{ flex: 1, minWidth: 300, gap: 2, display: 'flex', flexDirection: 'column' }}>
                                        <ChartCard title="Avaliação da Estrutura Física da Base">
                                            {perBaseConformidade.length > 0 ? (
                                                <>
                                                    <ResponsiveContainer width="100%" height={300}>
                                                        <BarChart data={perBaseConformidade.map((b: any) => ({ name: b.nome, '% Conformidade': Math.round((b.avg || 0) * 100) / 100 }))} margin={{ top: 5, right: 20, left: -10, bottom: 60 }}>
                                                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} interval={0} />
                                                            <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                                                            <Tooltip />
                                                            <Bar dataKey="% Conformidade" radius={[4, 4, 0, 0]}>
                                                                {perBaseConformidade.map((entry: any, idx: number) => (<Cell key={`cell-${idx}`} fill={Math.round(entry.avg) >= 95 ? '#2e7d32' : '#1976d2'} />))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>

                                                    <Divider sx={{ my: 2 }} />
                                                    <Box mt={2} display="flex" flexWrap="wrap" alignItems="center" justifyContent="center" gap={2}>
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between' }}>
                                                            <Box sx={{ p: 1.5, border: '1px solid #eee', borderRadius: 2 }}>
                                                                <Typography variant="body2"><b>Média regional:</b> {mediaRegional ? `${(Math.round(mediaRegional * 100) / 100).toFixed(2)}%` : '—'}</Typography>
                                                            </Box>
                                                            <Box sx={{ p: 1.5, border: '1px solid #eee', borderRadius: 2 }}>
                                                                <Typography variant="body2" sx={{ mb: 1 }}><b>Bases com 100% de conformidade:</b></Typography>
                                                                {bases100.length > 0 ? <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{bases100.map((b: any) =>
                                                                    <Chip key={b.id} label={b.nome} color="success" size="small" />)}
                                                                </Box> : <Typography variant="caption">Nenhuma no período.</Typography>}
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </>
                                            ) : (<Placeholder text="Nenhuma conformidade por base encontrada." />)}
                                        </ChartCard>

                                        <ChartCard title="Viaturas da Base">
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 60 }}>
                                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} interval={0} />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="Operacional" stackId="a" fill="#4caf50" name="Operacional" />
                                                    <Bar dataKey="Manutenção" stackId="a" fill="#ff9800" name="Em Manutenção" />
                                                    <Bar dataKey="Inoperante" stackId="a" fill="#f44336" name="Inoperante" />
                                                    <Bar dataKey="Indefinido" stackId="a" fill="#9e9e9e" name="Status Indefinido" />
                                                </BarChart>
                                            </ResponsiveContainer>

                                            <Divider sx={{ my: 2 }} />

                                            <Box mt={2} sx={{ width: '100%' }}>
                                                <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>Resumo por Base</Typography>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 2 }}>
                                                    {viaturaStatusPorBase.map((base: any) => (
                                                        <Paper key={base.baseId} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                                            <Typography variant="subtitle2" gutterBottom>{base.baseNome}</Typography>
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <DirectionsCar sx={{ color: '#4caf50' }} />
                                                                    <Typography variant="body2">Operacional: {base.status.operacional}</Typography>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Build sx={{ color: '#ff9800' }} />
                                                                    <Typography variant="body2">Manutenção: {base.status.manutencao}</Typography>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Block sx={{ color: '#f44336' }} />
                                                                    <Typography variant="body2">Inoperante: {base.status.inoperante}</Typography>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <HelpOutline sx={{ color: '#9e9e9e' }} />
                                                                    <Typography variant="body2">Indefinido: {base.status.indefinido}</Typography>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                                                    <Typography variant="body2" fontWeight="bold">Total: {base.status.operacional + base.status.manutencao + base.status.inoperante + base.status.indefinido}</Typography>
                                                                </Box>
                                                            </Box>
                                                        </Paper>
                                                    ))}
                                                </Box>
                                            </Box>
                                        </ChartCard>

                                    </Box>

                                    <ChartCard title="Padronização Visual">
                                        {padronizacaoByBaseLastVisit.length > 0 ? (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <BarChart data={padronizacaoByBaseLastVisit} margin={{ top: 5, right: 20, left: -10, bottom: 60 }}>
                                                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} interval={0} />
                                                        <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                                                        <Tooltip />
                                                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '50px' }} />
                                                        <Bar dataKey="conforme" stackId="a" fill="#4caf50" name="Conforme" radius={[4, 4, 0, 0]} />
                                                        <Bar dataKey="parcial" stackId="a" fill="#ff9800" name="Parcial" />
                                                        <Bar dataKey="naoConforme" stackId="a" fill="#f44336" name="Não Conforme" radius={[4, 4, 0, 0]} />
                                                        <Bar dataKey="naoAvaliado" stackId="a" fill="#9e9e9e" name="Não Avaliado" />
                                                    </BarChart>
                                                </ResponsiveContainer>

                                                <Divider sx={{ my: 2 }} />

                                                <Box mt={2} sx={{ width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>Percentuais por base (última visita)</Typography>
                                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 2 }}>
                                                        {padronizacaoByBaseLastVisit.map((b: any) => (
                                                            <Box key={b.id} sx={{ p: 1.5, border: '1px solid #eee', borderRadius: 2 }}>
                                                                <Typography variant="subtitle2" noWrap title={b.name}>{b.name}</Typography>
                                                                <Stack direction="row" flexWrap="wrap" gap={0.5} mt={1}>
                                                                    <Chip size="small" label={`${Number(b.conforme).toFixed(1)}%`} sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                                                                    <Chip size="small" label={`${Number(b.parcial).toFixed(1)}%`} sx={{ bgcolor: '#fffde7', color: '#f57f17' }} />
                                                                    <Chip size="small" label={`${Number(b.naoConforme).toFixed(1)}%`} sx={{ bgcolor: '#ffebee', color: '#c62828' }} />
                                                                    <Chip size="small" label={`${Number(b.naoAvaliado).toFixed(1)}%`} sx={{ bgcolor: '#f5f5f5', color: '#616161' }} />
                                                                </Stack>
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                </Box>

                                                <Divider sx={{ my: 2 }} />

                                                <Box mt={1} sx={{ width: '100%' }}>
                                                    {(() => {
                                                        const entries = Object.entries(categoriesMap);
                                                        if (entries.length === 0) {
                                                            return <Typography variant="caption" color="text.secondary">Nenhuma categoria avaliada na última visita.</Typography>;
                                                        }

                                                        return entries.map(([catNome, basesArr]) => (
                                                            <Box key={catNome} sx={{ mb: 3 }}>
                                                                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>{catNome}</Typography>

                                                                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                                                                    {basesArr.map((bt: any) => {
                                                                        const chip = getChipProps(bt.status);
                                                                        return (
                                                                            <Paper key={`${catNome}-${bt.baseId}`} variant="outlined" sx={{ p: 1.25, display: 'flex', flexDirection: 'column', gap: 1, ...paperStyles }}>
                                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
                                                                                    <Typography variant="subtitle2" noWrap title={bt.baseName}>{bt.baseName}</Typography>
                                                                                    <Chip label={chip.label} color={chip.color as any} size="small" sx={chip.sx} />
                                                                                </Box>


                                                                            </Paper>
                                                                        );
                                                                    })}
                                                                </Box>
                                                            </Box>
                                                        ));
                                                    })()}
                                                </Box>

                                            </Box>
                                        ) : (<Placeholder text="Nenhum dado de padronização encontrado na última visita." />)}
                                    </ChartCard>

                                </Box>

                                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                                    <Paper variant="outlined" sx={{ flex: 1, minWidth: 300, p: 3, ...paperStyles }}>
                                        <InfoSection title="Municípios Visitados">
                                            {resumo.municipiosVisitados.length > 0 ? resumo.municipiosVisitados.map((m: string, i: number) => <Chip key={i} label={m} sx={{ m: 0.5 }} />) : <Typography variant="body2" color="text.secondary">Nenhum município no período.</Typography>}
                                        </InfoSection>
                                        <Divider sx={{ my: 2 }} />
                                        <InfoSection title="Datas das Visitas">
                                            {resumo.datasVisitas.length > 0 ? resumo.datasVisitas.map((d: string, i: number) => <Chip key={i} label={format(new Date(d), 'dd/MM/yyyy')} variant="outlined" sx={{ m: 0.5 }} />) : <Typography variant="body2" color="text.secondary">Nenhuma visita no período.</Typography>}
                                        </InfoSection>
                                        <Divider sx={{ my: 2 }} />
                                        <InfoSection title="Equipe Técnica">
                                            <List dense disablePadding>{resumo.equipeTecnica.length > 0 ? resumo.equipeTecnica.map((m: any, i: number) => <ListItem key={i} sx={{ px: 0 }}><ListItemText primary={m} /></ListItem>) : <Typography variant="body2" color="text.secondary">Nenhuma equipe registrada.</Typography>}</List>
                                        </InfoSection>
                                    </Paper>

                                    <Paper variant="outlined" sx={{ flex: 2, minWidth: { xs: '100%', md: 400 }, p: 3, ...paperStyles }}>
                                        <Typography variant="h6" gutterBottom>Relatos das Equipes</Typography>
                                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                            <Chip icon={<CheckCircleIcon />} label={`${relatos.filter((r: any) => r.resolvido).length} Resolvidos`} color="success" variant="outlined" />
                                            <Chip icon={<PendingIcon />} label={`${relatos.filter((r: any) => !r.resolvido).length} Pendentes`} color="error" variant="outlined" />
                                        </Stack>
                                        {relatos.length > 0 ? relatos.map((r: any) => (
                                            <Accordion key={r.id} variant="outlined" sx={{ boxShadow: 'none', '&:before': { display: 'none' }, my: 0.5, borderRadius: 3, borderLeft: r.resolvido ? '6px solid #2e7d32' : '6px solid #d32f2f' }}>
                                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                    <Typography sx={{ flexShrink: 0, mr: 2, fontWeight: 500 }}>{r.tema}</Typography>
                                                    <Typography sx={{ color: 'text.secondary', ml: 'auto' }}>{r.autor} — {format(new Date(r.data), 'dd/MM/yyyy')}</Typography>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>{r.mensagem}</Typography>
                                                    {r.gestorResponsavel && <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>Gestor: {r.gestorResponsavel}</Typography>}
                                                </AccordionDetails>
                                            </Accordion>
                                        )) : (<Placeholder text="Nenhum relato encontrado." />)}
                                    </Paper>
                                </Box>

                            </>
                        )}

                    </>
                )}
            </Box>
        </LocalizationProvider>
    );
}