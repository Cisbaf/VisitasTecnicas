// src/components/base/Viaturas.tsx
"use client";
import React, {useEffect, useMemo, useState} from "react";
import {useParams} from "next/navigation";
import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    IconButton,
    InputAdornment,
    Paper,
    Snackbar,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {Delete, Search, Visibility} from "@mui/icons-material";
import {BaseResponse, Viatura} from '@/components/types';
import ViaturaHistoricoModal from "./modal/ViaturaHistoricoModal";

export default function Viaturas({baseId}: { baseId?: number }) {
    const params = useParams();
    const resolvedBaseId = baseId ?? (params?.baseId ? Number(params.baseId) : null);

    const [viaturas, setViaturas] = useState<Viatura[]>([]); // Alterado para array vazio
    const [filteredViaturas, setFilteredViaturas] = useState<Viatura[]>([]); // Alterado para array vazio
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [checklistsModalOpen, setChecklistsModalOpen] = useState(false);
    const [selectedidViatura, setSelectedidViatura] = useState<string | null>(null);
    const [baseNames, setBaseNames] = useState<Record<number, string>>({});

    // Função para obter nomes das bases do localStorage
    const getBaseNames = (): Record<number, string> => {
        if (typeof window === 'undefined') return {};

        try {
            const storedBases = localStorage.getItem("allBasesData");
            if (storedBases) {
                const bases: BaseResponse[] = JSON.parse(storedBases);
                const namesMap: Record<number, string> = {};

                bases.forEach(base => {
                    if (base.id) {
                        namesMap[base.id] = base.nome;
                    }
                });

                return namesMap;
            }
        } catch (e) {
            console.error("Erro ao parsear bases do localStorage", e);
        }

        return {};
    };

    useEffect(() => {
        setBaseNames(getBaseNames());
    }, []);

    const fetchViaturas = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const url = resolvedBaseId ? `/api/viatura/base/${resolvedBaseId}` : `/api/viatura`; // Corrigido o endpoint
            const r = await fetch(url, {cache: "no-store"});

            if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);

            const responseText = await r.text();
            const viaturasData = responseText ? JSON.parse(responseText) : [];

            // Garantir que sempre seja um array
            setViaturas(Array.isArray(viaturasData) ? viaturasData : []);
            setFilteredViaturas(Array.isArray(viaturasData) ? viaturasData : []);
        } catch (err: any) {
            setErrorMsg(err.message || "Erro ao carregar viaturas");
            setViaturas([]);
            setFilteredViaturas([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchViaturas();
    }, [resolvedBaseId]);

    useEffect(() => {
        if (!viaturas || viaturas.length === 0) {
            setFilteredViaturas([]);
            return;
        }

        if (!searchTerm) {
            setFilteredViaturas(viaturas);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = viaturas.filter(viatura =>
            (viatura.placa && viatura.placa.toLowerCase().includes(term)) ||
            (viatura.tipoViatura && viatura.tipoViatura.toLowerCase().includes(term)) ||
            (viatura.statusOperacional && viatura.statusOperacional.toLowerCase().includes(term))
        );

        setFilteredViaturas(filtered);
    }, [searchTerm, viaturas]);

    const openChecklistsModal = (placa: string) => {
        if (!placa) {
            setErrorMsg("ID da viatura inválido");
            return;
        }
        setSelectedidViatura(placa);
        setChecklistsModalOpen(true);
    };

    const handleDelete = async (id?: number) => {
        if (!id) return setErrorMsg("ID inválido para remoção.");

        try {
            const r = await fetch(`/api/viatura/${id}`, {method: "DELETE"});
            if (!r.ok) throw new Error(await r.text().catch(() => r.statusText));

            setSuccessMsg("Viatura removida com sucesso.");
            setViaturas(prev => prev ? prev.filter(v => v.id !== id) : []);
        } catch (err: any) {
            setErrorMsg(err.message || "Erro ao remover viatura.");
        }
    };

    const statusColor = useMemo(() => (status: string) => {
        const s = status?.toLowerCase();
        if (s?.includes("em operacao") || s?.includes("operação") || s?.includes("operacao")) return "success";
        if (s?.includes("em manutencao") || s?.includes("manutenção") || s?.includes("manutencao")) return "warning";
        if (s?.includes("fora de servico") || s?.includes("fora") || s?.includes("inoperante")) return "error";
        return "default";
    }, []);

    const viaturaActions = (v: Viatura) => (
        <Box sx={{display: "flex", justifyContent: "flex-end", gap: 1, mt: 1}}>
            {v.id && !isNaN(v.id) && (
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        openChecklistsModal(v.placa!);
                    }}
                    title="Ver checklists"
                >
                    <Visibility fontSize="small" color="info"/>
                </IconButton>
            )}
            <IconButton size="small" onClick={async (e) => {
                e.stopPropagation();
                if (!v.id) return setErrorMsg("Viatura sem ID");
                if (confirm("Tem certeza que deseja remover esta viatura?")) await handleDelete(v.id);
            }}>
                <Delete fontSize="small" color="error"/>
            </IconButton>
        </Box>
    );
    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb: 2}}>
                <Box sx={{display: 'flex', alignItems: 'center', mb: 4}}>
                    <Typography variant="h4" fontWeight="600">
                        Viaturas
                    </Typography>
                </Box>
            </Stack>

            <Paper sx={{p: 2, borderRadius: 2}}>
                <TextField
                    fullWidth
                    placeholder="Buscar viaturas por placa, modelo, tipo ou status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{mb: 2}}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search/>
                            </InputAdornment>
                        ),
                    }}
                />

                {loading ? (
                    <Box sx={{display: "flex", justifyContent: "center", py: 6}}>
                        <CircularProgress/>
                    </Box>
                ) : errorMsg ? (
                    <Alert severity="error">{errorMsg}</Alert>
                ) : filteredViaturas.length === 0 ? ( // Alterado para filteredViaturas.length
                    <Typography>
                        {searchTerm ? "Nenhuma viatura encontrada" : "Não há viaturas cadastradas"}
                    </Typography>
                ) : (
                    <Box sx={{display: "flex", flexWrap: "wrap", gap: 2}}>
                        {filteredViaturas.map(v => ( // Removido o operador optional chaining
                            <Paper
                                key={v.id ?? v.placa}
                                sx={{
                                    width: 240,
                                    p: 2,
                                    borderRadius: 2,
                                    boxShadow: 1,
                                    cursor: "pointer",
                                    "&:hover": {boxShadow: 3, backgroundColor: "action.hover"},
                                }}
                            >
                                <Stack spacing={0.5}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="subtitle1" sx={{fontWeight: 700}}>
                                            {v.placa ?? "—"}
                                        </Typography>
                                        <Chip label={v.statusOperacional ?? "—"}
                                              color={statusColor(v.statusOperacional)} size="small"/>
                                    </Stack>


                                    <Typography variant="body2">
                                        Tipo: <strong>{v.tipoViatura ?? "—"}</strong>
                                    </Typography>

                                    {/* Exibir o nome da base usando o idBase da viatura */}
                                    <Typography variant="body2">
                                        Base: <strong>{v.idBase ? (baseNames[v.idBase] || ` ${v.idBase}`) : "Não atribuída"}</strong>
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        KM: {v.km ?? "—"}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Data Ultima Alteração: {v.dataUltimaAlteracao ?? "—"}
                                    </Typography>

                                    {viaturaActions(v)}
                                </Stack>
                            </Paper>
                        ))}
                    </Box>
                )}
            </Paper>

            <ViaturaHistoricoModal
                open={checklistsModalOpen}
                onClose={() => setChecklistsModalOpen(false)}
                placa={selectedidViatura}
            />

            <Snackbar open={!!successMsg} autoHideDuration={4000} onClose={() => setSuccessMsg(null)}>
                <Alert onClose={() => setSuccessMsg(null)} severity="success" sx={{width: "100%"}}>
                    {successMsg}
                </Alert>
            </Snackbar>

            <Snackbar open={!!errorMsg && !dialogOpen} autoHideDuration={6000} onClose={() => setErrorMsg(null)}>
                <Alert onClose={() => setErrorMsg(null)} severity="error" sx={{width: "100%"}}>
                    {errorMsg}
                </Alert>
            </Snackbar>
        </Box>
    );
}