// ────────────────────────────────────────────────────────────
// Novak — Facturación CFDI 4.0 (interfaz de PAC).
// Conmutable: con credenciales de PAC (Facturama / SW sapien) timbra real;
// sin ellas devuelve un CFDI demo válido en forma para probar el flujo.
// ────────────────────────────────────────────────────────────

const IVA = 0.16;

export interface CfdiConcepto {
  descripcion: string;
  cantidad: number;
  valor_unitario: number;
  clave_prod_serv?: string; // catálogo SAT
  unidad?: string;
}

export interface CfdiInput {
  folio: string;
  receptor_rfc: string;
  receptor_nombre: string;
  receptor_uso?: string; // G03 gastos en general
  conceptos: CfdiConcepto[];
  forma_pago?: string; // 99 por definir / 03 transferencia
  metodo_pago?: string; // PUE / PPD
}

export interface CfdiResult {
  ok: boolean;
  demo: boolean;
  uuid?: string; // folio fiscal
  serie?: string;
  folio?: string;
  xml_url?: string;
  pdf_url?: string;
  total?: number;
  fecha_timbrado?: string;
  error?: string;
}

function pacConfigurado(): boolean {
  return !!(process.env.PAC_API_URL && process.env.PAC_API_KEY);
}

function totalDe(conceptos: CfdiConcepto[]): { subtotal: number; iva: number; total: number } {
  const subtotal = conceptos.reduce((a, c) => a + c.cantidad * c.valor_unitario, 0);
  const iva = subtotal * IVA;
  return { subtotal, iva, total: subtotal + iva };
}

/** Timbra un CFDI 4.0. Real con PAC, demo en forma sin credenciales. */
export async function timbrarCFDI(input: CfdiInput): Promise<CfdiResult> {
  const { total } = totalDe(input.conceptos);

  if (!pacConfigurado()) {
    const uuid = crypto.randomUUID().toUpperCase();
    return {
      ok: true,
      demo: true,
      uuid,
      serie: "NVK",
      folio: input.folio,
      xml_url: `https://cfdi.novak.mx/${uuid}.xml`,
      pdf_url: `https://cfdi.novak.mx/${uuid}.pdf`,
      total,
      fecha_timbrado: new Date().toISOString(),
    };
  }

  try {
    const res = await fetch(`${process.env.PAC_API_URL}/cfdi/stamp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PAC_API_KEY}`,
      },
      body: JSON.stringify({
        version: "4.0",
        serie: "NVK",
        folio: input.folio,
        receptor: { rfc: input.receptor_rfc, nombre: input.receptor_nombre, uso_cfdi: input.receptor_uso ?? "G03" },
        forma_pago: input.forma_pago ?? "03",
        metodo_pago: input.metodo_pago ?? "PUE",
        conceptos: input.conceptos.map((c) => ({
          clave_prod_serv: c.clave_prod_serv ?? "01010101",
          cantidad: c.cantidad,
          clave_unidad: c.unidad ?? "H87",
          descripcion: c.descripcion,
          valor_unitario: c.valor_unitario,
          objeto_imp: "02",
          traslados: [{ impuesto: "002", tipo_factor: "Tasa", tasa: IVA }],
        })),
      }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`PAC ${res.status}`);
    const data = await res.json();
    return {
      ok: true,
      demo: false,
      uuid: data.uuid ?? data.folio_fiscal,
      serie: data.serie ?? "NVK",
      folio: data.folio ?? input.folio,
      xml_url: data.xml_url,
      pdf_url: data.pdf_url,
      total,
      fecha_timbrado: data.fecha_timbrado ?? new Date().toISOString(),
    };
  } catch (e: any) {
    return { ok: false, demo: false, error: e?.message ?? "Error al timbrar." };
  }
}
