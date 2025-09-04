"use client";
import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { BaseResponse } from "@/components/types";
import AdminRelatorios from "@/components/admin/relatorio/AdminRelatorios";

const useBases = () => {
    const [bases, setBases] = useState<BaseResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBases = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/base`);
                if (!response.ok) {
                    throw new Error('Falha ao carregar as bases');
                }
                const data = await response.json();
                setBases(data);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido';
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchBases();
    }, []);

    return { bases, loading, error };
};

export default function RelatoriosPage() {
    const { bases } = useBases();

    return (
        <Box sx={{ p: 1 }}>
            <AdminRelatorios bases={bases} />
        </Box>
    );
}