import React, { useState } from "react";
import { Box, Chip, Divider, IconButton, Paper, Typography, } from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon, Person as PersonIcon } from "@mui/icons-material";
import { RelatoDTO, VisitaDetails } from "@/components/types";
import AddMemberInline from "./AddMemberInline";
import AddRelatoInline from "./AddRelatoInline";
import AddBaseMemberInline from "./AddBaseMeberInline";


interface DetalhesVisitaTabProps {
    visita: VisitaDetails;
    relatos: RelatoDTO[];
    onAddMember: (nome: string, cargo?: string) => void;
    onRemoveMember: (index: number) => void;
    onAddRelato: (payload: any) => void;
    onUpdateRelato: (relatoId: number, updates: Partial<RelatoDTO>) => void;
    onDeleteRelato: (relatoId: number) => void;
    fetchRelatos: () => Promise<void>;
}

export default function DetalhesVisitaTab({
    visita,
    relatos,
    onAddMember,
    onRemoveMember,
    onAddRelato,
    onDeleteRelato,
    fetchRelatos
}: DetalhesVisitaTabProps) {
    const [editandoRelatoId, setEditandoRelatoId] = useState<number | null>(null);
    const [relatoEditado, setRelatoEditado] = useState<RelatoDTO | null>(null);
    const CARGOS_ESPECIFICOS = ['COORDENADOR ADM', 'RT DE ENFERMAGEM', 'COORDENADOR MÉDICO'];

    const membrosEspecificos = visita.membros.filter(m => CARGOS_ESPECIFICOS.includes(m.cargo!));
    const membrosGerais = visita.membros.filter(m => !CARGOS_ESPECIFICOS.includes(m.cargo!));

    const iniciarEdicao = (relato: RelatoDTO) => {
        setEditandoRelatoId(relato.id);
        setRelatoEditado(relato);
    };

    const cancelarEdicao = () => {
        setEditandoRelatoId(null);
        setRelatoEditado(null);
    };

    const handleUpdateRelato = async (relatoId: number, updates: Partial<RelatoDTO>) => {
        try {
            // Encontrar o relato atual pelo ID
            const relatoAtual = relatos.find(r => r.id === relatoId);
            if (relatoAtual) {
                relatoAtual.visitaId = visita.id;
            }

            if (!relatoAtual) {
                console.error('Relato não encontrado');
                return;
            }

            // Mesclar as atualizações com o relato atual
            const relatoAtualizado = { ...relatoAtual, ...updates };

            // Fazer a requisição PUT com o objeto completo
            const response = await fetch(`/api/visita/relatos/${relatoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(relatoAtualizado),
            });

            if (response.ok) {
                cancelarEdicao();
                await fetchRelatos();
            }
        } catch (error) {
            console.error('Erro ao atualizar relato:', error);
        }
    };
    return (
        <>

            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1">Membros da visita</Typography>
                {membrosGerais.map((m, idx) => (
                    <Chip
                        key={idx}
                        icon={<PersonIcon />}
                        label={`${m.nome}${m.cargo ? ` — ${m.cargo}` : ""} `}
                        onDelete={() => onRemoveMember(visita.membros.indexOf(m))}
                        variant="outlined"
                    />
                ))}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                    <AddMemberInline onAdd={onAddMember} />
                </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1">Membros da base</Typography>
                {membrosEspecificos.map((m, idx) => (
                    <Chip
                        key={idx}
                        icon={<PersonIcon />}
                        label={`${m.nome}${m.cargo ? ` — ${m.cargo}` : ""} `}
                        onDelete={() => onRemoveMember(visita.membros.indexOf(m))}
                        variant="outlined"
                    />
                ))}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>

                    <AddBaseMemberInline onAdd={onAddMember} equipe={visita.membros} />
                </Box>

            </Box>

            <Divider sx={{ my: 3 }} />

            <Box>
                <Typography variant="subtitle1" gutterBottom>Relatos</Typography>

                {relatos.slice(0, 3).map((relato) => (
                    editandoRelatoId === relato.id ? (
                        <Paper key={relato.id} sx={{ p: 2, mb: 2 }}>
                            <AddRelatoInline
                                members={visita.membros}
                                onAdd={(payload) => handleUpdateRelato(payload.id, payload)}
                                onCancel={cancelarEdicao}
                                initialData={{
                                    id: relato.id,
                                    autor: relato.autor,
                                    mensagem: relato.mensagem,
                                    tema: relato.tema || '',
                                }}
                                isEditing={true}
                            />
                        </Paper>
                    ) : (
                        <Paper
                            key={relato.id}
                            sx={{
                                p: 1.5,
                                mb: 1,
                                borderRadius: 2,
                                borderLeft: "6px solid brown",
                            }}
                        >
                            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                                <Box>
                                    <Typography variant="subtitle2">{relato.tema ?? "Sem tema"}</Typography>
                                    <Typography variant="body2"
                                        sx={{ whiteSpace: "pre-wrap" }}>{relato.mensagem}</Typography>
                                    <Typography variant="caption" display="block" color="text.secondary">
                                        {relato.autor} • {relato.data ? new Date(relato.data).toLocaleDateString('pt-BR') : ""}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                    <IconButton size="small" onClick={() => iniciarEdicao(relato)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => onDeleteRelato(relato.id)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Paper>
                    )
                ))}

                {relatos.length === 0 && (
                    <AddRelatoInline members={visita.membros} onAdd={onAddRelato} />

                )}
            </Box>
        </>
    );
}