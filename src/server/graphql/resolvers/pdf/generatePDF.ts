import { renderToStream } from "@react-pdf/renderer";
import * as templates from "../../../pdf";
import { createElement } from "react";

interface PDFData {
    message: string;
    items: string[];
}

interface GeneratePDFArgs {
    template: string;
    data: PDFData;
}

const generatePDF = async (_: any, { template, data }: GeneratePDFArgs) => {
    try {
        console.log(templates);
        console.log("Generating PDF with template", template);
        const componentName = template
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join("") + "Template";

        console.log("Component name", componentName);

        const Template = templates[componentName as keyof typeof templates];

        console.log("Template", Template);

        if (!Template) {
            throw new Error("Template not found");
        }

        // Asegurar que el tipo sea correcto
        const MyDocument: any = createElement(Template, { data });

        // Renderizar a stream el documento correctamente tipado
        const stream = await renderToStream(MyDocument);

        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            stream.on("data", (chunk) => chunks.push(chunk));
            stream.on("end", () => resolve(Buffer.concat(chunks).toString("base64")));
            stream.on("error", (error) => reject(error));
        });
    } catch (error) {
        throw new Error("Error generating PDF: " + (error instanceof Error ? error.message : "Unknown error"));
    }
}

export default generatePDF;