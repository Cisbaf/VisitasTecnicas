"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { ReactNode } from "react";

const theme = createTheme({
    palette: {
        secondary: {
            main: "#F28C28",
            dark: "#C96D12",
            contrastText: "#ffffff",
        },
        error: {
            main: "#830101",
            dark: "#5a0000",
            contrastText: "#ffffff",
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 700,
                    boxShadow: "none",
                    textTransform: "none",
                    "&:hover": {
                        boxShadow: "none",
                    },
                },
                containedPrimary: {
                    color: "#ffffff",
                },
                containedSecondary: {
                    backgroundColor: "#F28C28",
                    color: "#ffffff",
                    "&:hover": {
                        backgroundColor: "#C96D12",
                    },
                },
                containedError: {
                    backgroundColor: "#830101",
                    color: "#ffffff",
                    "&:hover": {
                        backgroundColor: "#5a0000",
                    },
                },
                outlinedPrimary: {
                    fontWeight: 700,
                },
                textPrimary: {
                    fontWeight: 700,
                },
            },
        },
    },
});

export default function AppThemeProvider({ children }: { children: ReactNode }) {
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
