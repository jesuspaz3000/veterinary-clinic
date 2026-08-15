"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControlLabel,
  Checkbox,
  IconButton,
} from "@mui/material";
import MoneyOffRoundedIcon from "@mui/icons-material/MoneyOffRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import NumberInput from "@/shared/components/NumberInput";
import { CreditNotesService } from "../service/creditNotes.service";
import { InvoiceResponse, CreateCreditNoteRequest, CreateCreditNoteItemRequest } from "../types/salesTypes";

interface CreateCreditNoteDialogProps {
  open: boolean;
  invoice: InvoiceResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCreditNoteDialog({ open, invoice, onClose, onSuccess }: CreateCreditNoteDialogProps) {
  const [reason, setReason] = useState("Devolución de mercadería / ítem");
  const [restockInventory, setRestockInventory] = useState(true);

  // Quantities to return per item ID
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!invoice) return null;

  const handleQuantityChange = (itemId: string, qty: number) => {
    setReturnQuantities((prev) => ({ ...prev, [itemId]: qty }));
  };

  const handleSelectAllFullQuantities = () => {
    const map: Record<string, number> = {};
    invoice.items.forEach((item) => {
      map[item.id] = item.quantity;
    });
    setReturnQuantities(map);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const itemsToReturn: CreateCreditNoteItemRequest[] = [];
    Object.entries(returnQuantities).forEach(([itemId, qty]) => {
      if (qty > 0) {
        itemsToReturn.push({
          invoiceItemId: itemId,
          quantity: qty,
        });
      }
    });

    if (itemsToReturn.length === 0) {
      setErrorMessage("Debe ingresar la cantidad a devolver para al menos un ítem.");
      return;
    }

    if (!reason.trim()) {
      setErrorMessage("Por favor, ingresa el motivo de la Nota de Crédito.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const dto: CreateCreditNoteRequest = {
      invoiceId: invoice.id,
      series: "NC01",
      reason: reason.trim(),
      restockInventory,
      items: itemsToReturn,
    };

    try {
      await CreditNotesService.createCreditNote(dto);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error creating credit note:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(err.response?.data?.message || err.message || "Error al emitir la nota de crédito.");
    } finally {
      setSaving(false);
    }
  };

  // Calculate total credit note amount
  const totalCreditNoteAmount = invoice.items.reduce((sum, item) => {
    const returnQty = returnQuantities[item.id] || 0;
    return sum + returnQty * item.unitPrice;
  }, 0);

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1, pr: 5 }}>
        <MoneyOffRoundedIcon color="warning" /> Nota de Crédito / Anulación (Comprobante {invoice.invoiceNumber})
      </DialogTitle>
      <IconButton
        aria-label="Cerrar"
        onClick={onClose}
        disabled={saving}
        sx={{
          position: "absolute",
          right: 12,
          top: 12,
          color: "text.secondary",
        }}
      >
        <CloseRoundedIcon />
      </IconButton>

      <form noValidate onSubmit={(e) => void handleSubmit(e)}>
        <DialogContent sx={{ pt: 1.5, pb: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField
              label="Motivo de la Nota de Crédito *"
              placeholder="Ej. Devolución de producto, error de tipeo en caja..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={saving}
              fullWidth
              required
              size="small"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={restockInventory}
                  onChange={(e) => setRestockInventory(e.target.checked)}
                  disabled={saving}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Reponer stock al inventario y lotes
                </Typography>
              }
            />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
              Selecciona Ítems y Cantidades a Devolver (Soporta Parciales)
            </Typography>
            <Button size="small" onClick={handleSelectAllFullQuantities} sx={{ textTransform: "none" }}>
              Devolución Total (Todas las Unidades)
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: "10px" }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "action.hover" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Descripción Ítem</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, width: 130 }}>
                    Cant. Vendida
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, width: 140 }}>
                    Cant. A Devolver
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, width: 130 }}>
                    Precio U. (S/.)
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, width: 140 }}>
                    Monto Devolución
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.items.map((item) => {
                  const returnQty = returnQuantities[item.id] || 0;
                  const itemRefund = returnQty * item.unitPrice;

                  return (
                    <TableRow key={item.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{item.description}</TableCell>
                      <TableCell align="center">
                        {item.quantity} {item.unitMeasure || ""}
                      </TableCell>
                      <TableCell align="center">
                        <NumberInput
                          value={returnQty}
                          onChange={(val) => handleQuantityChange(item.id, Math.min(item.quantity, val || 0))}
                          size="small"
                          min={0}
                          max={item.quantity}
                          step={0.1}
                          disabled={saving}
                        />
                      </TableCell>
                      <TableCell align="right">S/. {item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: itemRefund > 0 ? "warning.main" : "text.primary" }}>
                        S/. {itemRefund.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 2, pt: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              TOTAL NOTA DE CRÉDITO:
            </Typography>
            <Typography variant="h6" color="warning.main" sx={{ fontWeight: 800 }}>
              S/. {totalCreditNoteAmount.toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={saving} variant="outlined" sx={{ textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saving || totalCreditNoteAmount <= 0}
            variant="contained"
            color="warning"
            sx={{ textTransform: "none", minWidth: 150, fontWeight: 700 }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : "Emitir Nota de Crédito"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
