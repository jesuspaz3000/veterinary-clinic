"use client";

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
import { InvoiceResponse } from "../types/salesTypes";

interface InvoiceDetailDialogProps {
  open: boolean;
  invoice: InvoiceResponse | null;
  onClose: () => void;
}

export default function InvoiceDetailDialog({ open, invoice, onClose }: InvoiceDetailDialogProps) {
  if (!invoice) return null;

  const isAnulado = invoice.paymentStatus.toLowerCase() === "anulado";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ReceiptLongRoundedIcon color="primary" /> Comprobante de Venta N° {invoice.invoiceNumber}
        </Box>
        <Chip
          label={isAnulado ? "ANULADO" : "PAGADO"}
          color={isAnulado ? "error" : "success"}
          sx={{ fontWeight: 700 }}
        />
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
        {/* Header Metadata */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: "10px", display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Tipo de Comprobante
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: "capitalize" }}>
              {invoice.invoiceType}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Cliente / Propietario
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {invoice.ownerName ? `${invoice.ownerName} (${invoice.ownerDocumentNumber || "S/D"})` : "Cliente Genérico (Venta Mostrador)"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Emisión / Atendido por
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {new Date(invoice.issuedAt).toLocaleString()} ({invoice.userName})
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
              {invoice.items.map((item) => (
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
            {invoice.payments.map((p) => (
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
                S/. {invoice.subtotal.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Descuento Total:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                S/. {invoice.discount.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                IGV (18%):
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                S/. {invoice.tax.toFixed(2)}
              </Typography>
            </Box>
            <Divider sx={{ my: 0.5 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                TOTAL:
              </Typography>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>
                S/. {invoice.total.toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        </Box>

        {invoice.notes && (
          <Typography variant="caption" color="text.secondary">
            <strong>Observaciones:</strong> {invoice.notes}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="contained" sx={{ borderRadius: "8px", textTransform: "none" }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
