// src/components/visual/MidiaGallery.tsx
import React, { useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import CloseIcon from "@mui/icons-material/Close";
import { Flag, Midia } from "@/components/types";

interface MidiaGalleryProps {
    midias: Midia[];
    onSetFlag: (midiaId: number, flag: Flag) => void;
    onUploadMidia: (file: File, tipo: string) => void;
}

const getSafeImageUrl = (base64DataUrl: string | null): string => {
    if (!base64DataUrl) return "";
    if (base64DataUrl.startsWith("data:image/")) return base64DataUrl;
    return `data:image/jpeg;base64,${base64DataUrl}`;
};

const getCardColor = (flag: Flag) => {
    switch (flag) {
        case "GREEN":
            return "#8FD28B";
        case "YELLOW":
            return "#FFEF5C";
        case "RED":
            return "#E74646";
        default:
            return "#ffffff";
    }
};

export default function MidiaGallery({
    midias,
    onSetFlag,
    onUploadMidia,
}: MidiaGalleryProps) {
    const [open, setOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState<{ url: string; id?: string } | null>(null);

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

    const handleOpenImage = (url: string, id?: string) => {
        setCurrentImage({ url, id: id });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentImage(null);
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                Fotos
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 2,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        flexWrap: "wrap",
                        flex: 1,
                        maxHeight: "400px",
                        overflowY: "auto",
                        p: 1,
                    }}
                >
                    {midias.length === 0 && (
                        <Typography color="text.secondary">Nenhuma foto adicionada.</Typography>
                    )}

                    {midias.map((midia) => {
                        const imageUrl = getSafeImageUrl(midia.base64DataUrl ?? null);
                        const isImageValid = !!imageUrl && !imageUrl.includes("EFBFBD");
                        const cardColor = getCardColor(midia.flag!);

                        return (
                            <Box
                                key={midia.id}
                                sx={{
                                    position: "relative",
                                    border: "1px solid #ddd",
                                    borderRadius: 1,
                                    p: 1,
                                    minWidth: "220px",
                                    display: "flex",
                                    flexDirection: "column",
                                    backgroundColor: cardColor,
                                    transition: "background-color 0.3s ease",
                                }}
                            >
                                <Box
                                    sx={{
                                        height: "200px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor: "#f5f5f5",
                                        cursor: isImageValid ? "pointer" : "default",
                                        overflow: "hidden",
                                    }}
                                    onClick={() => {
                                        if (isImageValid) handleOpenImage(imageUrl, `midia-${midia.id}`);
                                    }}
                                >
                                    {isImageValid ? (
                                        <img
                                            src={imageUrl}
                                            alt={`midia-${midia.id}`}
                                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        <Box
                                            sx={{
                                                width: "100%",
                                                height: "100%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "#999",
                                            }}
                                        >
                                            <Typography variant="caption">Imagem não disponível</Typography>
                                        </Box>
                                    )}
                                </Box>

                                <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 1 }}>
                                    <Tooltip title="Marcar verde">
                                        <IconButton
                                            size="small"
                                            onClick={() => onSetFlag(midia.id, "GREEN")}
                                        >
                                            <FiberManualRecordIcon sx={{ color: "green", fontSize: 20 }} />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Marcar amarela">
                                        <IconButton
                                            size="small"
                                            onClick={() => onSetFlag(midia.id, "YELLOW")}
                                        >
                                            <FiberManualRecordIcon sx={{ color: "goldenrod", fontSize: 20 }} />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Marcar vermelha">
                                        <IconButton
                                            size="small"
                                            onClick={() => onSetFlag(midia.id, "RED")}
                                        >
                                            <FiberManualRecordIcon sx={{ color: "red", fontSize: 20 }} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>


                            </Box>
                        );
                    })}
                </Box>

                <Box>
                    <Button variant="outlined" startIcon={<PhotoCamera />} component="label">
                        Adicionar Foto
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    onUploadMidia(e.target.files[0], "FOTO");
                                }
                            }}
                        />
                    </Button>
                </Box>
            </Box>

            {/* DIALOG*/}
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="lg"
                fullScreen={fullScreen}
            >
                <DialogTitle
                    sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: "#f5f5f5" }}>
                    <IconButton onClick={handleClose} size="small" aria-label="Fechar" sx={{ color: "black" }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent
                    dividers
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        p: 0,
                        bgcolor: "transparent",
                        minHeight: fullScreen ? "100vh" : "60vh"

                    }}
                >
                    {currentImage ? (
                        <img
                            src={currentImage.url}
                            alt={currentImage.id}
                            style={{
                                maxWidth: "100%",
                                maxHeight: fullScreen ? "100vh" : "80vh",
                                objectFit: "contain",
                                display: "block",
                            }}
                        />
                    ) : null}
                </DialogContent>
            </Dialog>
        </Box>
    );
}