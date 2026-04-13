"use client";
import React from "react";

import { useParams } from "next/navigation";
import AdminHomePage from "../admin/dashboard/AdminHome";

export default function DashboardPage() {
    const params = useParams();
    const baseId = String(params.baseId);

    return (
        <AdminHomePage baseId={baseId} />
    );
}