// app/base/[baseId]/viatura/page.tsx
import React from "react";
import Viaturas from "@/components/base/Viatura";
export default async function ViaturaPage({ params }: { params: { baseId: string } }) {
    const baseId = await Number(params.baseId);
    return (
        <div style={{ padding: 24 }}>
            <Viaturas baseId={baseId} />
        </div>
    );
}
