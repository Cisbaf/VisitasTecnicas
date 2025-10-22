// src/app/upload-csv/page.tsx
"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
    Box,
    Button,
    Paper,
    Typography,
    Alert,
    Snackbar,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Stack,
    Card,
    CardContent,
    TextField,
} from "@mui/material";
import { CloudUpload, Description, Search } from "@mui/icons-material";
import { useIndicadores } from "../hooks/useIndicadores";



export default function UploadCSVPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const {
        loading,
        dadosCombinados,
        dadosFiltrados,
        fetchMedias,
        vtrFiltradas,
        searchTerm,
        setSearchTerm,
    } = useIndicadores(false);

    useEffect(() => {
        fetchMedias();
    }, []);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const isValidFile = file.type === "text/csv" ||
                file.name.toLowerCase().endsWith(".csv") ||
                file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                file.name.toLowerCase().endsWith(".xlsx");

            if (isValidFile) {
                setSelectedFile(file);
                setErrorMsg(null);
            } else {
                setErrorMsg("Por favor, selecione um arquivo CSV ou XLSX válido.");
                setSelectedFile(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setErrorMsg("Por favor, selecione um arquivo CSV ou XLSX válido.");
            return;
        }

        setUploading(true);
        setErrorMsg(null);

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await fetch("/api/inspecao/csv", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                setSuccessMsg("Arquivo processado com sucesso!");
                setSelectedFile(null);
                // Reset file input
                const fileInput = document.getElementById("csv-file") as HTMLInputElement;
                if (fileInput) fileInput.value = "";

                // Atualizar as médias após o upload
                await fetchMedias();
            } else {
                const errorText = await response.text();
                setErrorMsg(errorText || "Erro ao processar arquivo.");
            }
        } catch (error: any) {
            setErrorMsg(error.message || "Erro ao fazer upload do arquivo.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto" }}>
            <Typography variant="h4" fontWeight="600" gutterBottom>
                Upload de Arquivos
            </Typography>

            <Card sx={{ mb: 4 }}>
                <CardContent>

                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2, mt: 2 }}>
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUpload />}
                        >
                            Selecionar Arquivo
                            <input
                                id="csv-file"
                                type="file"
                                accept=".csv,.xlsx"
                                hidden
                                onChange={handleFileSelect}
                            />
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleUpload}
                            disabled={!selectedFile || uploading}
                            startIcon={uploading ? <CircularProgress size={20} /> : <Description />}
                        >
                            {uploading ? "Processando..." : "Enviar"}
                        </Button>
                    </Stack>

                    {selectedFile && (
                        <Typography variant="body2" color="text.secondary">
                            Arquivo selecionado: <strong>{selectedFile.name}</strong>
                        </Typography>
                    )}

                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        Tipos suportados: .csv e .xlsx
                    </Typography>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Médias por Cidade
                    </Typography>

                    <TextField
                        fullWidth
                        placeholder="Buscar por cidade..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ mb: 2 }}
                        InputProps={{
                            startAdornment: (
                                <Search sx={{ color: 'text.secondary', mr: 1 }} />
                            ),
                        }}
                    />

                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : dadosCombinados.length === 0 ? (
                        <Alert severity="info">
                            Nenhum dado disponível. Faça upload de um arquivo.
                        </Alert>
                    ) : (
                        <div className="tables-container" style={{ gap: "20px", display: "flex", flexDirection: "column" }}>
                            {/* Primeira Tabela - Métricas */}
                            <TableContainer
                                component={Paper}
                                elevation={2}
                                sx={{
                                    borderRadius: 2,
                                    overflow: "hidden"
                                }}
                            >
                                <Table sx={{ minWidth: 650 }}>
                                    <TableHead sx={{ bgcolor: 'gray' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                                                Cidade
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "white" }}>
                                                Tempo Resposta Médio
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "white" }}>
                                                Tempo Prontidão Médio
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {dadosFiltrados.map((item, index) => (
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
                                                    <Typography variant="body1" fontWeight="600">
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

                            {/* Segunda Tabela - Viaturas */}
                            <TableContainer
                                component={Paper}
                                elevation={2}
                                sx={{
                                    borderRadius: 2,
                                    overflow: "hidden"
                                }}
                            >
                                <Table sx={{ minWidth: 750 }}>
                                    <TableHead sx={{ bgcolor: 'gray' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: "bold", color: "white", width: 200 }}>
                                                Cidade
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "white" }}>
                                                Viatura
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "white" }}>
                                                Ativa%
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "white" }}>
                                                Placa
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "white" }}>
                                                CNES
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {vtrFiltradas.map((item, cityIndex) => {
                                            const viaturas = Array.isArray(item.vtr) && item.vtr.length > 0
                                                ? item.vtr
                                                : [{
                                                    viatura: "N/A",
                                                    ativa: "N/A",
                                                    placa: "N/A",
                                                    CNES: "N/A",
                                                    id: `${item.cidade}-na`
                                                }];

                                            return viaturas.map((vtr, vtrIndex) => (
                                                <TableRow
                                                    key={`${item.cidade}-${vtr.viatura ?? vtrIndex}`}
                                                >
                                                    {/* Renderiza a cidade apenas na primeira linha do grupo */}
                                                    {vtrIndex === 0 && (
                                                        <TableCell
                                                            rowSpan={viaturas.length}
                                                            sx={{
                                                                verticalAlign: "middle",
                                                                width: 200,
                                                                fontWeight: 600
                                                            }}
                                                        >
                                                            {item.cidade}
                                                        </TableCell>
                                                    )}

                                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                                        <Chip
                                                            label={vtr.viatura ?? "N/A"}
                                                            variant={vtr.viatura === "N/A" ? "outlined" : "filled"}
                                                            size="small"
                                                        />
                                                    </TableCell>

                                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                                        <Chip
                                                            label={
                                                                vtr.ativa == null || vtr.ativa === "N/A"
                                                                    ? "N/A"
                                                                    : (String(vtr.ativa).endsWith("%") ? vtr.ativa : `${vtr.ativa}%`)
                                                            }
                                                            variant={vtr.ativa == null || vtr.ativa === "N/A" ? "outlined" : "filled"}

                                                            size="small"
                                                        />
                                                    </TableCell>

                                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                                        {vtr.placa.trim().length > 0 &&
                                                            <Chip
                                                                label={vtr.placa ?? "N/A"}
                                                                variant={vtr.placa === "N/A" ? "outlined" : "filled"}
                                                                size="small"
                                                            />
                                                        }

                                                    </TableCell>

                                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                                        {vtr.CNES.trim().length > 0 &&
                                                            <Chip
                                                                label={vtr.CNES ?? "N/A"}
                                                                variant={vtr.CNES === "N/A" ? "outlined" : "filled"}
                                                                size="small"
                                                            />
                                                        }
                                                    </TableCell>
                                                </TableRow>
                                            ));
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    )}

                    {searchTerm && dadosFiltrados.length === 0 && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            Nenhuma cidade encontrada para "{searchTerm}"
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Snackbars para feedback */}
            <Snackbar
                open={!!successMsg}
                autoHideDuration={6000}
                onClose={() => setSuccessMsg(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setSuccessMsg(null)} severity="success" sx={{ width: "100%" }}>
                    {successMsg}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!errorMsg}
                autoHideDuration={6000}
                onClose={() => setErrorMsg(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setErrorMsg(null)} severity="error" sx={{ width: "100%" }}>
                    {errorMsg}
                </Alert>
            </Snackbar>
        </Box>
    );
}