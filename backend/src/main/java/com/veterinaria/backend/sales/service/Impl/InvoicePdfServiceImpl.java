package com.veterinaria.backend.sales.service.Impl;

import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.veterinaria.backend.sales.dto.InvoiceDTO;
import com.veterinaria.backend.sales.dto.InvoiceItemDTO;
import com.veterinaria.backend.sales.dto.InvoicePaymentDTO;
import com.veterinaria.backend.sales.service.InvoicePdfService;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Map;

@Service
public class InvoicePdfServiceImpl implements InvoicePdfService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.systemDefault());

    private static final Map<String, String> INVOICE_TYPE_LABELS = Map.of(
            "boleta", "Boleta de Venta",
            "factura", "Factura",
            "ticket", "Ticket de Venta"
    );

    private static final Map<String, String> PAYMENT_METHOD_LABELS = Map.of(
            "efectivo", "Efectivo",
            "yape_plin", "Yape / Plin",
            "tarjeta", "Tarjeta de Débito/Crédito",
            "transferencia", "Transferencia Bancaria",
            "credito", "Crédito a Cuenta"
    );

    private static final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
    private static final Font SUBTITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);
    private static final Font LABEL_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9);
    private static final Font TEXT_FONT = FontFactory.getFont(FontFactory.HELVETICA, 9);
    private static final Font HEADER_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
    private static final Font TOTAL_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
    private static final Color HEADER_BG = new Color(42, 191, 191);

    @Override
    public byte[] generatePdf(InvoiceDTO invoice) {
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            document.add(new Paragraph("VetGest — " + typeLabel(invoice.getInvoiceType()), TITLE_FONT));
            document.add(new Paragraph("Comprobante N° " + invoice.getInvoiceNumber(), SUBTITLE_FONT));
            document.add(new Paragraph(" "));

            document.add(buildMetaTable(invoice));
            document.add(new Paragraph(" "));

            document.add(buildItemsTable(invoice));
            document.add(new Paragraph(" "));

            document.add(buildTotalsTable(invoice));

            if (!invoice.getPayments().isEmpty()) {
                document.add(new Paragraph(" "));
                document.add(buildPaymentsTable(invoice));
            }

            if (invoice.getNotes() != null && !invoice.getNotes().isBlank()) {
                document.add(new Paragraph(" "));
                Paragraph notes = new Paragraph();
                notes.add(new Chunk("Notas: ", LABEL_FONT));
                notes.add(new Chunk(invoice.getNotes(), TEXT_FONT));
                document.add(notes);
            }

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Error al generar el PDF del comprobante", e);
        }

        return out.toByteArray();
    }

    private String typeLabel(String invoiceType) {
        return INVOICE_TYPE_LABELS.getOrDefault(invoiceType, invoiceType);
    }

    private String customerLine(InvoiceDTO invoice) {
        if (invoice.getOwnerName() != null && !invoice.getOwnerName().isBlank()) {
            String doc = invoice.getOwnerDocumentNumber() != null ? invoice.getOwnerDocumentNumber() : "S/D";
            return invoice.getOwnerName() + " (" + doc + ")";
        }
        if (invoice.getCustomerName() != null && !invoice.getCustomerName().isBlank()) {
            return invoice.getCustomerName() + " (no registrado)";
        }
        return "Cliente Genérico (Venta Mostrador)";
    }

    private PdfPTable buildMetaTable(InvoiceDTO invoice) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);

        PdfPCell left = borderlessCell();
        left.addElement(labelValue("Cliente:", customerLine(invoice)));
        left.addElement(labelValue("Cajero:", invoice.getUserName() != null ? invoice.getUserName() : "Usuario Sistema"));
        table.addCell(left);

        PdfPCell right = borderlessCell();
        right.addElement(labelValue("Fecha:", invoice.getIssuedAt() != null ? DATE_FORMAT.format(invoice.getIssuedAt()) : "-"));
        right.addElement(labelValue("Estado:", invoice.getPaymentStatus().toUpperCase(Locale.ROOT)));
        table.addCell(right);

        return table;
    }

    private Paragraph labelValue(String label, String value) {
        Paragraph p = new Paragraph();
        p.add(new Chunk(label + " ", LABEL_FONT));
        p.add(new Chunk(value, TEXT_FONT));
        return p;
    }

    private PdfPCell borderlessCell() {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(0);
        return cell;
    }

    private PdfPTable buildItemsTable(InvoiceDTO invoice) throws DocumentException {
        PdfPTable table = new PdfPTable(new float[]{4, 1, 1.3f, 1.3f, 1.3f});
        table.setWidthPercentage(100);

        addHeaderCell(table, "Descripción");
        addHeaderCell(table, "Cant.");
        addHeaderCell(table, "P. Unit.");
        addHeaderCell(table, "Dscto.");
        addHeaderCell(table, "Subtotal");

        for (InvoiceItemDTO item : invoice.getItems()) {
            table.addCell(dataCell(item.getDescription(), Element.ALIGN_LEFT));
            table.addCell(dataCell(item.getQuantity().stripTrailingZeros().toPlainString(), Element.ALIGN_RIGHT));
            table.addCell(dataCell(money(item.getUnitPrice()), Element.ALIGN_RIGHT));
            table.addCell(dataCell(money(item.getDiscount()), Element.ALIGN_RIGHT));
            table.addCell(dataCell(money(item.getSubtotal()), Element.ALIGN_RIGHT));
        }

        return table;
    }

    private PdfPTable buildTotalsTable(InvoiceDTO invoice) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(45);
        table.setHorizontalAlignment(Element.ALIGN_RIGHT);

        BigDecimal subtotalBeforeTax = invoice.getTotal().subtract(invoice.getTax());
        addTotalRow(table, "Subtotal:", money(subtotalBeforeTax), TEXT_FONT);
        addTotalRow(table, "IGV (18% incluido):", money(invoice.getTax()), TEXT_FONT);
        addTotalRow(table, "TOTAL:", money(invoice.getTotal()), TOTAL_FONT);
        addTotalRow(table, "Pagado:", money(invoice.getAmountPaid()), TEXT_FONT);

        if (invoice.getBalance().compareTo(new BigDecimal("0.05")) > 0) {
            addTotalRow(table, "Saldo pendiente:", money(invoice.getBalance()), TEXT_FONT);
        }

        return table;
    }

    private void addTotalRow(PdfPTable table, String label, String value, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, LABEL_FONT));
        labelCell.setBorder(0);
        labelCell.setPaddingTop(3);
        labelCell.setPaddingBottom(3);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(0);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        valueCell.setPaddingTop(3);
        valueCell.setPaddingBottom(3);
        table.addCell(valueCell);
    }

    private PdfPTable buildPaymentsTable(InvoiceDTO invoice) throws DocumentException {
        PdfPTable table = new PdfPTable(new float[]{2, 1.3f, 2});
        table.setWidthPercentage(100);

        addHeaderCell(table, "Método de Pago");
        addHeaderCell(table, "Monto");
        addHeaderCell(table, "N° Operación");

        for (InvoicePaymentDTO payment : invoice.getPayments()) {
            table.addCell(dataCell(PAYMENT_METHOD_LABELS.getOrDefault(payment.getPaymentMethod(), payment.getPaymentMethod()), Element.ALIGN_LEFT));
            table.addCell(dataCell(money(payment.getAmount()), Element.ALIGN_RIGHT));
            table.addCell(dataCell(payment.getReferenceNumber() != null && !payment.getReferenceNumber().isBlank() ? payment.getReferenceNumber() : "-", Element.ALIGN_LEFT));
        }

        return table;
    }

    private void addHeaderCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, HEADER_FONT));
        cell.setBackgroundColor(HEADER_BG);
        cell.setPadding(5);
        table.addCell(cell);
    }

    private PdfPCell dataCell(String text, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, TEXT_FONT));
        cell.setHorizontalAlignment(alignment);
        cell.setPadding(5);
        return cell;
    }

    private String money(BigDecimal value) {
        return "S/. " + value.setScale(2, java.math.RoundingMode.HALF_UP).toPlainString();
    }
}
