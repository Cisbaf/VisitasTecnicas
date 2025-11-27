"use client";

import React, { useEffect, useMemo, useState } from 'react';
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
import { WordcloudRelatos } from './hooks/useWordCloud';

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
            '#FF8042',
            '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1',
            '#D084D0', '#FF7C7C', '#A4DE6C', '#D0ED57',
            '#0088FE', '#00C49F', '#FFBB28',
        ];
        return cores[summaryId % cores.length + 1];
    };

    const processedData = padronizacaoByBaseLastVisit.map((item: any) => {
        const total = item.conforme + item.naoConforme;
        const conformidade = total > 0 ? (item.conforme / total) * 100 : 0;
        return {
            name: item.name?.length > 15 ? `${item.name.substring(0, 15)}...` : item.name,
            conformidade: Number(conformidade.toFixed(1))
        };
    });


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
                                                    position: 'relative'
                                                }}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        justifyContent: 'space-between',
                                                        gap: 1,
                                                        width: '100%',
                                                        px: 1,
                                                        minHeight: 60,
                                                        position: 'relative',
                                                        zIndex: 2
                                                    }}>

                                                        {/* Linha horizontal */}
                                                        <Box sx={{
                                                            position: 'absolute',
                                                            top: '8px',
                                                            left: 0,
                                                            right: 0,
                                                            transform: 'translateY(-50%)',
                                                            height: 2,
                                                            bgcolor: 'primary.main',
                                                            width: '100%',
                                                            zIndex: 1
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
                                                                        maxWidth: 100
                                                                    }}
                                                                >
                                                                    {/* Bolinha com Tooltip */}
                                                                    <MuiTooltip
                                                                        title={
                                                                            <Box sx={{ p: 1, maxWidth: 300 }}>
                                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                                    {/* Município e Tipo na mesma linha */}
                                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                                                                        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                                                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '12px' }}>
                                                                                                Município
                                                                                            </Typography>
                                                                                            <Typography variant="body2" sx={{ fontSize: '12px' }}>
                                                                                                {visita.baseNome}
                                                                                            </Typography>
                                                                                        </Box>
                                                                                        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                                                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '12px' }}>
                                                                                                Tipo
                                                                                            </Typography>
                                                                                            <Typography variant="body2" sx={{ fontSize: '12px' }}>
                                                                                                {visita.tipo || 'N/D'}
                                                                                            </Typography>
                                                                                        </Box>
                                                                                    </Box>

                                                                                    {visita.relatos != null && visita.relatos.length > 0 && (
                                                                                        <>
                                                                                            {/* Motivo */}
                                                                                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '12px' }}>
                                                                                                    Motivo
                                                                                                </Typography>
                                                                                                <Typography variant="body2" sx={{ fontSize: '12px', wordBreak: 'break-word' }}>
                                                                                                    {visita.relatos[0]?.tema || 'N/D'}
                                                                                                </Typography>
                                                                                            </Box>

                                                                                            {/* Descrição com scroll se necessário */}
                                                                                            <Box sx={{
                                                                                                maxHeight: 80,
                                                                                                overflowY: 'auto',
                                                                                                wordBreak: 'break-word',
                                                                                                // Estilo para a barra de scroll no Webkit
                                                                                                '&::-webkit-scrollbar': {
                                                                                                    width: '6px',
                                                                                                },
                                                                                                '&::-webkit-scrollbar-track': {
                                                                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                                                                },
                                                                                                '&::-webkit-scrollbar-thumb': {
                                                                                                    background: 'rgba(255, 255, 255, 0.3)',
                                                                                                    borderRadius: '3px',
                                                                                                },
                                                                                                // Para Firefox
                                                                                                scrollbarWidth: 'thin',
                                                                                                scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)',
                                                                                            }}>
                                                                                                <Typography variant="body2" sx={{ fontSize: '12px', color: 'wight' }}>
                                                                                                    {visita.relatos[0]?.mensagem || 'N/D'}
                                                                                                </Typography>
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
                                                                                    maxWidth: 320, // Limita a largura máxima
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
                                                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                                                    {resumo.equipeTecnicaPorBase.map((baseEquipe: any, index: number) => (
                                                        <Box key={index} sx={{ mb: 2 }}>
                                                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                                                {baseEquipe.baseNome}
                                                            </Typography>

                                                            {baseEquipe.equipePorData && baseEquipe.equipePorData.map((grupoData: any, dataIndex: number) => (
                                                                <Box key={dataIndex} sx={{ mb: 1.5 }}>
                                                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                                                                        {new Date(grupoData.data).toLocaleDateString('pt-BR')}:
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                        {grupoData.membros.map((membro: string, membroIndex: number) => (
                                                                            <Chip
                                                                                key={`membro-${dataIndex}-${membroIndex}`}
                                                                                label={membro}
                                                                                size="small"
                                                                                sx={{
                                                                                    fontSize: '0.8rem',
                                                                                    height: 30,
                                                                                    bgcolor: 'grey.100',
                                                                                    color: 'text.primary',
                                                                                }}
                                                                            />
                                                                        ))}
                                                                    </Box>
                                                                </Box>
                                                            ))}
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
                                        <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>Planilha Media Tempo Resposta e Prontidão por Município</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ p: 1, display: 'block' }}>
                                            * A planilha não segue a data de referência, ela é gerada a partir do ultimo envio.
                                        </Typography>

                                        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }} >
                                            <Table sx={{ minWidth: 300 }}>
                                                <TableHead >
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: "bold" }}>
                                                            Município
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
                                                                bgcolor: index % 2 === 0 ? 'background.default' : 'grey.100',
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
                                        <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>Planilha Media atividade Viaturas por Município</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ p: 1, display: 'block' }}>
                                            * A planilha não segue a data de referência, ela é gerada a partir do ultimo envio.
                                        </Typography>

                                        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }} >
                                            <Table sx={{ minWidth: 650 }}>
                                                <TableHead >
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: "bold" }}>
                                                            Município
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
                                                                bgcolor: index % 2 === 0 ? 'background.default' : 'grey.100',
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
                                {resumo?.camposNaoConformes &&
                                    resumo.camposNaoConformes[baseId ?? perBaseConformidade?.[0]?.id] &&
                                    resumo.camposNaoConformes[baseId ?? perBaseConformidade?.[0]?.id].length > 0 && (
                                        <Box sx={{ width: '100%', mt: 4, mb: 4 }}>
                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    p: 3,
                                                    ...paperStyles,
                                                    borderTop: '4px solid',
                                                    borderTopColor: 'error.main'
                                                }}
                                            >
                                                {/* Cabeçalho da Seção */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Box sx={{
                                                            bgcolor: 'error.50',
                                                            p: 1,
                                                            borderRadius: '50%',
                                                            display: 'flex'
                                                        }}>
                                                            <ErrorOutlineIcon color="error" />
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="h6" fontWeight="bold" color="text.primary">
                                                                Itens Não Conformes
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Lista de itens que precisam de atenção nesta base.
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <Chip
                                                        label={`${resumo.camposNaoConformes[baseId ?? perBaseConformidade?.[0]?.id].length} pendências`}
                                                        color="error"
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ fontWeight: 'bold' }}
                                                    />
                                                </Box>

                                                <Divider sx={{ mb: 3 }} />

                                                {/* Container com scroll condicional */}
                                                <Box sx={{
                                                    maxHeight: resumo.camposNaoConformes[baseId ?? perBaseConformidade?.[0]?.id].length > 16 ? '400px' : 'none',
                                                    overflowY: resumo.camposNaoConformes[baseId ?? perBaseConformidade?.[0]?.id].length > 16 ? 'auto' : 'visible',
                                                    pr: resumo.camposNaoConformes[baseId ?? perBaseConformidade?.[0]?.id].length > 16 ? 1 : 0,

                                                    // Estilo da scrollbar para Webkit
                                                    '&::-webkit-scrollbar': {
                                                        width: '8px',
                                                    },
                                                    '&::-webkit-scrollbar-track': {
                                                        background: 'rgba(0, 0, 0, 0.05)',
                                                        borderRadius: '4px',
                                                    },
                                                    '&::-webkit-scrollbar-thumb': {
                                                        background: 'rgba(244, 67, 54, 0.3)',
                                                        borderRadius: '4px',
                                                        '&:hover': {
                                                            background: 'rgba(244, 67, 54, 0.5)',
                                                        }
                                                    },

                                                    // Para Firefox
                                                    scrollbarWidth: 'thin',
                                                    scrollbarColor: 'rgba(244, 67, 54, 0.3) rgba(0, 0, 0, 0.05)',
                                                }}>
                                                    {/* Grid de Itens */}
                                                    <Box sx={{
                                                        display: 'grid',
                                                        gridTemplateColumns: {
                                                            xs: '1fr',
                                                            sm: '1fr 1fr',
                                                            md: '1fr 1fr 1fr 1fr'
                                                        },
                                                        gap: 2
                                                    }}>
                                                        {resumo.camposNaoConformes[baseId ?? perBaseConformidade?.[0]?.id].map((campo: any, index: number) => (
                                                            <Paper
                                                                key={index}
                                                                variant="outlined"
                                                                sx={{
                                                                    p: 1.5,
                                                                    borderLeft: '3px solid',
                                                                    borderColor: 'error.main',
                                                                    bgcolor: 'error.50',
                                                                    borderRadius: '0 6px 6px 0',
                                                                    transition: 'all 0.2s ease',
                                                                    '&:hover': {
                                                                        bgcolor: 'error.100',
                                                                        transform: 'translateX(2px)'
                                                                    }
                                                                }}
                                                            >
                                                                <Typography variant="body2" color="error.800" sx={{ lineHeight: 1.3 }}>
                                                                    {campo.titulo}
                                                                </Typography>
                                                            </Paper>
                                                        ))}
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        </Box>
                                    )}

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

                                                                                {conformidadePorSummary.length > 0 ? (
                                                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                                                                                        {conformidadePorSummary.map((summary: any) => {
                                                                                            // Remover categorias duplicadas dentro do mesmo summary
                                                                                            const categoriasUnicas = summary.categorias?.filter((categoria: any, index: number, self: any[]) =>
                                                                                                index === self.findIndex((c: any) => c.nome === categoria.nome)
                                                                                            ) || [];

                                                                                            return (
                                                                                                <Paper key={`summary-${summary.summaryId}`} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                                                                                    {/* Header do Summary */}
                                                                                                    <Box sx={{
                                                                                                        display: 'flex',
                                                                                                        alignItems: 'center',
                                                                                                        gap: 1,
                                                                                                        mb: 2,
                                                                                                        p: 1,
                                                                                                        bgcolor: `${getCorPorSummary(summary.summaryId)}20`,
                                                                                                        borderRadius: 1
                                                                                                    }}>
                                                                                                        <Box
                                                                                                            sx={{
                                                                                                                width: 12,
                                                                                                                height: 12,
                                                                                                                borderRadius: '50%',
                                                                                                                bgcolor: getCorPorSummary(summary.summaryId)
                                                                                                            }}
                                                                                                        />
                                                                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                                                                            {summary.summaryNome}
                                                                                                        </Typography>
                                                                                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                                                                                                            {categoriasUnicas.length} categorias • {summary.porcentagem.toFixed(1)}% conformidade
                                                                                                        </Typography>
                                                                                                    </Box>

                                                                                                    {/* Categorias do Summary*/}
                                                                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                                                                                                        {categoriasUnicas.map((categoria: any, index: number) => {
                                                                                                            // Para inspeção, temos apenas Conforme e Não Conforme
                                                                                                            const totalCategoria = categoria.total;
                                                                                                            const naoConforme = categoria.total - categoria.conforme;

                                                                                                            const dadosGrafico = [
                                                                                                                {
                                                                                                                    name: 'Conforme',
                                                                                                                    value: categoria.conforme,
                                                                                                                    porcentagem: totalCategoria > 0 ? (categoria.conforme / totalCategoria) * 100 : 0,
                                                                                                                    fill: '#4caf50'
                                                                                                                },
                                                                                                                {
                                                                                                                    name: 'Não Conforme',
                                                                                                                    value: naoConforme,
                                                                                                                    porcentagem: totalCategoria > 0 ? (naoConforme / totalCategoria) * 100 : 0,
                                                                                                                    fill: '#f44336'
                                                                                                                }
                                                                                                            ].filter(item => item.value > 0);

                                                                                                            return (
                                                                                                                <Paper
                                                                                                                    key={`category-${summary.summaryId}-${categoria.nome}-${index}`}
                                                                                                                    variant="outlined"
                                                                                                                    sx={{
                                                                                                                        p: 2,
                                                                                                                        borderRadius: 2,
                                                                                                                        width: '100%'
                                                                                                                    }}
                                                                                                                >
                                                                                                                    {/* Header da Categoria */}
                                                                                                                    <Box sx={{
                                                                                                                        display: 'flex',
                                                                                                                        alignItems: 'center',
                                                                                                                        gap: 1,
                                                                                                                        mb: 2,
                                                                                                                        p: 1,
                                                                                                                        bgcolor: `${getCorPorSummary(summary.summaryId)}10`,
                                                                                                                        borderRadius: 1
                                                                                                                    }}>
                                                                                                                        <Box
                                                                                                                            sx={{
                                                                                                                                width: 12,
                                                                                                                                height: 12,
                                                                                                                                borderRadius: '50%',
                                                                                                                                bgcolor: getCorPorSummary(summary.summaryId)
                                                                                                                            }}
                                                                                                                        />
                                                                                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                                                                                            {categoria.nome}
                                                                                                                        </Typography>
                                                                                                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                                                                                                                            {categoria.porcentagem.toFixed(1)}% de conformidade
                                                                                                                        </Typography>
                                                                                                                    </Box>

                                                                                                                    {/* Gráfico de Barras Horizontal */}
                                                                                                                    <ResponsiveContainer width="100%" height={80}>
                                                                                                                        <BarChart
                                                                                                                            data={dadosGrafico}
                                                                                                                            layout="vertical"
                                                                                                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                                                                                        >
                                                                                                                            <XAxis
                                                                                                                                type="number"
                                                                                                                                domain={[0, 100]}
                                                                                                                                tick={{ fontSize: 12 }}
                                                                                                                                tickFormatter={(value) => `${value}%`}
                                                                                                                            />
                                                                                                                            <YAxis
                                                                                                                                type="category"
                                                                                                                                dataKey="name"
                                                                                                                                tick={{ fontSize: 12 }}
                                                                                                                                width={80}
                                                                                                                            />
                                                                                                                            <Tooltip
                                                                                                                                formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Percentual']}
                                                                                                                                labelFormatter={(label) => `${label}`}
                                                                                                                            />
                                                                                                                            <Bar
                                                                                                                                dataKey="porcentagem"
                                                                                                                                name="Percentual"
                                                                                                                                radius={[0, 4, 4, 0]}
                                                                                                                            >
                                                                                                                                {dadosGrafico.map((entry, barIndex) => (
                                                                                                                                    <Cell key={`cell-${barIndex}`} fill={entry.fill} />
                                                                                                                                ))}
                                                                                                                            </Bar>
                                                                                                                        </BarChart>
                                                                                                                    </ResponsiveContainer>

                                                                                                                    {/* Tabela com Dados Detalhados */}
                                                                                                                    <Box sx={{ mt: 2, width: '100%' }}>
                                                                                                                        <Table size="small" sx={{ width: '100%' }}>
                                                                                                                            <TableHead>
                                                                                                                                <TableRow>
                                                                                                                                    <TableCell sx={{ width: '50%' }}><strong>Status</strong></TableCell>
                                                                                                                                    <TableCell align="center" sx={{ width: '25%' }}><strong>Percentual</strong></TableCell>
                                                                                                                                    <TableCell align="center" sx={{ width: '25%' }}><strong>Quantidade</strong></TableCell>
                                                                                                                                </TableRow>
                                                                                                                            </TableHead>
                                                                                                                            <TableBody>
                                                                                                                                {dadosGrafico.map((item, itemIndex) => (
                                                                                                                                    <TableRow
                                                                                                                                        key={`row-${itemIndex}`}
                                                                                                                                        sx={{
                                                                                                                                            '&:hover': { backgroundColor: 'action.hover' },
                                                                                                                                            borderLeft: `3px solid ${item.fill}`
                                                                                                                                        }}
                                                                                                                                    >
                                                                                                                                        <TableCell sx={{ width: '50%' }}>
                                                                                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                                                                                <Box
                                                                                                                                                    sx={{
                                                                                                                                                        width: 12,
                                                                                                                                                        height: 12,
                                                                                                                                                        borderRadius: '50%',
                                                                                                                                                        bgcolor: item.fill
                                                                                                                                                    }}
                                                                                                                                                />
                                                                                                                                                <Typography variant="body2" fontWeight="medium">
                                                                                                                                                    {item.name}
                                                                                                                                                </Typography>
                                                                                                                                            </Box>
                                                                                                                                        </TableCell>
                                                                                                                                        <TableCell align="center" sx={{ width: '25%' }}>
                                                                                                                                            <Typography
                                                                                                                                                variant="body2"
                                                                                                                                                fontWeight="bold"
                                                                                                                                                color="text.primary"
                                                                                                                                            >
                                                                                                                                                {item.porcentagem.toFixed(1)}%
                                                                                                                                            </Typography>
                                                                                                                                        </TableCell>
                                                                                                                                        <TableCell align="center" sx={{ width: '25%' }}>
                                                                                                                                            <Typography
                                                                                                                                                variant="body2"
                                                                                                                                                color="text.secondary"
                                                                                                                                            >
                                                                                                                                                {item.value} {item.value === 1 ? 'item' : 'itens'}
                                                                                                                                            </Typography>
                                                                                                                                        </TableCell>
                                                                                                                                    </TableRow>
                                                                                                                                ))}
                                                                                                                            </TableBody>
                                                                                                                        </Table>
                                                                                                                    </Box>

                                                                                                                </Paper>

                                                                                                            );
                                                                                                        })}

                                                                                                    </Box>
                                                                                                </Paper>
                                                                                            );
                                                                                        })}

                                                                                    </Box>
                                                                                ) : (
                                                                                    <Box sx={{ textAlign: 'center', py: 4, width: '100%' }}>
                                                                                        <Typography variant="body1" color="text.secondary">
                                                                                            Nenhum dado de categoria disponível.
                                                                                        </Typography>
                                                                                    </Box>
                                                                                )}
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


                                                            {/* TABELA DE DETALHAMENTO POR CATEGORIA */}

                                                            {(() => {
                                                                // Transformar os dados para agrupar por summary e depois por categoria
                                                                const summariesMap = new Map();

                                                                perBaseConformidade.forEach((base: any) => {
                                                                    const conformidadePorSummary = resumo?.conformidadePorSummary?.[base.id] || [];

                                                                    conformidadePorSummary.forEach((summary: any) => {
                                                                        if (!summariesMap.has(summary.summaryId)) {
                                                                            summariesMap.set(summary.summaryId, {
                                                                                summaryId: summary.summaryId,
                                                                                summaryNome: summary.summaryNome,
                                                                                categoriasMap: new Map() // Agora usamos um Map para categorias
                                                                            });
                                                                        }

                                                                        const summaryData = summariesMap.get(summary.summaryId);

                                                                        // Adicionar cada categoria da base atual ao summary
                                                                        summary.categorias?.forEach((categoria: any) => {
                                                                            if (!summaryData.categoriasMap.has(categoria.nome)) {
                                                                                summaryData.categoriasMap.set(categoria.nome, {
                                                                                    categoriaNome: categoria.nome,
                                                                                    dados: [] // Array para armazenar dados de cada base
                                                                                });
                                                                            }

                                                                            summaryData.categoriasMap.get(categoria.nome).dados.push({
                                                                                baseNome: base.nome,
                                                                                porcentagem: categoria.porcentagem,
                                                                                conforme: categoria.conforme,
                                                                                total: categoria.total
                                                                            });
                                                                        });
                                                                    });
                                                                });

                                                                const summariesData = Array.from(summariesMap.values());

                                                                return summariesData.length > 0 ? (
                                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                                        {summariesData.map((summary) => {
                                                                            const categoriasData = Array.from(summary.categoriasMap.values());

                                                                            return (
                                                                                <Paper key={summary.summaryId} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                                                                    {/* Header do Summary */}
                                                                                    <Box sx={{
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        gap: 1,
                                                                                        mb: 2,
                                                                                        p: 1,
                                                                                        bgcolor: `${getCorPorSummary(summary.summaryId)}20`,
                                                                                        borderRadius: 1
                                                                                    }}>
                                                                                        <Box
                                                                                            sx={{
                                                                                                width: 12,
                                                                                                height: 12,
                                                                                                borderRadius: '50%',
                                                                                                bgcolor: getCorPorSummary(summary.summaryId)
                                                                                            }}
                                                                                        />
                                                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                                                            {summary.summaryNome}
                                                                                        </Typography>
                                                                                    </Box>

                                                                                    {/* Gráficos por Categoria */}
                                                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                                                        {categoriasData.map((categoria: any) => (
                                                                                            <Box key={categoria.categoriaNome}>
                                                                                                {/* Header da Categoria */}
                                                                                                <Typography
                                                                                                    variant="subtitle2"
                                                                                                    fontWeight="bold"
                                                                                                    sx={{ mb: 1, ml: 1, bgcolor: `${getCorPorSummary(summary.summaryId)}20`, p: 1, borderRadius: 1 }}
                                                                                                >
                                                                                                    {categoria.categoriaNome}
                                                                                                </Typography>

                                                                                                {/* Gráfico de Barras Vertical para a Categoria */}
                                                                                                <ResponsiveContainer width="100%" height={250} >
                                                                                                    <BarChart
                                                                                                        data={categoria.dados}
                                                                                                        margin={{ top: 1, right: 30, left: 20, bottom: 10 }}
                                                                                                    >
                                                                                                        <XAxis
                                                                                                            dataKey="baseNome"
                                                                                                            angle={-45}
                                                                                                            textAnchor="end"
                                                                                                            height={50}
                                                                                                            tick={{ fontSize: 10 }}
                                                                                                            interval={0}
                                                                                                        />
                                                                                                        <YAxis
                                                                                                            domain={[0, 100]}
                                                                                                            tick={{ fontSize: 10 }}
                                                                                                            tickFormatter={(value) => `${value}%`}
                                                                                                            width={35}
                                                                                                        />
                                                                                                        <Tooltip
                                                                                                            formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Conformidade']}
                                                                                                            labelFormatter={(label) => `${label}`}
                                                                                                        />
                                                                                                        <Bar
                                                                                                            dataKey="porcentagem"
                                                                                                            name="Conformidade"
                                                                                                            radius={[2, 2, 0, 0]}
                                                                                                        >
                                                                                                            {categoria.dados.map((entry: any, index: number) => (
                                                                                                                <Cell
                                                                                                                    key={`cell-${index}`}
                                                                                                                    fill={
                                                                                                                        entry.porcentagem >= 80 ? '#4caf50' :
                                                                                                                            entry.porcentagem >= 50 ? '#ff9800' : '#f44336'
                                                                                                                    }
                                                                                                                />
                                                                                                            ))}
                                                                                                        </Bar>

                                                                                                        <Legend
                                                                                                            wrapperStyle={{
                                                                                                                paddingTop: '30px',
                                                                                                                paddingBottom: '30px'
                                                                                                            }}
                                                                                                            content={() => (

                                                                                                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
                                                                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                                                                        <Box sx={{ width: 12, height: 12, bgcolor: '#4caf50', borderRadius: 1 }} />
                                                                                                                        <Typography variant="caption">≥ 80%</Typography>
                                                                                                                    </Box>
                                                                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                                                                        <Box sx={{ width: 12, height: 12, bgcolor: '#ff9800', borderRadius: 1 }} />
                                                                                                                        <Typography variant="caption">50-79%</Typography>
                                                                                                                    </Box>
                                                                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                                                                        <Box sx={{ width: 12, height: 12, bgcolor: '#f44336', borderRadius: 1 }} />
                                                                                                                        <Typography variant="caption">{'< 50%'}</Typography>
                                                                                                                    </Box>
                                                                                                                </Box>
                                                                                                            )}

                                                                                                        />
                                                                                                    </BarChart>

                                                                                                </ResponsiveContainer>
                                                                                            </Box>
                                                                                        ))}
                                                                                    </Box>


                                                                                </Paper>
                                                                            );
                                                                        })}
                                                                    </Box>
                                                                ) : (
                                                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                                                        <Typography variant="body1" color="text.secondary">
                                                                            Nenhum dado de conformidade disponível.
                                                                        </Typography>
                                                                    </Box>
                                                                );
                                                            })()}
                                                            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mt: 3 }}>
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1,
                                                                    mb: 2,
                                                                    p: 1,
                                                                    bgcolor: `#BBBBFC`,
                                                                    borderRadius: 1
                                                                }}>
                                                                    <Box
                                                                        sx={{
                                                                            width: 12,
                                                                            height: 12,
                                                                            borderRadius: '50%',
                                                                            bgcolor: `#6363F8`
                                                                        }}
                                                                    />
                                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                                        Conformidade Geral das Categorias
                                                                    </Typography>
                                                                </Box>

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
                                                                                            fill={conformidade >= 80 ? '#4caf50' :
                                                                                                conformidade >= 50 ? '#ff9800' : '#f44336'}
                                                                                        />
                                                                                    );
                                                                                })
                                                                            }
                                                                            <Legend
                                                                                content={() => (
                                                                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                                            <Box sx={{ width: 12, height: 12, bgcolor: '#4caf50', borderRadius: 1 }} />
                                                                                            <Typography variant="caption">≥ 80%</Typography>
                                                                                        </Box>
                                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                                            <Box sx={{ width: 12, height: 12, bgcolor: '#ff9800', borderRadius: 1 }} />
                                                                                            <Typography variant="caption">50-79%</Typography>
                                                                                        </Box>
                                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                                            <Box sx={{ width: 12, height: 12, bgcolor: '#f44336', borderRadius: 1 }} />
                                                                                            <Typography variant="caption">{'< 50%'}</Typography>
                                                                                        </Box>
                                                                                    </Box>
                                                                                )}></Legend>
                                                                        </Bar>

                                                                    </BarChart>
                                                                </ResponsiveContainer>

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



                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 400, gap: 2, display: 'flex', flexDirection: 'column' }}>
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
                                                <Typography variant="h5">
                                                    <b>Média {padronizacaoByBaseLastVisit.length === 1 ? 'da base' : 'regional'}:</b> {resumo?.indicePadronizacao ? `${resumo.indicePadronizacao.toFixed(1)}%` : '—'}
                                                </Typography>
                                            </Box>

                                            {padronizacaoByBaseLastVisit.length > 0 ? (
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    {padronizacaoByBaseLastVisit.length === 1 ? (
                                                        // VISUALIZAÇÃO PARA UMA ÚNICA BASE - GRÁFICO DE PIZZA E DETALHAMENTO
                                                        (() => {
                                                            const baseUnica = padronizacaoByBaseLastVisit[0];

                                                            return (
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                                                                    {/* Gráfico de Pizza Principal */}
                                                                    <Box sx={{ width: '100%', textAlign: 'center' }}>

                                                                        <ResponsiveContainer width="100%" height={300}>
                                                                            <PieChart>
                                                                                <Pie
                                                                                    data={[
                                                                                        { name: 'Conforme', value: Number(baseUnica.conforme), fill: '#64B5F7' },
                                                                                        { name: 'Não Conforme', value: Number(baseUnica.naoConforme), fill: '#FFBE5C' },
                                                                                    ].filter(item => item.value > 0)}
                                                                                    dataKey="value"
                                                                                    nameKey="name"
                                                                                    outerRadius={100}
                                                                                    label={({ name, value }) => `${name}: ${(value as number).toFixed(1)}%`}
                                                                                    labelLine={false}
                                                                                >

                                                                                </Pie>
                                                                                <Tooltip
                                                                                    formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Percentual']}
                                                                                />
                                                                                <Legend />
                                                                            </PieChart>
                                                                        </ResponsiveContainer>
                                                                    </Box>

                                                                    {/* Detalhamento por Categoria */}
                                                                    <Paper
                                                                        variant="outlined"
                                                                        sx={{
                                                                            p: 3,
                                                                            borderRadius: 2,
                                                                            width: '100%', // Garante largura total
                                                                            boxSizing: 'border-box' // Importante para padding não quebrar a largura
                                                                        }}
                                                                    >
                                                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                                                            Detalhamento por Categoria
                                                                        </Typography>

                                                                        {baseUnica.categorias?.length > 0 ? (
                                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                                                                                {baseUnica.categorias.map((categoria: any, index: number) => {
                                                                                    const totalCategoria = categoria.conforme + categoria.parcial + categoria.naoConforme + categoria.naoAvaliado;
                                                                                    const dadosGrafico = [
                                                                                        { name: 'Conforme', value: categoria.conforme, porcentagem: totalCategoria > 0 ? (categoria.conforme / totalCategoria) * 100 : 0, fill: '#4caf50' },
                                                                                        { name: 'Não Conforme', value: categoria.naoConforme, porcentagem: totalCategoria > 0 ? (categoria.naoConforme / totalCategoria) * 100 : 0, fill: '#f44336' },
                                                                                    ].filter(item => item.value > 0);

                                                                                    return (
                                                                                        <Paper
                                                                                            key={categoria.categoria}
                                                                                            variant="outlined"
                                                                                            sx={{
                                                                                                p: 2,
                                                                                                borderRadius: 2,
                                                                                                width: '100%' // Garante que cada categoria ocupe largura total
                                                                                            }}
                                                                                        >
                                                                                            {/* Header da Categoria */}
                                                                                            <Box sx={{
                                                                                                display: 'flex',
                                                                                                alignItems: 'center',
                                                                                                gap: 1,
                                                                                                mb: 2,
                                                                                                p: 1,
                                                                                                bgcolor: `${getCorPorSummary(2)}20`,
                                                                                                borderRadius: 1
                                                                                            }}>
                                                                                                <Box
                                                                                                    sx={{
                                                                                                        width: 12,
                                                                                                        height: 12,
                                                                                                        borderRadius: '50%',
                                                                                                        bgcolor: getCorPorSummary(2)
                                                                                                    }}
                                                                                                />
                                                                                                <Typography variant="subtitle1" fontWeight="bold">
                                                                                                    {categoria.categoria}
                                                                                                </Typography>

                                                                                            </Box>

                                                                                            {/* Gráfico de Barras Horizontal - AGORA MAIOR */}
                                                                                            <ResponsiveContainer width="100%" height={100}>
                                                                                                <BarChart
                                                                                                    data={dadosGrafico}
                                                                                                    layout="vertical"
                                                                                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                                                                >
                                                                                                    <XAxis
                                                                                                        type="number"
                                                                                                        domain={[0, 100]}
                                                                                                        tick={{ fontSize: 12 }}
                                                                                                        tickFormatter={(value) => `${value}%`}
                                                                                                    />
                                                                                                    <YAxis
                                                                                                        type="category"
                                                                                                        dataKey="name"
                                                                                                        tick={{ fontSize: 12 }}
                                                                                                        width={80}
                                                                                                    />
                                                                                                    <Tooltip
                                                                                                        formatter={(value: any, name: string) => {
                                                                                                            if (name === 'Porcentagem') {
                                                                                                                return [`${Number(value).toFixed(1)}%`, 'Percentual'];
                                                                                                            }
                                                                                                            return [value, name];
                                                                                                        }}
                                                                                                    />
                                                                                                    <Bar
                                                                                                        dataKey="porcentagem"
                                                                                                        name="Porcentagem"
                                                                                                        radius={[0, 4, 4, 0]}
                                                                                                    >
                                                                                                        {dadosGrafico.map((entry, barIndex) => (
                                                                                                            <Cell key={`cell-${barIndex}`} fill={entry.fill} />
                                                                                                        ))}
                                                                                                    </Bar>
                                                                                                </BarChart>
                                                                                            </ResponsiveContainer>

                                                                                            {/* Tabela com Dados Detalhados */}
                                                                                            <Box sx={{ mt: 2, width: '100%' }}>
                                                                                                <Table size="small" sx={{ width: '100%' }}>
                                                                                                    <TableHead>
                                                                                                        <TableRow>
                                                                                                            <TableCell sx={{ width: '40%' }}><strong>Status</strong></TableCell>
                                                                                                            <TableCell align="right" sx={{ width: '30%' }}><strong>Percentual</strong></TableCell>
                                                                                                        </TableRow>
                                                                                                    </TableHead>
                                                                                                    <TableBody>
                                                                                                        {dadosGrafico.map((item, itemIndex) => (
                                                                                                            <TableRow
                                                                                                                key={itemIndex}
                                                                                                                sx={{
                                                                                                                    '&:hover': { backgroundColor: 'action.hover' },
                                                                                                                    borderLeft: `3px solid ${item.fill}`
                                                                                                                }}
                                                                                                            >
                                                                                                                <TableCell sx={{ width: '40%' }}>
                                                                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                                                        <Box
                                                                                                                            sx={{
                                                                                                                                width: 12,
                                                                                                                                height: 12,
                                                                                                                                borderRadius: '50%',
                                                                                                                                bgcolor: item.fill
                                                                                                                            }}
                                                                                                                        />
                                                                                                                        <Typography variant="body2">
                                                                                                                            {item.name}
                                                                                                                        </Typography>
                                                                                                                    </Box>
                                                                                                                </TableCell>

                                                                                                                <TableCell align="right" sx={{ width: '30%' }}>
                                                                                                                    <Typography
                                                                                                                        variant="body2"
                                                                                                                        fontWeight="bold"
                                                                                                                        color="text.primary"
                                                                                                                    >
                                                                                                                        {item.porcentagem.toFixed(1)}%
                                                                                                                    </Typography>
                                                                                                                </TableCell>
                                                                                                            </TableRow>
                                                                                                        ))}
                                                                                                    </TableBody>
                                                                                                </Table>
                                                                                            </Box>
                                                                                        </Paper>
                                                                                    );
                                                                                })}
                                                                            </Box>
                                                                        ) : (
                                                                            <Box sx={{ textAlign: 'center', py: 4, width: '100%' }}>
                                                                                <Typography variant="body1" color="text.secondary">
                                                                                    Nenhum dado de categoria disponível.
                                                                                </Typography>
                                                                            </Box>
                                                                        )}
                                                                    </Paper>
                                                                </Box>
                                                            );
                                                        })()
                                                    ) : (
                                                        <>


                                                            {/* Gráficos por Categoria para Múltiplas Bases */}
                                                            {padronizacaoByBaseLastVisit.length > 0 && padronizacaoByBaseLastVisit[0].categorias?.length > 0 ? (
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>

                                                                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>

                                                                        {padronizacaoByBaseLastVisit[0].categorias.map((categoria: any, index: number) => {
                                                                            const dadosCategoria = padronizacaoByBaseLastVisit.map((base: any) => ({
                                                                                baseName: base.name,
                                                                                conforme: base.categorias?.[index]?.conforme || 0,
                                                                                parcial: base.categorias?.[index]?.parcial || 0,
                                                                                naoConforme: base.categorias?.[index]?.naoConforme || 0,
                                                                                naoAvaliado: base.categorias?.[index]?.naoAvaliado || 0
                                                                            })).filter((item: any) => item.conforme + item.parcial + item.naoConforme + item.naoAvaliado > 0);

                                                                            return (
                                                                                <Box key={categoria.categoria}>
                                                                                    <Box sx={{
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        gap: 1,
                                                                                        mb: 2,
                                                                                        p: 1,
                                                                                        bgcolor: `${getCorPorSummary(2)}20`,
                                                                                        borderRadius: 1
                                                                                    }}>
                                                                                        <Box
                                                                                            sx={{
                                                                                                width: 12,
                                                                                                height: 12,
                                                                                                borderRadius: '50%',
                                                                                                bgcolor: getCorPorSummary(2)
                                                                                            }}
                                                                                        />
                                                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                                                            {categoria.categoria}
                                                                                        </Typography>
                                                                                    </Box>

                                                                                    <ResponsiveContainer width="100%" height={300}>
                                                                                        <BarChart
                                                                                            data={dadosCategoria.map((item: any) => {
                                                                                                const total = item.conforme + item.naoConforme;
                                                                                                const conformidade = total > 0 ? (item.conforme / total) * 100 : 0;
                                                                                                return {
                                                                                                    baseName: item.baseName?.length > 15 ? `${item.baseName.substring(0, 15)}...` : item.baseName,
                                                                                                    conformidade: Number(conformidade.toFixed(1))
                                                                                                };
                                                                                            })}
                                                                                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                                                                        >
                                                                                            <XAxis
                                                                                                dataKey="baseName"
                                                                                                angle={-45}
                                                                                                textAnchor="end"
                                                                                                height={80}
                                                                                                tick={{ fontSize: 12 }}
                                                                                                interval={0}
                                                                                            />
                                                                                            <YAxis
                                                                                                domain={[0, 100]}
                                                                                                tick={{ fontSize: 12 }}
                                                                                                tickFormatter={(value) => `${value}%`}
                                                                                            />
                                                                                            <Tooltip
                                                                                                formatter={(value) => `${Number(value).toFixed(1)}%`}
                                                                                                labelFormatter={(label) => `Base: ${label}`}
                                                                                            />
                                                                                            <Bar dataKey="conformidade" radius={[4, 4, 0, 0]}>
                                                                                                {dadosCategoria.map((item: any, idx: number) => {
                                                                                                    const total = item.conforme + item.naoConforme;
                                                                                                    const conformidade = total > 0 ? (item.conforme / total) * 100 : 0;
                                                                                                    return (
                                                                                                        <Cell
                                                                                                            key={`cell-${idx}`}
                                                                                                            fill={conformidade >= 80 ? '#4caf50' :
                                                                                                                conformidade >= 50 ? '#ff9800' : '#f44336'}
                                                                                                        />
                                                                                                    );
                                                                                                })}
                                                                                            </Bar>
                                                                                            <Legend
                                                                                                wrapperStyle={{
                                                                                                    paddingTop: '10px',
                                                                                                    paddingBottom: '10px'
                                                                                                }}
                                                                                                content={() => (
                                                                                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
                                                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                                                            <Box sx={{ width: 12, height: 12, bgcolor: '#4caf50', borderRadius: 1 }} />
                                                                                                            <Typography variant="caption">≥ 80%</Typography>
                                                                                                        </Box>
                                                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                                                            <Box sx={{ width: 12, height: 12, bgcolor: '#ff9800', borderRadius: 1 }} />
                                                                                                            <Typography variant="caption">50-79%</Typography>
                                                                                                        </Box>
                                                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                                                            <Box sx={{ width: 12, height: 12, bgcolor: '#f44336', borderRadius: 1 }} />
                                                                                                            <Typography variant="caption">{'< 50%'}</Typography>
                                                                                                        </Box>
                                                                                                    </Box>
                                                                                                )}
                                                                                            />
                                                                                        </BarChart>
                                                                                    </ResponsiveContainer>
                                                                                </Box>
                                                                            );
                                                                        })}
                                                                    </Paper>
                                                                </Box>
                                                            ) : (
                                                                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                                                                    Nenhum dado de categoria disponível.
                                                                </Typography>
                                                            )}
                                                            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mt: 3, width: '100%' }}>
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1,
                                                                    mb: 2,
                                                                    p: 1,
                                                                    bgcolor: `#BBBBFC`,
                                                                    borderRadius: 1
                                                                }}>
                                                                    <Box
                                                                        sx={{
                                                                            width: 12,
                                                                            height: 12,
                                                                            borderRadius: '50%',
                                                                            bgcolor: `#6363F8`
                                                                        }}
                                                                    />
                                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                                        Conformidade Geral das Categorias
                                                                    </Typography>
                                                                </Box>

                                                                <ResponsiveContainer width="100%" height={300}>
                                                                    <BarChart
                                                                        data={processedData}
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
                                                                        <Bar dataKey="conformidade" radius={[4, 4, 0, 0]}>
                                                                            {processedData.map((entry: any, idx: any) => {
                                                                                const conformidade = entry.conformidade;
                                                                                return (
                                                                                    <Cell
                                                                                        key={`cell-${idx}`}
                                                                                        fill={conformidade >= 80 ? '#4caf50' :
                                                                                            conformidade >= 50 ? '#ff9800' : '#f44336'}
                                                                                    />
                                                                                );
                                                                            })}
                                                                        </Bar>
                                                                        <Legend
                                                                            content={() => (
                                                                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                                        <Box sx={{ width: 12, height: 12, bgcolor: '#4caf50', borderRadius: 1 }} />
                                                                                        <Typography variant="caption">≥ 80%</Typography>
                                                                                    </Box>
                                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                                        <Box sx={{ width: 12, height: 12, bgcolor: '#ff9800', borderRadius: 1 }} />
                                                                                        <Typography variant="caption">50-79%</Typography>
                                                                                    </Box>
                                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                                        <Box sx={{ width: 12, height: 12, bgcolor: '#f44336', borderRadius: 1 }} />
                                                                                        <Typography variant="caption">{'< 50%'}</Typography>
                                                                                    </Box>
                                                                                </Box>
                                                                            )}
                                                                        />
                                                                    </BarChart>
                                                                </ResponsiveContainer>

                                                            </Paper>

                                                        </>


                                                    )}

                                                </Box>
                                            ) : (
                                                <Placeholder text="Nenhum dado de padronização encontrado na última visita." />
                                            )}


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
                                    {/* Seção de Relatos */}
                                    <Box sx={{ width: '100%', mt: 4 }}>
                                        <Paper variant="outlined" sx={{
                                            p: 3,
                                            ...paperStyles
                                        }}>
                                            <Typography variant="h6" gutterBottom>
                                                Nuvem de Palavras dos Relatos
                                                <Typography variant="caption" display="block" color="text.secondary">
                                                    Palavras mais frequentes nas mensagens das equipes
                                                </Typography>
                                            </Typography>

                                            <WordcloudRelatos
                                                relatos={relatos}
                                                height={530}
                                                showEstatisticas={true}
                                            />
                                        </Paper>
                                    </Box>

                                </Box>




                            </>
                        )}

                    </>
                )
                }
            </Box >
        </LocalizationProvider >
    );
}