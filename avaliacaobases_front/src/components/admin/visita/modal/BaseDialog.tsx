"use client";
import React, { Dispatch, SetStateAction } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Select, Stack, TextField, } from "@mui/material";
import { BaseRequest } from "@/components/types";


interface BaseDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    formData: BaseRequest;
    setFormData: Dispatch<SetStateAction<BaseRequest | undefined>>;
    editingBase?: boolean;
    handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    phoneError?: string | null;
    emailError?: string | null;
}

export default function BaseDialog({
    open,
    onClose,
    onSubmit,
    formData,
    setFormData,
    editingBase = false,
    handlePhoneChange,
    handleEmailChange,
    phoneError,
    emailError,
}: BaseDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{editingBase ? "Editar Base" : "Nova Base"}</DialogTitle>
            <form onSubmit={onSubmit}>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            autoFocus
                            label="Nome da Base"
                            fullWidth
                            required
                            value={formData?.nome || ""}
                            onChange={(e) =>
                                setFormData({ ...formData, nome: e.target.value })
                            }
                        />
                        <div style={{ display: "flex", gap: 5 }}>
                            <TextField
                                label="Bairro"
                                required
                                value={formData?.bairro || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, bairro: e.target.value })
                                }
                            />
                            <TextField
                                label="Município"
                                required
                                value={formData?.municipio || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, municipio: e.target.value })
                                }
                            />
                            <TextField
                                label="Endereço"
                                required
                                value={formData?.endereco || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, endereco: e.target.value })
                                }
                            />
                        </div>
                        <div style={{ display: "flex", gap: 5 }}>
                            <TextField
                                label="Telefone"
                                fullWidth
                                required
                                type="tel"
                                inputProps={{ maxLength: 15 }}
                                placeholder="(00) 90000-0000"
                                value={formData?.telefone || ""}
                                onChange={handlePhoneChange}
                                error={!!phoneError}
                                helperText={phoneError || " "}
                            />
                            <TextField
                                label="Email"
                                fullWidth
                                required
                                type="email"
                                value={formData?.email || ""}
                                onChange={handleEmailChange}
                                error={!!emailError}
                                helperText={emailError || " "}
                            />
                        </div>
                        <Select
                            native
                            onChange={(e) => setFormData({ ...formData, tipoBase: e.target.value })}
                            label="Tipo da Base"
                            fullWidth
                            required
                            value={formData?.tipoBase || ""}
                        >
                            <option value="" disabled>Selecione o Tipo da Base</option>
                            <option value="DESCENTRALIZADA">Descentralizada</option>
                            <option value="DOR">Rede DÓR</option>
                            <option value="OUTRA">Outra</option>
                        </Select>

                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="contained">
                        {editingBase ? "Atualizar" : "Criar"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
