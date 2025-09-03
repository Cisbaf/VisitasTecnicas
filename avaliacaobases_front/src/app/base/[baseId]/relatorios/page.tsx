"use client";
import React from "react";
import { useParams } from "next/navigation";

import RelatorioConsolidado from "@/components/base/relatorioConsolidado/RelatorioConsolidado";

export default function RelatoriosPage() {
    const params = useParams();
    const baseId = Number(params.baseId);

    return (
        <RelatorioConsolidado baseId={baseId} />
    );
}
