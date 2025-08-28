import React from "react";
import {Box, Button, Chip, Divider, IconButton, Paper, Typography,} from "@mui/material";
import {Delete as DeleteIcon, Edit as EditIcon, Person as PersonIcon, Save as SaveIcon} from "@mui/icons-material";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {RelatoDTO, VisitaDetails} from "@/components/types";
import AddMemberInline from "./AddMemberInline";
import AddRelatoInline from "./AddRelatoInline";


interface DetalhesVisitaTabProps {
    visita: VisitaDetails;
    relatos: RelatoDTO[];
    onSaveVisit: () => void;
    onAddMember: (nome: string, cargo?: string) => void;
    onRemoveMember: (index: number) => void;
    onAddRelato: (payload: any) => void;
    onUpdateRelato: (relatoId: number, updates: Partial<RelatoDTO>) => void;
    onDeleteRelato: (relatoId: number) => void;
}

export default function DetalhesVisitaTab({
                                              visita,
                                              relatos,
                                              onSaveVisit,
                                              onAddMember,
                                              onRemoveMember,
                                              onAddRelato,
                                              onUpdateRelato,
                                              onDeleteRelato,
                                          }: DetalhesVisitaTabProps) {
    return (
        <>
            <Box sx={{display: "flex", gap: 2, alignItems: "center", mb: 3}}>
                <DatePicker
                    label="Data"
                    value={new Date(visita.dataVisita)}
                    onChange={(d) => {
                        if (!d) return;
                        const s = d.toISOString().split("T")[0];
                        // Você precisará passar uma função para atualizar a data da visita
                    }}
                    slotProps={{textField: {fullWidth: true}}}
                />
                <Button startIcon={<SaveIcon/>} variant="contained" onClick={onSaveVisit}>
                    Salvar visita
                </Button>
            </Box>

            <Box sx={{mb: 3}}>
                <Typography variant="subtitle1">Membros</Typography>
                <Box sx={{display: "flex", gap: 1, flexWrap: "wrap", mt: 1}}>
                    {visita.membros.map((m, idx) => (
                        <Chip
                            key={idx}
                            icon={<PersonIcon/>}
                            label={`${m.nome}${m.cargo ? ` — ${m.cargo}` : ""}`}
                            onDelete={() => onRemoveMember(idx)}
                            variant="outlined"
                        />
                    ))}
                    <AddMemberInline onAdd={onAddMember}/>
                </Box>
            </Box>

            <Divider sx={{my: 3}}/>

            <Box>
                <Typography variant="subtitle1" gutterBottom>Relatos</Typography>

                {relatos.slice(0, 3).map((relato) => (
                    <Paper
                        key={relato.id}
                        sx={{
                            p: 1.5,
                            mb: 1,
                            borderRadius: 2,
                            borderLeft: `4px solid rgba(0,0,0,0.08)`
                        }}
                    >
                        <Box sx={{display: "flex", justifyContent: "space-between", gap: 2}}>
                            <Box>
                                <Typography variant="subtitle2">{relato.tema ?? "Sem tema"}</Typography>
                                <Typography variant="body2" sx={{whiteSpace: "pre-wrap"}}>{relato.mensagem}</Typography>
                                <Typography variant="caption" display="block" color="text.secondary">
                                    {relato.autor} • {relato.data ? new Date(relato.data).toLocaleDateString('pt-BR') : ""}
                                </Typography>
                            </Box>
                            <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                                <IconButton size="small" onClick={() => {
                                    const novo = prompt("Editar relato", relato.mensagem);
                                    if (novo !== null) onUpdateRelato(relato.id, {mensagem: novo});
                                }}>
                                    <EditIcon fontSize="small"/>
                                </IconButton>
                                <IconButton size="small" onClick={() => onDeleteRelato(relato.id)}>
                                    <DeleteIcon fontSize="small"/>
                                </IconButton>
                            </Box>
                        </Box>
                    </Paper>
                ))}

                {relatos.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                        Nenhum relato registrado
                    </Typography>
                )}

                <Divider sx={{my: 2}}/>

                <AddRelatoInline members={visita.membros} onAdd={onAddRelato}/>
            </Box>
        </>
    );
}