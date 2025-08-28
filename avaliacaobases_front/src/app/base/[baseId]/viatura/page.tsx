import React from "react";
import Viaturas from "@/components/base/Viatura";

export default async function ViaturaPage({ params }: { params: Promise<{ baseId: string }> }) {

    const { baseId } = await params;
    const baseIdNumber = Number(baseId);

    return (
        <div style={{ padding: 24 }}>
            <Viaturas baseId={baseIdNumber} />
        </div>
    );
}