import { FormCategory, Summary } from "@/components/types";

const formatAnswer = (value: string) => {
    if (!value) return "Nenhuma resposta registrada";
    if (value === "TRUE") return "Sim";
    if (value === "FALSE") return "Não";
    if (value === "CONFORME") return "Conforme";
    if (value === "PARCIAL") return "Parcial";
    if (value === "NAO_CONFORME") return "Não conforme";
    return value;
};

const sanitizePdfText = (value: string) =>
    value
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/[–—]/g, "-")
        .replace(/\u00a0/g, " ")
        .replace(/[^\x09\x0a\x0d\x20-\xff]/g, "");

const encodePdfLiteral = (value: string) => {
    const bytes: number[] = [];
    for (const char of sanitizePdfText(value)) {
        const code = char.charCodeAt(0);
        if (code === 40 || code === 41 || code === 92) bytes.push(92);
        bytes.push(code <= 255 ? code : 32);
    }
    return bytes;
};

const asciiBytes = (value: string) => Array.from(value, (char) => char.charCodeAt(0));

const concatBytes = (chunks: number[][]) => {
    const length = chunks.reduce((total, chunk) => total + chunk.length, 0);
    const output = new Uint8Array(length);
    let offset = 0;

    for (const chunk of chunks) {
        output.set(chunk, offset);
        offset += chunk.length;
    }

    return output;
};

const wrapPdfText = (text: string, maxLength: number) => {
    const words = text.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
        const next = current ? `${current} ${word}` : word;
        if (next.length <= maxLength) {
            current = next;
            continue;
        }

        if (current) lines.push(current);
        current = word;
    }

    if (current) lines.push(current);
    return lines.length ? lines : [""];
};

interface ChecklistPdfSection {
    form: FormCategory;
    formData: { [key: string]: string };
}

interface ChecklistPdfSummarySection {
    summary: Summary;
    sections: ChecklistPdfSection[];
}

const buildPdfBlob = (summarySections: ChecklistPdfSummarySection[], title: string) => {
    const pageWidth = 595;
    const pageHeight = 842;
    const margin = 48;
    const bottom = 52;
    const linesByPage: { text: string; size: number; font: "regular" | "bold"; gap?: number }[][] = [[]];
    let y = pageHeight - margin;

    const addLine = (text: string, size = 11, font: "regular" | "bold" = "regular", gap = 6) => {
        const lineHeight = size + gap;
        if (y - lineHeight < bottom) {
            linesByPage.push([]);
            y = pageHeight - margin;
        }
        linesByPage[linesByPage.length - 1].push({ text, size, font, gap });
        y -= lineHeight;
    };

    addLine(title, 18, "bold", 12);
    addLine(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 10, "regular", 14);

    summarySections.forEach(({ summary, sections }, summaryIndex) => {
        if (summaryIndex > 0) addLine("", 8, "regular", 10);
        wrapPdfText(summary.titulo, 76).forEach((line) => addLine(line, 15, "bold", 6));

        if (sections.length === 0) {
            addLine("Nenhum formulário neste summary.", 10, "regular", 10);
            return;
        }

        sections.forEach(({ form, formData }, formIndex) => {
            if (formIndex > 0) addLine("", 7, "regular", 5);
            wrapPdfText(`${form.categoria || "Checklist"}`, 82).forEach((line) => addLine(line, 13, "bold", 7));

            (form.campos || []).forEach((field, index) => {
                if (!field.id) return;

                const fieldValue = formData[field.id.toString()] ?? "";
                wrapPdfText(`${index + 1}. ${field.titulo}`, 82).forEach((line) => addLine(line, 11, "bold", 4));
                wrapPdfText(`Resposta: ${formatAnswer(fieldValue)}`, 92).forEach((line) => addLine(line, 11, "regular", 8));
            });
        });
    });

    const chunks: number[][] = [asciiBytes("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n")];
    const offsets: number[] = [0];

    const appendObject = (id: number, body: number[]) => {
        offsets[id] = chunks.reduce((total, chunk) => total + chunk.length, 0);
        chunks.push(asciiBytes(`${id} 0 obj\n`), body, asciiBytes("\nendobj\n"));
    };

    const regularFontId = 3;
    const boldFontId = 4;
    const firstPageId = 5;
    const pageObjectIds = linesByPage.map((_, index) => firstPageId + index * 2);
    const contentObjectIds = linesByPage.map((_, index) => firstPageId + index * 2 + 1);

    appendObject(1, asciiBytes("<< /Type /Catalog /Pages 2 0 R >>"));
    appendObject(2, asciiBytes(`<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`));
    appendObject(regularFontId, asciiBytes("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"));
    appendObject(boldFontId, asciiBytes("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"));

    linesByPage.forEach((pageLines, pageIndex) => {
        const content: number[][] = [];
        let currentY = pageHeight - margin;

        pageLines.forEach((line) => {
            const fontName = line.font === "bold" ? "F2" : "F1";
            content.push(asciiBytes(`BT /${fontName} ${line.size} Tf ${margin} ${currentY} Td (`));
            content.push(encodePdfLiteral(line.text));
            content.push(asciiBytes(") Tj ET\n"));
            currentY -= line.size + (line.gap ?? 6);
        });

        content.push(asciiBytes(`BT /F1 9 Tf ${pageWidth - margin - 60} 28 Td (`));
        content.push(encodePdfLiteral(`Página ${pageIndex + 1}/${linesByPage.length}`));
        content.push(asciiBytes(") Tj ET\n"));

        const contentBytes = concatBytes(content);
        appendObject(pageObjectIds[pageIndex], asciiBytes(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${regularFontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentObjectIds[pageIndex]} 0 R >>`));
        appendObject(contentObjectIds[pageIndex], [
            ...asciiBytes(`<< /Length ${contentBytes.length} >>\nstream\n`),
            ...Array.from(contentBytes),
            ...asciiBytes("endstream"),
        ]);
    });

    const xrefOffset = chunks.reduce((total, chunk) => total + chunk.length, 0);
    const objectCount = contentObjectIds[contentObjectIds.length - 1] + 1;
    const xref = [`xref\n0 ${objectCount}\n0000000000 65535 f \n`];
    for (let index = 1; index < objectCount; index += 1) {
        xref.push(`${String(offsets[index]).padStart(10, "0")} 00000 n \n`);
    }
    xref.push(`trailer\n<< /Size ${objectCount} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
    chunks.push(asciiBytes(xref.join("")));

    return new Blob([concatBytes(chunks)], { type: "application/pdf" });
};

const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};

export const downloadChecklistPdf = (form: FormCategory, formData: { [key: string]: string }) => {
    const blob = buildPdfBlob(
        [{ summary: { id: form.summaryId ?? 0, titulo: "Checklist" }, sections: [{ form, formData }] }],
        form.categoria || "Checklist"
    );
    downloadBlob(blob, `${(form.categoria || "checklist").toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.pdf`);
};

export const downloadAllChecklistsPdf = (summarySections: ChecklistPdfSummarySection[], title = "Checklists da visita") => {
    const blob = buildPdfBlob(summarySections, title);
    downloadBlob(blob, `${title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.pdf`);
};
