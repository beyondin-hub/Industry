import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Extrae el texto de un PDF (catálogo del proveedor) para alimentar el
 * enriquecimiento con IA. Recibe el archivo como multipart/form-data (campo "file").
 */
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No se recibió archivo." }, { status: 400 });
    }
    const buf = Buffer.from(await (file as File).arrayBuffer());

    const mod: any = await import("pdf-parse");
    const PDFParse = mod.PDFParse ?? mod.default?.PDFParse;
    if (!PDFParse) {
      return NextResponse.json({ error: "Parser no disponible." }, { status: 500 });
    }

    const parser = new PDFParse({ data: new Uint8Array(buf) });
    const result = await parser.getText();
    const text: string = (result?.text ?? "").trim();

    // Líneas útiles: descarta vacías y encabezados muy cortos/numéricos sueltos.
    const lineas = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length >= 4 && /[a-zA-Z]/.test(l))
      .slice(0, 120);

    return NextResponse.json({ text: lineas.join("\n"), lineas: lineas.length });
  } catch (e: any) {
    return NextResponse.json(
      { error: "No se pudo leer el PDF. Prueba con CSV/TXT o pega la lista.", detail: e?.message },
      { status: 200 },
    );
  }
}
