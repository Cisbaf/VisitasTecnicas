"use client";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Select, Stack, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useState, useEffect } from "react";
import 'dayjs/locale/pt-br';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from 'dayjs';
import { VisitaDetails } from "@/components/types";


interface VisitaDialogProps {
    open: boolean;
    onClose: () => void;
    onCreate: (visita: VisitaDetails) => void;
    isEditing?: boolean;
    visita: VisitaDetails;
}

export default function VisitaDialog({
    open,
    onClose,
    onCreate,
    isEditing = false,
    visita
}: VisitaDialogProps) {
    const [date, setDate] = useState<dayjs.Dayjs | null>(visita ? dayjs(visita.dataVisita).add(0, "day") : null);
    const [obs, setObs] = useState(visita ? visita.tipoVisita : "");

    useEffect(() => {
        if (open) {
            setDate(visita ? dayjs(visita.dataVisita).startOf("day").add(0, "day") : null);
            setObs(visita ? visita.tipoVisita : "");
        }
    }, [open, visita]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate({
            ...visita,
            dataVisita: date ? date.startOf("day").toDate().toISOString().split("T")[0] : "",
            tipoVisita: obs ? obs : ""
        });
        onClose();

        if (!isEditing) {
            setDate(null);
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
                            <option value="Inspeção">Inspeção</option>
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