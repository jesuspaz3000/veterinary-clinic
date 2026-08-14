"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import { InvoiceResponse } from "../types/salesTypes";
import RegisterPaymentDialog from "./RegisterPaymentDialog";

interface InvoiceDetailDialogProps {
  open: boolean;
  invoice: InvoiceResponse | null;
  onClose: () => void;
  onChanged?: () => void;
}

const STATUS_CHIP: Record<string, { label: string; color: "success" | "error" | "warning" | "info" }> = {
  pagado: { label: "PAGADO", color: "success" },
  anulado: { label: "ANULADO", color: "error" },
  parcial: { label: "PAGO PARCIAL", color: "warning" },
  pendiente: { label: "PENDIENTE", color: "info" },
};

export default function InvoiceDetailDialog({ open, invoice, onClose, onChanged }: InvoiceDetailDialogProps) {
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceResponse | null>(invoice);
  const [prevInvoice, setPrevInvoice] = useState<InvoiceResponse | null>(invoice);
  const [registerPaymentOpen, setRegisterPaymentOpen] = useState(false);

  if (invoice !== prevInvoice) {
    setPrevInvoice(invoice);
    setCurrentInvoice(invoice);
  }

  if (!currentInvoice) return null;
  const invoiceData = currentInvoice;

  const status = invoiceData.paymentStatus.toLowerCase();
  const isAnulado = status === "anulado";
  const statusChip = STATUS_CHIP[status] ?? { label: invoiceData.paymentStatus.toUpperCase(), color: "info" as const };
  const canRegisterPayment = !isAnulado && invoiceData.balance > 0.05;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ReceiptLongRoundedIcon color="primary" /> Comprobante de Venta N° {invoiceData.invoiceNumber}
        </Box>
        <Chip label={statusChip.label} color={statusChip.color} sx={{ fontWeight: 700 }} />
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
        {/* Header Metadata */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: "10px", display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Tipo de Comprobante
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: "capitalize" }}>
              {invoiceData.invoiceType}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Cliente / Propietario
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {invoiceData.ownerName ? `${invoiceData.ownerName} (${invoiceData.ownerDocumentNumber || "S/D"})` : "Cliente Genérico (Venta Mostrador)"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Emisión / Atendido por
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {new Date(invoiceData.issuedAt).toLocaleString()} ({invoiceData.userName})
            </Typography>
          </Box>
        </Paper>

        {/* Items Table */}
        <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
          Detalle de Ítems Vendidos
        </Typography>

        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: "10px" }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "action.hover" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Ítem / Descripción</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  Cantidad
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Precio U. (S/.)
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Dscto (S/.)
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Subtotal (S/.)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoiceData.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.description}
                    </Typography>

                    {/* FEFO Lot Breakdown if present */}
                    {item.itemLots && item.itemLots.length > 0 && (
                      <Box sx={{ mt: 0.5, pl: 1, borderLeft: "2px solid", borderColor: "primary.main" }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Lotes consumidos (FEFO):
                        </Typography>
                        {item.itemLots.map((lot) => (
                          <Typography key={lot.id} variant="caption" color="text.secondary" sx={{ display: "block" }}>
                            - Lote N° <strong>{lot.lotNumber}</strong> (Venc: {lot.expirationDate}) — Cant: {lot.quantity}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {item.quantity} {item.unitMeasure || ""}
                  </TableCell>
                  <TableCell align="right">S/. {item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell align="right">S/. {(item.discount || 0).toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    S/. {item.subtotal.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Payments & Totals */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 280px" }, gap: 3 }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: "10px" }}>
            <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700, mb: 1 }}>
              Desglose de Pagos Registrados
            </Typography>
            {invoiceData.payments.map((p) => (
              <Box key={p.id} sx={{ display: "flex", justifyContent: "space-between", py: 0.5, borderBottom: "1px dashed", borderColor: "divider" }}>
                <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                  {p.paymentMethod.replace("_", " / ")} {p.referenceNumber ? `(Voucher: ${p.referenceNumber})` : ""}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  S/. {p.amount.toFixed(2)}
                </Typography>
              </Box>
            ))}
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: "10px", display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Subtotal:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                S/. {invoiceData.subtotal.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Descuento Total:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                S/. {invoiceData.discount.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                IGV (18%):
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                S/. {invoiceData.tax.toFixed(2)}
              </Typography>
            </Box>
            <Divider sx={{ my: 0.5 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                TOTAL:
              </Typography>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>
                S/. {invoiceData.total.toFixed(2)}
              </Typography>
            </Box>
            {invoiceData.balance > 0.05 && (
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="warning.main" sx={{ fontWeight: 700 }}>
                  Saldo pendiente:
                </Typography>
                <Typography variant="body2" color="warning.main" sx={{ fontWeight: 700 }}>
                  S/. {invoiceData.balance.toFixed(2)}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {invoiceData.notes && (
          <Typography variant="caption" color="text.secondary">
            <strong>Observaciones:</strong> {invoiceData.notes}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {canRegisterPayment && (
          <Button
            onClick={() => setRegisterPaymentOpen(true)}
            variant="outlined"
            startIcon={<PaymentsRoundedIcon />}
            sx={{ borderRadius: "8px", textTransform: "none" }}
          >
            Registrar Pago
          </Button>
        )}
        <Button onClick={onClose} variant="contained" sx={{ borderRadius: "8px", textTransform: "none" }}>
          Cerrar
        </Button>
      </DialogActions>

      {registerPaymentOpen && (
        <RegisterPaymentDialog
          open={registerPaymentOpen}
          invoice={invoiceData}
          onClose={() => setRegisterPaymentOpen(false)}
          onSuccess={(updated) => {
            setCurrentInvoice(updated);
            onChanged?.();
          }}
        />
      )}
    </Dialog>
  );
}
