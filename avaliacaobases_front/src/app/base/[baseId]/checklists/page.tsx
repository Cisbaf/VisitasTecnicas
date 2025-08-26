import React from "react";
import CheckLists from "@/components/base/Checklists";

export default async function ViaturaPage({ params }: { params: Promise<{ baseId: string }> }) {

    return (
        <CheckLists />
    );
}