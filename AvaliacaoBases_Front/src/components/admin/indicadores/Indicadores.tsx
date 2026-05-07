"use client";
import React, { useState, useEffect } from "react";
import {
    Box, Button, Paper, Typography, Alert, Snackbar, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, Stack, Card, CardContent, TextField,
} from "@mui/material";
import { CloudUpload, Description, Search } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { useIndicadores } from "../hooks/useIndicadores";

export default function UploadCSVPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const {
        loading, dadosCombinados, dadosFiltrados,
        fetchMedias, vtrFiltradas, searchTerm, setSearchTerm,
        selectedMonth, setSelectedMonth,
    } = useIndicadores(false);

    const [uploadMonth, setUploadMonth] = useState<string>("");

    useEffect(() => { fetchMedias(); }, [selectedMonth]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const isValid =
            file.type === "text/csv" || file.name.endsWith(".csv") ||
            file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            file.name.endsWith(".xlsx");
        if (isValid) { setSelectedFile(file); setErrorMsg(null); }
        else { setErrorMsg("Por favor, selecione um arquivo CSV ou XLSX válido."); setSelectedFile(null); }
    };

    const handleUpload = async () => {
        if (!selectedFile) { setErrorMsg("Por favor, selecione um arquivo CSV ou XLSX válido."); return; }
        setUploading(true);
        setErrorMsg(null);
        const formData = new FormData();
        formData.append("file", selectedFile);
        if (uploadMonth) formData.append("dataVigencia", `${uploadMonth}-01`);
        try {
            const response = await fetch("/api/inspecao/csv", { method: "POST", body: formData });
            if (response.ok) {
                setSuccessMsg("Arquivo processado com sucesso!");
                setSelectedFile(null);
                const fileInput = document.getElementById("csv-file") as HTMLInputElement;
                if (fileInput) fileInput.value = "";
                await fetchMedias();
            } else {
                setErrorMsg(await response.text() || "Erro ao processar arquivo.");
            }
        } catch (error: any) {
            setErrorMsg(error.message || "Erro ao fazer upload do arquivo.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
            <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 1200, margin: "0 auto" }}>
                <Typography variant="h4" fontWeight="600" gutterBottom
                    sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
                    Upload de Arquivos
                </Typography>

                <Card sx={{ mb: 4 }}>
                    <CardContent>
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                            sx={{ mb: 2, mt: 2 }}
                        >
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<CloudUpload />}
                                fullWidth
                                sx={{ maxWidth: { sm: "fit-content" } }}
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
                                fullWidth
                                sx={{ maxWidth: { sm: "fit-content" } }}
                            >
                                {uploading ? "Processando..." : "Enviar"}
                            </Button>

                            <DatePicker
                                label="Mês de Referência (Upload)"
                                views={["year", "month"]}
                                value={uploadMonth ? dayjs(uploadMonth) : null}
                                onChange={(newValue) => {
                                    setUploadMonth(newValue ? dayjs(newValue).format("YYYY-MM") : "");
                                }}
                                slotProps={{
                                    textField: {
                                        size: "small",
                                        InputLabelProps: { shrink: true },
                                    }
                                }}
                            />
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
                    <CardContent sx={{ px: { xs: 1, sm: 2 } }}>
                        <Typography variant="h6" gutterBottom>
                            Médias por Cidade
                        </Typography>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
                            <TextField
                                fullWidth
                                placeholder="Buscar por cidade..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <Search sx={{ color: "text.secondary", mr: 1 }} />,
                                }}
                            />
                            <DatePicker
                                label="Filtrar por Mês"
                                views={["year", "month"]}
                                value={selectedMonth ? dayjs(selectedMonth) : null}
                                onChange={(newValue) => {
                                    setSelectedMonth(newValue ? dayjs(newValue).format("YYYY-MM") : "");
                                }}
                                slotProps={{
                                    textField: {
                                        size: "medium",
                                        InputLabelProps: { shrink: true },
                                    }
                                }}
                            />
                        </Stack>

                        {loading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : dadosCombinados.length === 0 ? (
                            <Alert severity="info">Nenhum dado disponível. Faça upload de um arquivo.</Alert>
                        ) : (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

                                {/* Tabela 1 — Métricas */}
                                <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, overflowX: "auto" }}>
                                    <Table sx={{ minWidth: { xs: 320, sm: 650 } }}>
                                        <TableHead sx={{ bgcolor: "gray" }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: "bold", color: "white", whiteSpace: "nowrap" }}>
                                                    Cidade
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontWeight: "bold", color: "white", whiteSpace: "nowrap" }}>
                                                    <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>Tempo Resposta Médio</Box>
                                                    <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>T. Resposta</Box>
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontWeight: "bold", color: "white", whiteSpace: "nowrap" }}>
                                                    <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>Tempo Prontidão Médio</Box>
                                                    <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>T. Prontidão</Box>
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {dadosFiltrados.map((item, index) => (
                                                <TableRow
                                                    key={item.cidade}
                                                    sx={{
                                                        bgcolor: index % 2 === 0 ? "background.default" : "grey.50",
                                                        "&:hover": { bgcolor: "action.hover" },
                                                    }}
                                                >
                                                    <TableCell sx={{ py: { xs: 1, sm: 2 } }}>
                                                        <Typography variant="body2" fontWeight="600">{item.cidade}</Typography>
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ py: { xs: 1, sm: 2 } }}>
                                                        <Chip label={item.tempoRespostaMedio} variant={item.tempoRespostaMedio === "N/A" ? "outlined" : "filled"} size="small" />
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ py: { xs: 1, sm: 2 } }}>
                                                        <Chip label={item.tempoProntidaoMedio} variant={item.tempoProntidaoMedio === "N/A" ? "outlined" : "filled"} size="small" />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                {/* Tabela 2 — Viaturas */}
                                <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, overflowX: "auto" }}>
                                    <Table sx={{ minWidth: { xs: 420, sm: 750 } }}>
                                        <TableHead sx={{ bgcolor: "gray" }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: "bold", color: "white", whiteSpace: "nowrap", width: { xs: 100, sm: 200 } }}>
                                                    Cidade
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontWeight: "bold", color: "white", whiteSpace: "nowrap" }}>Viatura</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: "bold", color: "white", whiteSpace: "nowrap" }}>Ativa%</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: "bold", color: "white", whiteSpace: "nowrap" }}>Placa</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: "bold", color: "white", whiteSpace: "nowrap" }}>CNES</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {vtrFiltradas.map((item) => {
                                                const viaturas =
                                                    Array.isArray(item.vtr) && item.vtr.length > 0
                                                        ? item.vtr
                                                        : [{ viatura: "N/A", ativa: "N/A", placa: "N/A", CNES: "N/A", id: `${item.cidade}-na` }];

                                                return viaturas.map((vtr, vtrIndex) => (
                                                    <TableRow key={`${item.cidade}-${vtr.viatura ?? vtrIndex}`}>
                                                        {vtrIndex === 0 && (
                                                            <TableCell
                                                                rowSpan={viaturas.length}
                                                                sx={{ verticalAlign: "middle", fontWeight: 600, width: { xs: 100, sm: 200 } }}
                                                            >
                                                                {item.cidade}
                                                            </TableCell>
                                                        )}
                                                        <TableCell align="center" sx={{ py: { xs: 1, sm: 1.5 } }}>
                                                            <Chip label={vtr.viatura ?? "N/A"} variant={vtr.viatura === "N/A" ? "outlined" : "filled"} size="small" />
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ py: { xs: 1, sm: 1.5 } }}>
                                                            <Chip
                                                                label={vtr.ativa == null || vtr.ativa === "N/A" ? "N/A" : (String(vtr.ativa).endsWith("%") ? vtr.ativa : `${vtr.ativa}%`)}
                                                                variant={vtr.ativa == null || vtr.ativa === "N/A" ? "outlined" : "filled"}
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ py: { xs: 1, sm: 1.5 } }}>
                                                            {vtr.placa && vtr.placa.trim().length > 0 && (
                                                                <Chip label={vtr.placa.trim() ?? "N/A"} variant="filled" size="small" />
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ py: { xs: 1, sm: 1.5 } }}>
                                                            {vtr.CNES && vtr.CNES.trim().length > 0 && (
                                                                <Chip label={vtr.CNES.trim() ?? "N/A"} variant="filled" size="small" />
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ));
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        )}

                        {searchTerm && dadosFiltrados.length === 0 && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                Nenhuma cidade encontrada para "{searchTerm}"
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                <Snackbar open={!!successMsg} autoHideDuration={6000} onClose={() => setSuccessMsg(null)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                    <Alert onClose={() => setSuccessMsg(null)} severity="success" sx={{ width: "100%" }}>
                        {successMsg}
                    </Alert>
                </Snackbar>

                <Snackbar open={!!errorMsg} autoHideDuration={6000} onClose={() => setErrorMsg(null)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                    <Alert onClose={() => setErrorMsg(null)} severity="error" sx={{ width: "100%" }}>
                        {errorMsg}
                    </Alert>
                </Snackbar>
            </Box>
        </LocalizationProvider>
    );
}