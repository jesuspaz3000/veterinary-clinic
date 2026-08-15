"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Typography,
  IconButton,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import NumberInput from "@/shared/components/NumberInput";
import { SalesService } from "../service/sales.service";
import { InvoiceResponse } from "../types/salesTypes";

const PAYMENT_METHODS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "yape_plin", label: "Yape / Plin" },
  { value: "tarjeta", label: "Tarjeta de Débito/Crédito" },
  { value: "transferencia", label: "Transferencia Bancaria" },
  { value: "credito", label: "Crédito a Cuenta" },
];

interface RegisterPaymentDialogProps {
  open: boolean;
  invoice: InvoiceResponse;
  onClose: () => void;
  onSuccess: (updatedInvoice: InvoiceResponse) => void;
}

export default function RegisterPaymentDialog({ open, invoice, onClose, onSuccess }: RegisterPaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [amount, setAmount] = useState<number>(invoice.balance);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!amount || amount <= 0) {
      setErrorMessage("El monto debe ser mayor a 0.");
      return;
    }
    setSaving(true);
    setErrorMessage(null);
    try {
      const updated = await SalesService.registerPayment(invoice.id, {
        paymentMethod,
        amount,
        referenceNumber: referenceNumber.trim() || undefined,
      });
      onSuccess(updated);
      onClose();
    } catch (error: unknown) {
      console.error("Error registering payment:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(err.response?.data?.message || err.message || "Error al registrar el pago.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Registrar Pago</DialogTitle>
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
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Typography variant="body2" color="text.secondary">
          Saldo pendiente del comprobante {invoice.invoiceNumber}: <strong>S/. {invoice.balance.toFixed(2)}</strong>
        </Typography>

        <TextField
          select
          label="Método de pago"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          disabled={saving}
          fullWidth
        >
          {PAYMENT_METHODS.map((m) => (
            <MenuItem key={m.value} value={m.value}>
              {m.label}
            </MenuItem>
          ))}
        </TextField>

        <NumberInput
          label="Monto (S/.)"
          value={amount}
          onChange={(val) => setAmount(val || 0)}
          min={0.01}
          max={invoice.balance}
          step={0.1}
          disabled={saving}
          fullWidth
        />

        <TextField
          label="N° Operación / Voucher (opcional)"
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.target.value)}
          disabled={saving}
          fullWidth
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={saving} variant="outlined" sx={{ borderRadius: "8px", textTransform: "none" }}>
          Cancelar
        </Button>
        <Button
          onClick={() => void handleSubmit()}
          disabled={saving}
          variant="contained"
          sx={{ borderRadius: "8px", textTransform: "none", minWidth: 110 }}
        >
          {saving ? <CircularProgress size={20} color="inherit" /> : "Registrar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
