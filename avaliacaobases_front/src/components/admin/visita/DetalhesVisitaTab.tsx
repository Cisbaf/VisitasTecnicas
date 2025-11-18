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

                {relatos && relatos.length > 0 && (() => {
                    // Pega o primeiro item do array (o único que será usado como 'Motivo')
                    const motivoPrincipal = relatos[0];

                    // Verifica se estamos no modo de edição (se for o caso, renderiza o formulário de edição)
                    if (editandoRelatoId === motivoPrincipal.id) {
                        return (
                            <Paper key={motivoPrincipal.id} sx={{ p: 2, mb: 2 }}>
                                <AddRelatoInline
                                    members={visita.membros}
                                    onAdd={(payload) => handleUpdateRelato(payload.id, payload)}
                                    onCancel={cancelarEdicao}
                                    initialData={{
                                        id: motivoPrincipal.id,
                                        autor: motivoPrincipal.autor,
                                        mensagem: motivoPrincipal.mensagem,
                                        tema: motivoPrincipal.tema || '',
                                    }}
                                    isEditing={true}
                                />
                            </Paper>
                        );
                    }

                    // Se não estiver em edição, renderiza o bloco de destaque Título/Subtítulo (Motivo Principal)
                    return (
                        <Box
                            key={motivoPrincipal.id}
                            sx={{
                                mb: 3,
                                textAlign: 'left',
                            }}
                        >
                            <Box>
                                {/* Título Principal: PROPÓSITO DA VISITA (ou o tema do relato, se ele for o Título) */}
                                <Typography
                                    variant="h4"
                                    component="h2"
                                    fontWeight="bold"
                                    color="text.primary"
                                    gutterBottom
                                >
                                    {/* Se o 'tema' contiver o nome do motivo, use-o; senão, use um título fixo */}
                                    {motivoPrincipal.tema || 'PROPÓSITO DA VISITA'}
                                </Typography>

                                {/* Subtítulo/Mensagem: A descrição detalhada do motivo */}
                                <Typography
                                    sx={{ fontStyle: 'italic', whiteSpace: "pre-wrap" }}
                                >
                                    {motivoPrincipal.mensagem}
                                </Typography>

                                {/* Informação secundária (Autor e Data) - Opcional, mas útil */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                    <Typography variant="caption" display="block" color="text.secondary" mt={1}>
                                        Registrado por: {motivoPrincipal.autor} em {motivoPrincipal.data ? new Date(motivoPrincipal.data).toLocaleDateString('pt-BR') : ""}
                                    </Typography>
                                    <IconButton aria-label="editar" onClick={() => iniciarEdicao(motivoPrincipal)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </div>

                            </Box>
                        </Box>
                    );
                })()}

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

                {relatos.length === 0 && (
                    <AddRelatoInline members={visita.membros} onAdd={onAddRelato} />

                )}
            </Box>
        </>
    );
}