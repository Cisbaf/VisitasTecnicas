// components/admin/visita/VisitaDialog.tsx
"use client";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useState, useEffect } from "react";

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
    const [date, setDate] = useState<Date | null>(initialDate);
    const [obs, setObs] = useState(initialObs);

    useEffect(() => {
        if (open) {
            setDate(initialDate);
            setObs(initialObs);
        }
    }, [open, initialDate, initialObs]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate(date, obs);
        if (!isEditing) {
            setDate(new Date());
            setObs("");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{isEditing ? "Editar Visita" : "Nova Visita"}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <DatePicker
                            label="Data da Visita"
                            value={date}
                            onChange={(v) => setDate(v)}
                            slotProps={{ textField: { fullWidth: true, required: true } }}
                        />

                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="contained">
                        {isEditing ? "Salvar" : "Criar"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}