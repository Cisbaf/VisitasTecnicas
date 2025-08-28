// components/NewVisitaDialog.tsx
"use client";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField} from "@mui/material";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {useState} from "react";

interface NewVisitaDialogProps {
    open: boolean;
    onClose: () => void;
    onCreate: (date: Date | null, obs: string) => void;
}

export default function NewVisitaDialog({open, onClose, onCreate}: NewVisitaDialogProps) {
    const [newDate, setNewDate] = useState<Date | null>(new Date());
    const [newObs, setNewObs] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate(newDate, newObs);
        setNewObs("");
        setNewDate(new Date());
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Nova Visita</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Stack spacing={2} sx={{mt: 1}}>
                        <DatePicker
                            label="Data da Visita"
                            value={newDate}
                            onChange={(v) => setNewDate(v)}
                            slotProps={{textField: {fullWidth: true, required: true}}}
                        />
                        <TextField
                            label="Observações"
                            fullWidth
                            multiline
                            rows={3}
                            value={newObs}
                            onChange={(e) => setNewObs(e.target.value)}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="contained">Criar</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}