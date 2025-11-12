"use client";

import React, { useEffect, useState } from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    MenuItem,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Tooltip as MuiTooltip
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { Dayjs } from 'dayjs';
import { addDays, format } from 'date-fns';
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import ApartmentIcon from '@mui/icons-material/Apartment';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { ChartCard, InfoSection, Placeholder, StatCard, } from './utils';

import { useAdminHome } from './hooks/useAdminHome';
import { Viatura } from '@/components/types';
import { useIndicadores } from '../hooks/useIndicadores';
import { CircularWordCloud } from './WordCloud';

const paperStyles = {
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 3,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
};


export default function AdminHomePage({ baseId }: { baseId?: string }) {
    const {
        bases,
        resumo,
        perBaseConformidade,
        padronizacaoByBaseLastVisit,
        viaturaStatusPorBase,
        basesComChecklist,
        relatos,
        loading,
        error,
        buscarDadosPeriodo,
        fetchStatusViaturasPorBase,
        basesList,
        loadingViaturas,
        viaturasPorBase
    } = useAdminHome() as any;


    const {
        dadosFiltrados,
        fetchMedias,
        vtrFiltradas,
        setSearchTerm,
    } = useIndicadores(true);

    const [selectedMunicipio, setSelectedMunicipio] = React.useState<string>('');
    const [dataInicio, setDataInicio] = React.useState<Date | Dayjs | null>(new Date(2001, 0, 1));
    const [dataFim, setDataFim] = React.useState<Date | Dayjs | null>(new Date());
    const [vezes, setVezes] = useState(0);

    const getCorPorSummary = (summaryId: number) => {
        const cores = [
            '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
            '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1',
            '#D084D0', '#FF7C7C', '#A4DE6C', '#D0ED57'
        ];
        return cores[summaryId % cores.length];
    };


    const handleMunicipioChange = (event: React.ChangeEvent<any>) => setSelectedMunicipio(event.target.value as string);

    const handleBuscarClick = async () => {
        try {
            const municipioParaBuscar = baseId || selectedMunicipio;
            let termoDeBusca = "";

            if (municipioParaBuscar) {
                if (!isNaN(Number(municipioParaBuscar))) {
                    const base = localStorage.getItem('allBasesData');
                    const allBasesData = base ? JSON.parse(base) : [];
                    const baseEncontrada = allBasesData.find((b: any) => b.id == municipioParaBuscar);
                    termoDeBusca = baseEncontrada?.nome || municipioParaBuscar.toString();
                } else {
                    termoDeBusca = municipioParaBuscar.toString();
                }
            }

            setSearchTerm(termoDeBusca);

            await buscarDadosPeriodo(municipioParaBuscar, dataInicio, dataFim);

            if (basesList.length > 0) {
                await fetchStatusViaturasPorBase(municipioParaBuscar || null, dataFim, dataInicio);
            }

            await fetchMedias();

        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    };
    useEffect(() => {
        let mounted = true;

        const fetchInitialData = async () => {
            if (!basesList) return;
            try {
                if (!mounted) return;

                if (!basesList || basesList.length === 0) {

                    return;
                }

                const municipioParaBuscar = baseId != null ? baseId : selectedMunicipio;

                if (municipioParaBuscar && Number.isNaN(Number(municipioParaBuscar)) === false) {
                    const base = localStorage.getItem('allBasesData')
                    const allBasesData = base ? JSON.parse(base) : [];
                    const baseEncontrada = allBasesData.find((b: any) => b.id == municipioParaBuscar);
                    setSearchTerm(baseEncontrada ? baseEncontrada.nome : '');
                }

                await buscarDadosPeriodo(municipioParaBuscar, dataInicio, dataFim);

                await fetchStatusViaturasPorBase(municipioParaBuscar || null, dataFim, dataInicio);
                await fetchMedias();
                setVezes(vezes + 1);

            } catch (error) {
                console.error('Erro na carga inicial:', error);
            }
        };

        fetchInitialData();

        return () => {
            mounted = false;
        };
    }, [basesList, baseId]);

    const bases100 = perBaseConformidade.filter((b: any) => Math.round(b.avg) >= 100);
    const chartData = viaturaStatusPorBase.map((base: any) => ({
        name: base.baseNome,
        Operacional: base.status.operacional,
        Indefinido: base.status.indefinido
    }));

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
            <Box sx={{
                p: { xs: 2, md: 4 },
                backgroundColor: '#f4f6f8',
                minHeight: '100vh',
                fontFamily: 'Roboto, sans-serif'
            }}>

                {loading || loadingViaturas ? (
                    <div className="flex items-center justify-center ">
                        <div className="flex flex-col items-center">
                            <div
                                className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-e-amber-800 mb-4"></div>
                            <span className="text-lg text-gray-600">Carregando...</span>
                        </div>
                    </div>
                ) : (
                    <>

                        <Paper variant="outlined" sx={{
                            p: 3,
                            mb: 4,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 2,
                            alignItems: 'center', ...paperStyles
                        }}>
                            {!baseId && (
                                <TextField select label="Base" value={selectedMunicipio}
                                    onChange={handleMunicipioChange} sx={{ minWidth: 220, flexGrow: 1 }}>
                                    <MenuItem value=""><em>Todas as Bases</em></MenuItem>
                                    {bases.map((baseNome: string) => (
                                        <MenuItem key={baseNome} value={baseNome}>{baseNome}</MenuItem>))}
                                </TextField>
                            )}

                            <DatePicker label="Data Início" value={dataInicio}
                                onChange={(newValue) => setDataInicio(newValue)}
                                maxDate={dataFim || new Date()} />
                            <DatePicker label="Data Fim" value={dataFim} onChange={(newValue) => setDataFim(newValue)}
                                minDate={dataInicio || new Date(2001, 0, 1)} maxDate={new Date()} />
                            <Button variant="contained" onClick={handleBuscarClick}
                                disabled={!dataInicio || !dataFim || loading}
                                sx={{ px: 4, py: 1.8, borderRadius: 2 }}>
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
                            <Alert severity="error" sx={{ mb: 4 }} onClose={() => {
                            }}>
                                {String(error)}
                            </Alert>
                        )}

                        {resumo && !loading && (
                            <>
                                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4, justifyContent: 'space-evenly' }}>
                                    <Box sx={{ width: 200, ":hover": { transform: 'scale(1.05)', transition: 'transform 0.3s' } }}>
                                        <StatCard icon={<ApartmentIcon color="primary" />} title="Bases Visitadas" value={resumo.totalBasesVisitadas} />
                                    </Box>
                                    <Box sx={{ width: 200, ":hover": { transform: 'scale(1.05)', transition: 'transform 0.3s' } }}>
                                        <StatCard icon={<FactCheckIcon color="success" />} title="Índice de avaliações" value={`${resumo.indiceAprovacao.toFixed(1)}%`} />
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
                                    <Paper variant="outlined" sx={{ flex: 1, minWidth: 300, p: 3, ...paperStyles }}>
                                        <InfoSection title="Linha do Tempo de Visitas">
                                            {resumo?.visitasDetalhadas && resumo.visitasDetalhadas.length > 0 ? (
                                                <Box sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    width: '100%',
                                                    position: 'relative' // Adicionado
                                                }}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        justifyContent: 'space-between',
                                                        gap: 1,
                                                        width: '100%',
                                                        px: 1,
                                                        minHeight: 60,
                                                        position: 'relative', // Essencial: Define este Box como a referência (0,0) para a linha absoluta
                                                        zIndex: 2 // OK
                                                    }}>

                                                        {/* Linha horizontal: AGORA É FILHA DESTE BOX */}
                                                        <Box sx={{
                                                            position: 'absolute',
                                                            top: '8px', // Alterado: 50% da altura do contêiner das Bolinhas (minHeight: 60)
                                                            left: 0, // Adicionado: Inicia no canto esquerdo
                                                            right: 0, // Adicionado: Vai até o canto direito
                                                            transform: 'translateY(-50%)', // Essencial: Centraliza a linha de 2px
                                                            height: 2,
                                                            bgcolor: 'primary.main',
                                                            width: '100%', // Usa 100% da largura do contêiner das Bolinhas
                                                            zIndex: 1 // Garante que fique atrás das bolinhas
                                                        }} />
                                                        {resumo.visitasDetalhadas
                                                            .sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime())
                                                            .map((visita: any, i: number) => (
                                                                <Box
                                                                    key={`${visita.baseId}-${visita.data}-${i}`}
                                                                    sx={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        position: 'relative',
                                                                        flex: '1 0 auto',
                                                                        minWidth: 60,
                                                                        maxWidth: 80
                                                                    }}
                                                                >
                                                                    {/* Bolinha com Tooltip */}
                                                                    <MuiTooltip
                                                                        title={
                                                                            <Box sx={{ p: 1.5, minWidth: 200 }}>
                                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                        <strong style={{ minWidth: 60, fontSize: '14px' }}>Município:</strong>
                                                                                        <span style={{ fontSize: '14px' }}>{visita.baseNome}</span>
                                                                                    </Box>
                                                                                    {visita.relatos != null && visita.relatos.length > 0 && (
                                                                                        <>
                                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                                <strong style={{ minWidth: 60, fontSize: '14px' }}>Motivo:</strong>
                                                                                                <span style={{ fontSize: '14px' }}>{visita.relatos[0]?.tema || 'N/D'}</span>
                                                                                            </Box>
                                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                                <strong style={{ minWidth: 60, fontSize: '14px' }}>Descrição:</strong>
                                                                                                <span style={{ fontSize: '14px' }}>{visita.relatos[0]?.mensagem || 'N/D'}</span>
                                                                                            </Box>
                                                                                        </>
                                                                                    )}
                                                                                </Box>
                                                                            </Box>
                                                                        }
                                                                        placement="top"
                                                                        arrow
                                                                        componentsProps={{
                                                                            tooltip: {
                                                                                sx: {
                                                                                    border: '1px solid',
                                                                                    borderColor: 'divider',
                                                                                    boxShadow: 3,
                                                                                    fontSize: '16px',
                                                                                    '& .MuiTooltip-arrow': {
                                                                                        color: 'white',
                                                                                    }
                                                                                }
                                                                            }
                                                                        }}
                                                                    >
                                                                        {/* Elemento clicável para o tooltip */}
                                                                        <Box
                                                                            sx={{
                                                                                width: 16,
                                                                                height: 16,
                                                                                borderRadius: '50%',
                                                                                bgcolor: 'primary.main',
                                                                                border: '2px solid white',
                                                                                boxShadow: 2,
                                                                                mb: 0.5,
                                                                                cursor: 'pointer',
                                                                                ":hover": {
                                                                                    transform: 'scale(1.40)',
                                                                                    transition: 'transform 0.3s',
                                                                                }
                                                                            }}
                                                                        />
                                                                    </MuiTooltip>

                                                                    {/* Data */}
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            fontWeight: 'bold',
                                                                            color: 'text.primary',
                                                                            textAlign: 'center',
                                                                            fontSize: '0.7rem'
                                                                        }}
                                                                    >
                                                                        {visita.data ? format(addDays(new Date(visita.data), 1), 'dd/MM/yy') : 'N/D'}
                                                                    </Typography>

                                                                    {/* Município */}
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            color: 'text.secondary',
                                                                            textAlign: 'center',
                                                                            fontSize: '0.65rem',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            whiteSpace: 'nowrap',
                                                                            width: '100%'
                                                                        }}
                                                                        title={visita.municipio}
                                                                    >
                                                                        {visita.municipio ? visita.municipio.split(' ')[0] : 'N/D'}
                                                                    </Typography>
                                                                </Box>
                                                            ))}
                                                    </Box>
                                                </Box>
                                            ) : (
                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    minHeight: 80,
                                                    width: '100%'
                                                }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Nenhuma visita registrada no período selecionado.
                                                    </Typography>
                                                </Box>
                                            )}
                                        </InfoSection>

                                        <Divider sx={{ my: 2 }} />

                                        <InfoSection title="Resumo de Visitas">
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Total de visitas:
                                                    </Typography>
                                                    <Typography variant="caption" fontWeight="bold">
                                                        {resumo?.visitasDetalhadas?.length || 0}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Período:
                                                    </Typography>
                                                    <Typography variant="caption" fontWeight="bold">
                                                        {resumo?.visitasDetalhadas && resumo.visitasDetalhadas.length > 0
                                                            ? `${format(addDays(new Date(resumo.visitasDetalhadas[0].data), 1), 'dd/MM/yyyy')} - ${format(addDays(new Date(resumo.visitasDetalhadas[resumo.visitasDetalhadas.length - 1].data), 1), 'dd/MM/yyyy')}`
                                                            : '-'
                                                        }
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </InfoSection>

                                        <Divider sx={{ my: 2 }} />

                                        <InfoSection title="Municípios Visitados">
                                            {resumo?.municipiosVisitados && resumo.municipiosVisitados.length > 0 ? (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {resumo.municipiosVisitados.map((m: string, i: number) => (
                                                        <Chip
                                                            key={`municipio-${m}-${i}`}
                                                            label={m}
                                                            size="small"
                                                            sx={{
                                                                fontSize: '0.7rem',
                                                                height: 24,
                                                                bgcolor: 'success.50',
                                                                color: 'success.800',
                                                                border: '1px solid',
                                                                borderColor: 'success.200'
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Nenhum município no período.
                                                </Typography>
                                            )}
                                        </InfoSection>

                                        <Divider sx={{ my: 2 }} />

                                        <InfoSection title="Equipe Técnica por Base">
                                            {resumo?.equipeTecnicaPorBase && resumo.equipeTecnicaPorBase.length > 0 ? (
                                                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                                                    {resumo.equipeTecnicaPorBase.map((baseEquipe: any, index: number) => (
                                                        <Box key={index} sx={{ mb: 2 }}>
                                                            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'bold' }}>
                                                                {baseEquipe.baseNome}
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                {baseEquipe.equipe.map((membro: string, membroIndex: number) => (
                                                                    <Chip
                                                                        key={`membro-${membro}-${membroIndex}`}
                                                                        label={membro}
                                                                        size="small"
                                                                        sx={{
                                                                            fontSize: '0.7rem',
                                                                            height: 24,
                                                                            bgcolor: 'primary.50',
                                                                            color: 'primary.800',
                                                                            border: '1px solid',
                                                                            borderColor: 'primary.200'
                                                                        }}
                                                                    />
                                                                ))}
                                                            </Box>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Nenhuma equipe registrada.
                                                </Typography>
                                            )}
                                        </InfoSection>
                                    </Paper>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 4, alignItems: 'flex-start', width: '100%' }}>
                                    <Paper variant="outlined" sx={{
                                        flex: 2,
                                        minWidth: { xs: '100%', md: 400 },
                                        p: 3, ...paperStyles
                                    }}>
                                        <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>Planilha Media Tempo Resposta e Prontidão por Cidade</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ p: 1, display: 'block' }}>
                                            * A planilha não segue a data de referência, ela é gerada a partir do ultimo envio.
                                        </Typography>

                                        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }} >
                                            <Table sx={{ minWidth: 300 }}>
                                                <TableHead >
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: "bold" }}>
                                                            Cidade
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: "bold" }}>
                                                            Tempo Resposta Médio
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: "bold" }}>
                                                            Tempo Prontidão Médio
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {dadosFiltrados.map((item, index) => (
                                                        <TableRow
                                                            key={`${item.cidade}-${index}-${item.tempoRespostaMedio}`}
                                                            sx={{
                                                                bgcolor: index % 2 === 0 ? 'background.default' : 'grey.50',
                                                                '&:hover': {
                                                                    bgcolor: 'action.hover'
                                                                }
                                                            }}
                                                        >
                                                            <TableCell sx={{ py: 2 }}>
                                                                <Typography variant="body2" >
                                                                    {item.cidade}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="center" sx={{ py: 2 }}>
                                                                <Chip
                                                                    label={item.tempoRespostaMedio}
                                                                    variant={item.tempoRespostaMedio === "N/A" ? "outlined" : "filled"}
                                                                    size="small"
                                                                />
                                                            </TableCell>
                                                            <TableCell align="center" sx={{ py: 2 }}>
                                                                <Chip
                                                                    label={item.tempoProntidaoMedio}
                                                                    variant={item.tempoProntidaoMedio === "N/A" ? "outlined" : "filled"}
                                                                    size="small"
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>

                                    <Paper variant="outlined" sx={{
                                        flex: 2,
                                        minWidth: { xs: '100%', md: 400 },
                                        p: 3, ...paperStyles
                                    }}>
                                        <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>Planilha Media atividade Viaturas por Cidade</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ p: 1, display: 'block' }}>
                                            * A planilha não segue a data de referência, ela é gerada a partir do ultimo envio.
                                        </Typography>

                                        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }} >
                                            <Table sx={{ minWidth: 650 }}>
                                                <TableHead >
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: "bold" }}>
                                                            Cidade
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: "bold" }}>
                                                            Ativa
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {vtrFiltradas.map((item, index) => (
                                                        <TableRow
                                                            key={item.cidade}
                                                            sx={{
                                                                bgcolor: index % 2 === 0 ? 'background.default' : 'grey.50',
                                                                '&:hover': {
                                                                    bgcolor: 'action.hover'
                                                                }
                                                            }}
                                                        >
                                                            <TableCell sx={{ py: 2 }}>
                                                                <Typography variant="body2" >
                                                                    {item.cidade}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="center" sx={{ py: 2 }}>
                                                                <Chip
                                                                    label={item.ativa.toString().concat("%")}
                                                                    size="small"
                                                                />
                                                            </TableCell>

                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 4 }}>
                                    <Box
                                        sx={{ flex: 1, minWidth: 750, gap: 2, display: 'flex', flexDirection: 'column' }}>
                                        <ChartCard title="Avaliação da Estrutura Física da Base">
                                            <Box sx={{
                                                p: 1.5,
                                                borderRadius: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                textAlign: 'center',
                                                justifyContent: 'center',
                                                gap: 1
                                            }}>
                                                <Typography variant="h5" >
                                                    <b>Média {perBaseConformidade.length === 1 ? 'da base' : 'regional'}:</b> {resumo?.indiceInspecao ? `${resumo.indiceInspecao.toFixed(1)}%` : '—'}
                                                </Typography>

                                            </Box>

                                            {perBaseConformidade.length > 0 ? (
                                                <>
                                                    {perBaseConformidade.length === 1 ? (
                                                        // VISUALIZAÇÃO PARA UMA ÚNICA BASE - GRÁFICO DE PIZZA
                                                        (() => {
                                                            const baseUnica = perBaseConformidade[0];
                                                            const conformidadePorSummary = resumo?.conformidadePorSummary?.[baseUnica.id] || [];

                                                            return (
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                                    {/* Gráfico de Pizza por Summary */}
                                                                    {conformidadePorSummary.length > 0 ? (
                                                                        <>
                                                                            <ResponsiveContainer width="100%" height={300}>
                                                                                <PieChart>
                                                                                    <Pie
                                                                                        data={conformidadePorSummary}
                                                                                        dataKey="porcentagem"
                                                                                        nameKey="summaryNome"
                                                                                        cx="50%"
                                                                                        cy="50%"
                                                                                        outerRadius={100}
                                                                                        labelLine={false}
                                                                                    >
                                                                                        {conformidadePorSummary.map((entry: any, index: number) => (
                                                                                            <Cell
                                                                                                key={`cell-${index}`}
                                                                                                fill={getCorPorSummary(entry.summaryId)}
                                                                                            />
                                                                                        ))}
                                                                                    </Pie>
                                                                                    <Tooltip
                                                                                        formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'Conformidade']}
                                                                                    />
                                                                                    <Legend />
                                                                                </PieChart>
                                                                            </ResponsiveContainer>

                                                                            {/* Tabela de Detalhamento por Categoria */}
                                                                            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                                                                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                                                                    Detalhamento por Categoria
                                                                                </Typography>
                                                                                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                                                                                    <Table>
                                                                                        <TableHead>
                                                                                            <TableRow>
                                                                                                <TableCell><strong>Categoria</strong></TableCell>
                                                                                                <TableCell align="right"><strong>Summary</strong></TableCell>
                                                                                                <TableCell align="right"><strong>Conformidade</strong></TableCell>
                                                                                                <TableCell align="right"><strong>Itens Conformes</strong></TableCell>
                                                                                                <TableCell align="right"><strong>Total de Itens</strong></TableCell>
                                                                                            </TableRow>
                                                                                        </TableHead>
                                                                                        <TableBody>
                                                                                            {conformidadePorSummary.flatMap((summary: any) =>
                                                                                                summary.categorias?.map((categoria: any, catIndex: number) => (
                                                                                                    <TableRow key={`${summary.summaryId}-${catIndex}`}>
                                                                                                        <TableCell>
                                                                                                            <Typography variant="body2">
                                                                                                                {categoria.nome}
                                                                                                            </Typography>
                                                                                                        </TableCell>
                                                                                                        <TableCell align="right">
                                                                                                            <Chip
                                                                                                                label={summary.summaryNome}
                                                                                                                size="small"
                                                                                                                sx={{
                                                                                                                    bgcolor: getCorPorSummary(summary.summaryId),
                                                                                                                    color: 'white',
                                                                                                                    fontSize: '0.7rem',
                                                                                                                    height: 'auto',
                                                                                                                    whiteSpace: 'normal',
                                                                                                                    '& .MuiChip-label': {
                                                                                                                        whiteSpace: 'normal',
                                                                                                                        overflow: 'visible',
                                                                                                                        textOverflow: 'clip',
                                                                                                                    }
                                                                                                                }}
                                                                                                            />
                                                                                                        </TableCell>
                                                                                                        <TableCell align="right">
                                                                                                            <Typography
                                                                                                                variant="body2"
                                                                                                                fontWeight="bold"
                                                                                                                color={categoria.porcentagem >= 80 ? 'success.main' : categoria.porcentagem >= 50 ? 'warning.main' : 'error.main'}
                                                                                                            >
                                                                                                                {categoria.porcentagem.toFixed(1)}%
                                                                                                            </Typography>
                                                                                                        </TableCell>
                                                                                                        <TableCell align="right">
                                                                                                            <Typography variant="body2">
                                                                                                                {categoria.conforme}
                                                                                                            </Typography>
                                                                                                        </TableCell>
                                                                                                        <TableCell align="right">
                                                                                                            <Typography variant="body2">
                                                                                                                {categoria.total}
                                                                                                            </Typography>
                                                                                                        </TableCell>
                                                                                                    </TableRow>
                                                                                                ))
                                                                                            )}
                                                                                        </TableBody>
                                                                                    </Table>
                                                                                </Box>
                                                                            </Paper>
                                                                        </>
                                                                    ) : (
                                                                        <Box sx={{ textAlign: 'center', py: 4 }}>
                                                                            <Typography variant="body1" color="text.secondary">
                                                                                Dados detalhados de conformidade por summary não disponíveis.
                                                                            </Typography>
                                                                        </Box>
                                                                    )}
                                                                </Box>
                                                            );
                                                        })()
                                                    ) : (
                                                        // VISUALIZAÇÃO PARA MÚLTIPLAS BASES
                                                        <>
                                                            <ResponsiveContainer width="100%" height={300}>
                                                                <BarChart
                                                                    data={perBaseConformidade
                                                                        .filter((b: any) => {
                                                                            const avg = Number(b.avg);
                                                                            return !isNaN(avg) && avg >= 0 && avg <= 100;
                                                                        })
                                                                        .map((b: any) => ({
                                                                            name: b.nome?.length > 15 ? `${b.nome.substring(0, 15)}...` : b.nome,
                                                                            'Conformidade': Number((b.avg || 0).toFixed(1))
                                                                        }))}
                                                                    margin={{ top: 5, right: 20, left: -10, bottom: 60 }}
                                                                >
                                                                    <XAxis
                                                                        dataKey="name"
                                                                        angle={-45}
                                                                        textAnchor="end"
                                                                        height={80}
                                                                        tick={{ fontSize: 10 }}
                                                                        interval={0}
                                                                    />
                                                                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                                                                    <Tooltip
                                                                        formatter={(value) => [`${value}%`, 'Conformidade']}
                                                                        labelFormatter={(label) => `Base: ${label}`}
                                                                    />
                                                                    <Bar dataKey="Conformidade" radius={[4, 4, 0, 0]}>
                                                                        {perBaseConformidade
                                                                            .filter((b: any) => {
                                                                                const avg = Number(b.avg);
                                                                                return !isNaN(avg) && avg >= 0 && avg <= 100;
                                                                            })
                                                                            .map((entry: any, idx: number) => {
                                                                                const conformidade = Number(entry.avg);
                                                                                return (
                                                                                    <Cell
                                                                                        key={`cell-${idx}`}
                                                                                        fill={conformidade === 100 ? '#2e7d32' :
                                                                                            conformidade >= 95 ? '#4caf50' :
                                                                                                conformidade >= 90 ? '#8bc34a' :
                                                                                                    conformidade >= 80 ? '#ffc107' :
                                                                                                        conformidade >= 70 ? '#ff9800' : '#f44336'}
                                                                                    />
                                                                                );
                                                                            })
                                                                        }
                                                                    </Bar>
                                                                </BarChart>
                                                            </ResponsiveContainer>

                                                            <Divider sx={{ my: 2 }} />

                                                            {/* TABELA DE DETALHAMENTO POR CATEGORIA */}
                                                            <Paper variant="outlined" sx={{ p: 1, borderRadius: 2 }}>
                                                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                                                    Detalhamento por Categoria
                                                                </Typography>
                                                                <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                                                                    <Table>
                                                                        <TableHead>
                                                                            <TableRow>
                                                                                <TableCell><strong>Base</strong></TableCell>
                                                                                <TableCell><strong>Categoria</strong></TableCell>
                                                                                <TableCell align="right"><strong>Summary</strong></TableCell>
                                                                                <TableCell align="right"><strong>Conformidade</strong></TableCell>
                                                                                <TableCell align="right"><strong>Itens Conformes</strong></TableCell>
                                                                            </TableRow>
                                                                        </TableHead>
                                                                        <TableBody>
                                                                            {perBaseConformidade.map((base: any) => {
                                                                                const conformidadePorSummary = resumo?.conformidadePorSummary?.[base.id] || [];
                                                                                const baseConformidade = Number(base.avg || 0).toFixed(1);
                                                                                const hasData = conformidadePorSummary.some((summary: any) =>
                                                                                    summary.categorias && summary.categorias.length > 0
                                                                                );

                                                                                return (
                                                                                    <>
                                                                                        {/* Linha principal da base */}
                                                                                        <TableRow
                                                                                            key={`base-${base.id}-${Math.random()}`}
                                                                                            sx={{
                                                                                                backgroundColor: 'grey.50',
                                                                                                '&:hover': { backgroundColor: 'grey.100' }
                                                                                            }}
                                                                                        >
                                                                                            <TableCell>
                                                                                                <Typography variant="subtitle1" fontWeight="bold">
                                                                                                    {base.nome}
                                                                                                </Typography>
                                                                                            </TableCell>
                                                                                            <TableCell colSpan={2}>
                                                                                                <Typography variant="body2" color="text.secondary">
                                                                                                    Conformidade Geral: {baseConformidade}%
                                                                                                </Typography>
                                                                                            </TableCell>
                                                                                            <TableCell align="right" colSpan={3} sx={{ color: "transparent" }}>
                                                                                                -
                                                                                            </TableCell>
                                                                                        </TableRow>

                                                                                        {/* Linhas das categorias */}
                                                                                        {hasData ? (
                                                                                            conformidadePorSummary.flatMap((summary: any) =>
                                                                                                summary.categorias?.map((categoria: any, catIndex: number) => (
                                                                                                    <TableRow
                                                                                                        key={`${base.id}-${summary.summaryId}-${catIndex}`}
                                                                                                        sx={{
                                                                                                            borderLeft: `3px solid ${getCorPorSummary(summary.summaryId)}`,
                                                                                                            '&:hover': { backgroundColor: 'action.hover' }
                                                                                                        }}
                                                                                                    >
                                                                                                        <TableCell></TableCell> {/* Célula vazia para alinhar com a base */}
                                                                                                        <TableCell>
                                                                                                            <Typography variant="body2" sx={{ pl: 1 }}>
                                                                                                                {categoria.nome}
                                                                                                            </Typography>
                                                                                                        </TableCell>
                                                                                                        <TableCell align="right">
                                                                                                            <Chip
                                                                                                                label={summary.summaryNome}
                                                                                                                size="small"
                                                                                                                sx={{
                                                                                                                    bgcolor: getCorPorSummary(summary.summaryId),
                                                                                                                    color: 'white',
                                                                                                                    fontSize: '0.7rem',
                                                                                                                    maxWidth: 120
                                                                                                                }}
                                                                                                            />
                                                                                                        </TableCell>
                                                                                                        <TableCell align="right">
                                                                                                            <Typography
                                                                                                                variant="body2"
                                                                                                                fontWeight="bold"
                                                                                                                color={
                                                                                                                    categoria.porcentagem >= 80 ? 'success.main' :
                                                                                                                        categoria.porcentagem >= 50 ? 'warning.main' : 'error.main'
                                                                                                                }
                                                                                                            >
                                                                                                                {categoria.porcentagem.toFixed(1)}%
                                                                                                            </Typography>
                                                                                                        </TableCell>
                                                                                                        <TableCell align="right">
                                                                                                            <Typography variant="body2">
                                                                                                                {categoria.conforme}
                                                                                                            </Typography>
                                                                                                        </TableCell>

                                                                                                    </TableRow>
                                                                                                ))
                                                                                            )
                                                                                        ) : (
                                                                                            <TableRow>
                                                                                                <TableCell></TableCell>
                                                                                                <TableCell colSpan={5}>
                                                                                                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                                                                                                        Nenhuma categoria disponível
                                                                                                    </Typography>
                                                                                                </TableCell>
                                                                                            </TableRow>
                                                                                        )}

                                                                                        {/* Espaçamento entre bases */}
                                                                                        <TableRow>
                                                                                            <TableCell colSpan={6} sx={{ py: 1 }}></TableCell>
                                                                                        </TableRow>
                                                                                    </>
                                                                                );
                                                                            })}
                                                                        </TableBody>
                                                                    </Table>
                                                                </Box>
                                                            </Paper>


                                                            <Divider sx={{ my: 2 }} />
                                                            <Box mt={2} display="flex" flexWrap="wrap" alignItems="center"
                                                                justifyContent="center" gap={2}>
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    flexWrap: 'wrap',
                                                                    gap: 2,
                                                                    justifyContent: 'space-between'
                                                                }}>

                                                                    <Box sx={{
                                                                        p: 1.5,
                                                                        border: '1px solid #eee',
                                                                        borderRadius: 2
                                                                    }}>
                                                                        <Typography variant="body2" sx={{ mb: 1 }}><b>Bases com 100% de conformidade:</b></Typography>
                                                                        {bases100.length > 0 ?
                                                                            <Box sx={{
                                                                                display: 'flex',
                                                                                gap: 1,
                                                                                flexWrap: 'wrap'
                                                                            }}>
                                                                                {bases100.map((b: any) => (
                                                                                    <Chip
                                                                                        key={`base-100-${b.id}-${b.nome}`}
                                                                                        label={b.nome}
                                                                                        color="success"
                                                                                        size="small"
                                                                                    />
                                                                                ))}
                                                                            </Box> :
                                                                            <Typography variant="caption">Nenhuma no período.</Typography>
                                                                        }
                                                                    </Box>
                                                                </Box>
                                                            </Box>
                                                        </>
                                                    )}
                                                </>
                                            ) : (<Placeholder text="Nenhuma conformidade por base encontrada." />)}
                                        </ChartCard>

                                        <ChartCard title={viaturaStatusPorBase.length === 1 ? "Viatura da Base" : "Viatura das Bases"}>
                                            {viaturaStatusPorBase.length === 1 ? (
                                                // VISUALIZAÇÃO PARA UMA ÚNICA BASE
                                                <Box>
                                                    {(() => {
                                                        const baseUnica = viaturaStatusPorBase[0];
                                                        const baseId = baseUnica.baseId;
                                                        const temChecklist = basesComChecklist.includes(baseId);
                                                        const viaturasDaBase = viaturasPorBase[baseId] || [];

                                                        return (
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                                {/* Status do Checklist */}
                                                                <Paper variant="outlined" sx={{
                                                                    p: 3,
                                                                    borderRadius: 2,
                                                                    borderLeft: `4px solid ${temChecklist ? '#4caf50' : '#f44336'}`
                                                                }}>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                                        {temChecklist ? (
                                                                            <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 40 }} />
                                                                        ) : (
                                                                            <ErrorOutlineIcon sx={{ color: '#f44336', fontSize: 40 }} />
                                                                        )}
                                                                        <Box>
                                                                            <Typography variant="h6" fontWeight="bold">
                                                                                {temChecklist ? 'Checklist Preenchido' : 'Checklist Não Preenchido'}
                                                                            </Typography>
                                                                            <Typography variant="body2" color="text.secondary">
                                                                                {baseUnica.baseNome}
                                                                            </Typography>
                                                                        </Box>
                                                                    </Box>

                                                                    {temChecklist && viaturasDaBase.length > 0 && (
                                                                        <Box sx={{ mt: 2 }}>
                                                                            <Typography variant="body2" fontWeight="medium" gutterBottom>
                                                                                Data do último preenchimento:
                                                                            </Typography>
                                                                            <Typography variant="body1">
                                                                                {(() => {
                                                                                    // Encontrar a data mais recente de preenchimento
                                                                                    const datasPreenchimento = viaturasDaBase
                                                                                        .map((v: Viatura) => new Date(v.dataUltimaAlteracao));

                                                                                    if (datasPreenchimento.length > 0) {
                                                                                        const dataMaisRecente = new Date(Math.max(...datasPreenchimento.map((d: any) => d.getTime())));
                                                                                        dataMaisRecente.setDate(dataMaisRecente.getDate() + 1);
                                                                                        return format(dataMaisRecente, 'dd/MM/yyyy');
                                                                                    }
                                                                                    return 'Data não disponível';
                                                                                })()}
                                                                            </Typography>
                                                                        </Box>
                                                                    )}
                                                                </Paper>

                                                                {/* Resumo de Viaturas - SIMPLIFICADO */}
                                                                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                                                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                                                        Resumo de Viaturas
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                                                                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e9', borderRadius: 2, minWidth: 120 }}>
                                                                            <Typography variant="h4" fontWeight="bold" color="#2e7d32">
                                                                                {baseUnica.status.operacional}
                                                                            </Typography>
                                                                            <Typography variant="body2" color="text.secondary">
                                                                                Operacionais
                                                                            </Typography>
                                                                        </Box>
                                                                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 2, minWidth: 120 }}>
                                                                            <Typography variant="h4" fontWeight="bold" color="#757575">
                                                                                {baseUnica.status.indefinido}
                                                                            </Typography>
                                                                            <Typography variant="body2" color="text.secondary">
                                                                                Indefinidos
                                                                            </Typography>
                                                                        </Box>
                                                                    </Box>
                                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                                                                        Total: {baseUnica.status.operacional + baseUnica.status.indefinido} viaturas
                                                                    </Typography>
                                                                </Paper>

                                                                {/* Lista Detalhada de Viaturas */}
                                                                {viaturasDaBase.length > 0 ? (
                                                                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                                                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                                                            Viaturas da Base ({viaturasDaBase.length})
                                                                        </Typography>
                                                                        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                                                                            {viaturasDaBase.map((viatura: Viatura, index: number) => (
                                                                                <Box
                                                                                    key={index}
                                                                                    sx={{
                                                                                        display: 'flex',
                                                                                        justifyContent: 'space-between',
                                                                                        alignItems: 'center',
                                                                                        p: 2,
                                                                                        borderBottom: index < viaturasDaBase.length - 1 ? '1px solid #eee' : 'none',
                                                                                        '&:hover': { bgcolor: '#fafafa' }
                                                                                    }}
                                                                                >
                                                                                    <Box>
                                                                                        <Typography variant="body1" fontWeight="medium">
                                                                                            {viatura.placa || `Viatura ${viatura.id}`}
                                                                                        </Typography>
                                                                                        <Typography variant="caption" color="text.secondary">
                                                                                            KM: {viatura.km || 'Não informado'} •
                                                                                            Última atualização:{(() => {
                                                                                                const data = new Date(viatura.dataUltimaAlteracao);
                                                                                                data.setDate(data.getDate() + 1);
                                                                                                if (data.getFullYear() < 2001) return ' Não disponível';
                                                                                                return format(data, 'dd/MM/yyyy');
                                                                                            })()}
                                                                                        </Typography>
                                                                                    </Box>
                                                                                    <Chip
                                                                                        label={viatura.statusOperacional}
                                                                                        color={viatura.statusOperacional === 'Operacional' ? 'success' : 'default'}
                                                                                        size="small"
                                                                                    />

                                                                                </Box>
                                                                            ))}
                                                                        </Box>
                                                                    </Paper>
                                                                ) : (
                                                                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                                                                        <Typography variant="body1" color="text.secondary">
                                                                            Nenhuma viatura encontrada para esta base.
                                                                        </Typography>
                                                                    </Paper>
                                                                )}
                                                            </Box>
                                                        );
                                                    })()}
                                                </Box>
                                            ) : (
                                                // VISUALIZAÇÃO ORIGINAL PARA MÚLTIPLAS BASES (SIMPLIFICADA)
                                                <Box>
                                                    {/* Cards de status do checklist */}
                                                    <Box mt={2} sx={{ width: '100%' }}>
                                                        <Typography variant="body2" fontWeight="bold" sx={{ mb: 2 }}>Status do Checklist</Typography>
                                                        <Box sx={{
                                                            display: 'grid',
                                                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                                            gap: 2
                                                        }}>
                                                            {/* Card: Bases com checklist preenchido */}
                                                            <Paper variant="outlined" sx={{
                                                                p: 2,
                                                                borderRadius: 2,
                                                                borderLeft: '4px solid #4caf50'
                                                            }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                                    <CheckCircleIcon sx={{ color: '#4caf50' }} />
                                                                    <Typography variant="subtitle2" fontWeight="bold">Bases com Checklist Preenchido</Typography>
                                                                </Box>
                                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                                    Bases que registraram quilometragem recentemente
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                    {basesComChecklist.length > 0 ? (
                                                                        basesComChecklist.map((idBase: number) => {
                                                                            const base = basesList.find((b: any) => b.id === idBase);
                                                                            const baseStatus = viaturaStatusPorBase.find((b: any) => b.baseId === idBase);
                                                                            return (
                                                                                <Box key={idBase} sx={{
                                                                                    display: 'flex',
                                                                                    justifyContent: 'space-between',
                                                                                    alignItems: 'center'
                                                                                }}>
                                                                                    <Typography variant="body2">{base?.nome || `Base ${idBase}`}</Typography>
                                                                                    {baseStatus && (
                                                                                        <Chip
                                                                                            size="small"
                                                                                            label={`${baseStatus.status.operacional} operantes` + (baseStatus.status.indefinido ? ` (${baseStatus.status.indefinido} indefinidas)` : '')}
                                                                                            color="success"
                                                                                            variant="outlined"
                                                                                        />
                                                                                    )}
                                                                                </Box>
                                                                            );
                                                                        })
                                                                    ) : (
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            Nenhuma base preencheu o checklist recentemente
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            </Paper>

                                                            {/* Card: Bases sem checklist preenchido */}
                                                            <Paper variant="outlined" sx={{
                                                                p: 2,
                                                                borderRadius: 2,
                                                                borderLeft: '4px solid #f44336'
                                                            }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                                    <ErrorOutlineIcon sx={{ color: '#f44336' }} />
                                                                    <Typography variant="subtitle2" fontWeight="bold">Bases sem Checklist Preenchido</Typography>
                                                                </Box>
                                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                                    Bases sem registro de quilometragem recente
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                    {basesList.filter((base: any) => !basesComChecklist.includes(base.id)).length > 0 ? (
                                                                        basesList.filter((base: any) => !basesComChecklist.includes(base.id)).map((base: any) => {

                                                                            const baseStatus = viaturaStatusPorBase.find((b: any) => b.baseId === base.id);

                                                                            return (
                                                                                <Box key={base.id} sx={{
                                                                                    display: 'flex',
                                                                                    justifyContent: 'space-between',
                                                                                    alignItems: 'center'
                                                                                }}>
                                                                                    <Typography variant="body2">{base.nome}</Typography>
                                                                                    <Chip
                                                                                        size="small"
                                                                                        label={baseStatus ? `${baseStatus.status.indefinido} indefinidas` : 'Sem viaturas'}
                                                                                        color="error"
                                                                                        variant="outlined"
                                                                                    />
                                                                                </Box>
                                                                            );
                                                                        })
                                                                    ) : (
                                                                        <Typography variant="body2" color="success.main">
                                                                            Todas as bases preencheram o checklist!
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            </Paper>
                                                        </Box>
                                                    </Box>

                                                    <Divider sx={{ my: 2 }} />

                                                    {/* Gráfico simplificado de status das viaturas */}
                                                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>Status das Viaturas por Base</Typography>
                                                    <ResponsiveContainer width="100%" height={300}>
                                                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 60 }}>
                                                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} interval={0} />
                                                            <YAxis />
                                                            <Tooltip />
                                                            <Legend />
                                                            <Bar dataKey="Operacional" fill="#4caf50" name="Viaturas Operacionais" />
                                                            <Bar dataKey="Indefinido" fill="#f21c24" name="Viaturas Indefinidas" />

                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </Box>
                                            )}
                                        </ChartCard>

                                    </Box>

                                    <ChartCard title="Padronização Visual">
                                        <Box sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            justifyContent: 'center',
                                            gap: 1
                                        }}>
                                            <Typography variant="h5" >
                                                <b>Média {perBaseConformidade.length === 1 ? 'da base' : 'regional'}:</b> {resumo?.indicePadronizacao ? `${resumo.indicePadronizacao.toFixed(1)}%` : '—'}
                                            </Typography>

                                        </Box>
                                        {padronizacaoByBaseLastVisit.length > 0 ? (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                                                {/* GRÁFICO CONDICIONAL - PIZZA PARA 1 BASE, BARRAS PARA MÚLTIPLAS BASES */}
                                                {padronizacaoByBaseLastVisit.length === 1 ? (
                                                    // GRÁFICO DE PIZZA PARA UMA ÚNICA BASE
                                                    (() => {
                                                        const baseUnica = padronizacaoByBaseLastVisit[0];
                                                        const dataPizza = [
                                                            { name: 'Conforme', value: Number(baseUnica.conforme), fill: '#4caf50' },
                                                            { name: 'Não Conforme', value: Number(baseUnica.naoConforme), fill: '#f44336' },
                                                            { name: 'Não Avaliado', value: Number(baseUnica.naoAvaliado), fill: '#9e9e9e' }
                                                        ].filter(item => item.value > 0); // Filtra para mostrar apenas categorias com valores > 0

                                                        return (
                                                            <Box sx={{ width: '100%', textAlign: 'center' }}>
                                                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                                                    {baseUnica.name}
                                                                </Typography>
                                                                <ResponsiveContainer width="100%" height={300}>
                                                                    <PieChart>
                                                                        <Pie
                                                                            data={dataPizza}
                                                                            dataKey="value"
                                                                            nameKey="name"
                                                                            cx="50%"
                                                                            cy="50%"
                                                                            outerRadius={100}
                                                                            label={({ name, value }) => `${name}: ${(value as number).toFixed(1)}%`}
                                                                            labelLine={false}
                                                                        >
                                                                            {dataPizza.map((entry, index) => (
                                                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                                                            ))}
                                                                        </Pie>
                                                                        <Tooltip
                                                                            formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Percentual']}
                                                                        />
                                                                        <Legend />
                                                                    </PieChart>
                                                                </ResponsiveContainer>
                                                            </Box>
                                                        );
                                                    })()
                                                ) : (
                                                    // GRÁFICO DE BARRAS PARA MÚLTIPLAS BASES (ORIGINAL)
                                                    <ResponsiveContainer width="100%" height={300}>
                                                        <BarChart data={padronizacaoByBaseLastVisit}
                                                            margin={{ top: 5, right: 20, left: -10, bottom: 60 }}>
                                                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80}
                                                                tick={{ fontSize: 12 }} interval={0} />
                                                            <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                                                            <Tooltip />
                                                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '50px' }} />
                                                            <Bar dataKey="conforme" stackId="a" fill="#4caf50"
                                                                name="Conforme" radius={[4, 4, 0, 0]} />
                                                            <Bar dataKey="naoConforme" stackId="a" fill="#f44336"
                                                                name="Não Conforme" />
                                                            <Bar dataKey="naoAvaliado" stackId="a" fill="#9e9e9e"
                                                                name="Não Avaliado" radius={[4, 4, 0, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                )}

                                                <Divider sx={{ my: 2 }} />

                                                {/* SEÇÃO DE PERCENTUAIS - MANTIDA PARA AMBOS OS CASOS */}
                                                <Box mt={2} sx={{ width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                                                        {padronizacaoByBaseLastVisit.length === 1 ? 'Percentuais da base' : 'Percentuais por base (última visita)'}
                                                    </Typography>
                                                    <Box sx={{
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                                        gap: 2
                                                    }}>
                                                        {padronizacaoByBaseLastVisit.map((b: any) => (
                                                            <Box key={b.id} sx={{
                                                                p: 1.5,
                                                                border: '1px solid #eee',
                                                                borderRadius: 2
                                                            }}>
                                                                <Typography variant="subtitle2" noWrap
                                                                    title={b.name}>{b.name}</Typography>
                                                                <Stack direction="row" flexWrap="wrap" gap={0.5} mt={1}>
                                                                    <Chip size="small"
                                                                        label={`${Number(b.conforme).toFixed(1)}%`}
                                                                        sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                                                                    <Chip size="small"
                                                                        label={`${Number(b.naoConforme).toFixed(1)}%`}
                                                                        sx={{ bgcolor: '#ffebee', color: '#c62828' }} />
                                                                    <Chip size="small"
                                                                        label={`${Number(b.naoAvaliado).toFixed(1)}%`}
                                                                        sx={{ bgcolor: '#f5f5f5', color: '#616161' }} />
                                                                </Stack>
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                </Box>

                                                <Divider sx={{ my: 2 }} />

                                                {/* SEÇÃO DE CATEGORIAS - MANTIDA PARA AMBOS OS CASOS */}
                                                <Box mt={1} sx={{ width: '100%' }}>
                                                    {(() => {
                                                        const entries = Object.entries(categoriesMap);
                                                        if (entries.length === 0) {
                                                            return <Typography variant="caption" color="text.secondary">Nenhuma
                                                                categoria avaliada na última visita.</Typography>;
                                                        }

                                                        return entries.map(([catNome, basesArr]) => (
                                                            <Box key={catNome} sx={{ mb: 3 }}>
                                                                <Typography variant="subtitle1" fontWeight={600}
                                                                    sx={{ mb: 1 }}>{catNome}</Typography>

                                                                <Box sx={{
                                                                    display: 'grid',
                                                                    gap: 2,
                                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))'
                                                                }}>
                                                                    {basesArr.map((bt: any) => {
                                                                        const chip = getChipProps(bt.status);
                                                                        return (
                                                                            <Paper key={`${catNome}-${bt.baseId}`}
                                                                                variant="outlined" sx={{
                                                                                    p: 1.25,
                                                                                    display: 'flex',
                                                                                    flexDirection: 'column',
                                                                                    gap: 1, ...paperStyles
                                                                                }}>
                                                                                <Box sx={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: 1,
                                                                                    justifyContent: 'space-between'
                                                                                }}>
                                                                                    <Typography variant="subtitle2"
                                                                                        noWrap
                                                                                        title={bt.baseName}>{bt.baseName}</Typography>
                                                                                    <Chip label={chip.label}
                                                                                        color={chip.color as any}
                                                                                        size="small" sx={chip.sx} />
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
                                        ) : (
                                            <Placeholder text="Nenhum dado de padronização encontrado na última visita." />
                                        )}
                                    </ChartCard>
                                    {/* Seção de Relatos - AGORA ABAIXO DA PADRONIZAÇÃO */}
                                    <Box sx={{ width: '100%', mt: 4 }}>
                                        <Paper variant="outlined" sx={{
                                            p: 3,
                                            ...paperStyles
                                        }}>
                                            <Typography variant="h6" gutterBottom>Relatos das Equipes</Typography>

                                            {(() => {


                                                return (
                                                    <>

                                                        {/* Opcional: manter os relatos detalhados em um accordion abaixo */}
                                                        {relatos.length > 0 ? (
                                                            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                                                                {relatos.map((r: any) => (
                                                                    <Accordion key={r.id} variant="outlined" sx={{
                                                                        boxShadow: 'none',
                                                                        '&:before': { display: 'none' },
                                                                        my: 0.5,
                                                                        borderRadius: 3,
                                                                        borderLeft: '6px solid #430000'
                                                                    }}>
                                                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                                            <Typography sx={{
                                                                                flexShrink: 0,
                                                                                mr: 2,
                                                                                fontWeight: 500
                                                                            }}>
                                                                                {r.tema} - {basesList.find((base: any) => base.id === r.baseId)?.nome || r.baseId}
                                                                            </Typography>
                                                                            <Typography sx={{
                                                                                color: 'text.secondary',
                                                                                ml: 'auto'
                                                                            }}>
                                                                                {r.autor} — {format(addDays(new Date(r.data), 1), 'dd/MM/yyyy')}
                                                                            </Typography>
                                                                        </AccordionSummary>
                                                                        <AccordionDetails>
                                                                            <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                                                                                {r.mensagem}
                                                                            </Typography>
                                                                        </AccordionDetails>
                                                                    </Accordion>
                                                                ))}
                                                            </Box>
                                                        ) : (
                                                            <Placeholder text="Nenhum relato encontrado." />
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </Paper>
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