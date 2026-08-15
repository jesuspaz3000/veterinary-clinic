import { SalesService } from "../service/sales.service";

// El PDF se genera en el backend (com.veterinaria.backend.sales.service.InvoicePdfService)
// y se abre en una pestaña nueva usando el visor de PDF nativo del navegador,
// desde donde el usuario puede imprimir o guardar el archivo.
export async function printInvoice(invoiceId: string): Promise<void> {
  try {
    const blob = await SalesService.getInvoicePdf(invoiceId);
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    // Se libera el blob luego de que el navegador tuvo tiempo de cargarlo en la nueva pestaña.
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  } catch (error) {
    console.error("Error al generar el PDF del comprobante:", error);
    window.alert("No se pudo generar el PDF del comprobante. Intenta nuevamente.");
  }
}
