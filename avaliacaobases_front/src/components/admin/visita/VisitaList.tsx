import {Box, Card, CardContent, Chip, CircularProgress, Grid, IconButton, Typography} from "@mui/material";
import {CalendarToday as CalendarIcon, Delete as DeleteIcon} from "@mui/icons-material";
import {VisitaDetails} from "@/components/types";
import {useRouter} from "next/navigation";

interface VisitaListProps {
    baseId: number;
    visitas: VisitaDetails[];
    loading: boolean;
    openVisitDetail: (id: number) => void;
    handleDeleteVisita: (id: number) => void;
}


export default function VisitaList({baseId, visitas, loading, openVisitDetail, handleDeleteVisita}: VisitaListProps) {
    const router = useRouter();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <Grid container spacing={2}>
            {visitas.map((v) => (
                <Card sx={{cursor: "pointer"}} onClick={() => router.push(`/admin/bases/${baseId}/visitas/${v.id}`)}>
                    <CardContent>
                        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                            <Box sx={{display: "flex", alignItems: "center"}}>
                                <CalendarIcon sx={{mr: 1}}/>
                                <Typography
                                    variant="h6">{new Date(v.dataVisita).toLocaleDateString("pt-BR")}</Typography>
                            </Box>
                            <Box sx={{display: "flex", gap: 1, alignItems: "center"}}>
                                <Chip label={`${v.membros?.length ?? 0} membros`} size="small"/>
                                <IconButton size="small" onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteVisita(v.id);
                                }}>
                                    <DeleteIcon/>
                                </IconButton>
                            </Box>
                        </Box>
                        {v.observacoes && <Typography variant="body2" sx={{mt: 1}}>{v.observacoes}</Typography>}
                    </CardContent>
                </Card>
            ))}
        </Grid>
    );
}