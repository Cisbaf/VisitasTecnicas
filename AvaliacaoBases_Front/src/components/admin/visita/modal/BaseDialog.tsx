"use client";
import React, { Dispatch, SetStateAction } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    useMediaQuery,
    useTheme,
} from "@mui/material";
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            fullScreen={isMobile} // 👈 tela cheia no mobile para melhor UX
        >
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

                        {/* Campos de endereço — empilham no mobile */}
                        <Stack
                            direction={isMobile ? "column" : "row"}
                            spacing={isMobile ? 2 : 1}
                        >
                            <TextField
                                label="Bairro"
                                required
                                fullWidth
                                value={formData?.bairro || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, bairro: e.target.value })
                                }
                            />
                            <TextField
                                label="Município"
                                required
                                fullWidth
                                value={formData?.municipio || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, municipio: e.target.value })
                                }
                            />
                            <TextField
                                label="Endereço"
                                required
                                fullWidth
                                value={formData?.endereco || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, endereco: e.target.value })
                                }
                            />
                        </Stack>

                        {/* Telefone e Email — empilham no mobile */}
                        <Stack
                            direction={isMobile ? "column" : "row"}
                            spacing={isMobile ? 2 : 1}
                        >
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
                        </Stack>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: isMobile ? 3 : 2 }}>
                    <Button onClick={onClose} fullWidth={isMobile}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth={isMobile}
                    >
                        {editingBase ? "Atualizar" : "Criar"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}