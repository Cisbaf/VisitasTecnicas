"use client";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Select, Stack, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useState, useEffect } from "react";
import 'dayjs/locale/pt-br';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from 'dayjs';


interface VisitaDialogProps {
    open: boolean;
    onClose: () => void;
    onCreate: (date: Date | null, obs: string) => void;
    isEditing?: boolean;
    initialDate?: Date | null;
    initialObs?: string;
}

export default function VisitaDialog({
    open,
    onClose,
    onCreate,
    isEditing = false,
    initialDate = null,
    initialObs = ""
}: VisitaDialogProps) {
    const [date, setDate] = useState<dayjs.Dayjs | null>(initialDate ? dayjs(initialDate).add(1, "day") : null);
    const [obs, setObs] = useState(initialObs);

    useEffect(() => {
        if (open) {
            setDate(initialDate ? dayjs(initialDate).startOf("day").add(1, "day") : null);
            setObs(initialObs);
        }
    }, [open, initialDate, initialObs]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate(date ? date.startOf("day").toDate() : null, obs);
        if (!isEditing) {
            setDate(dayjs().startOf("day"));
            setObs("");
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>{isEditing ? "Editar Visita" : "Nova Visita"}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ gap: 3, display: "flex" }}>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <DatePicker
                                label="Data da Visita"
                                value={date ? dayjs(date) : null}
                                onChange={(newValue) => setDate(dayjs(newValue).startOf("day"))}
                                slotProps={{ textField: { fullWidth: true, required: true } }}
                            />

                        </Stack>
                        <Select
                            native
                            label="Tipo de Visita"
                            fullWidth
                            required
                            value={obs}
                            onChange={(e) => setObs((e.target as HTMLSelectElement).value)}
                        >
                            <option value="">Selecione um tipo de visita</option>
                            <option value="REDE DOR">Rede Dór</option>
                            <option value="Inspecao">Inspeção</option>
                            <option value="OUTRA">Outra</option>
                        </Select>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose}>Cancelar</Button>
                        <Button type="submit" variant="contained">
                            {isEditing ? "Salvar" : "Criar"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </LocalizationProvider>
    );
}