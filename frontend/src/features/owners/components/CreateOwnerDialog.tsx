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
  MenuItem,
  IconButton,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PhoneInput from "@/shared/components/PhoneInput";
import { OwnerService } from "../service/owners.service";
import { OwnerCreateRequest } from "../type/ownersTypes";

interface CreateOwnerDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DOCUMENT_TYPES = [
  { value: "DNI", label: "DNI (Documento Nacional de Identidad)" },
  { value: "CE", label: "Carnet de Extranjería (CE)" },
  { value: "PASAPORTE", label: "Pasaporte" },
  { value: "RUC", label: "RUC" },
];

export default function CreateOwnerDialog({ open, onClose, onSuccess }: CreateOwnerDialogProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [documentType, setDocumentType] = useState("DNI");
  const [documentNumber, setDocumentNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setDocumentType("DNI");
    setDocumentNumber("");
    setPhone("");
    setEmail("");
    setAddress("");
    setErrorMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!firstName.trim()) {
      setErrorMessage("El nombre del cliente es obligatorio.");
      return;
    }
    if (!lastName.trim()) {
      setErrorMessage("El apellido del cliente es obligatorio.");
      return;
    }
    if (!phone.trim()) {
      setErrorMessage("El teléfono de contacto es obligatorio.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const dto: OwnerCreateRequest = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      documentType: documentType.trim() || "DNI",
      documentNumber: documentNumber.trim() || null,
      phone: phone.trim(),
      email: email.trim() || null,
      address: address.trim() || null,
    };

    try {
      await OwnerService.createOwner(dto);
      resetForm();
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error creating owner:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const apiErrorMsg =
        err.response?.data?.message || err.message || "Error inesperado al registrar el cliente.";
      setErrorMessage(apiErrorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Nuevo Cliente / Propietario</DialogTitle>
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
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
            Datos Personales
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField
              label="Nombres"
              placeholder="Ej. Juan Carlos"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={saving}
              fullWidth
              required
            />
            <TextField
              label="Apellidos"
              placeholder="Ej. Pérez Gómez"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={saving}
              fullWidth
              required
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 2fr" }, gap: 2 }}>
            <TextField
              select
              label="Tipo de Documento"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              disabled={saving}
              fullWidth
            >
              {DOCUMENT_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.value}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Número de Documento"
              placeholder="Ej. 74839201"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              disabled={saving}
              fullWidth
            />
          </Box>

          <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700, mt: 1 }}>
            Información de Contacto
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <PhoneInput
              value={phone}
              onChange={(val) => setPhone(val)}
              disabled={saving}
            />
            <TextField
              label="Correo electrónico"
              type="email"
              placeholder="juan.perez@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={saving}
              fullWidth
            />
          </Box>

          <TextField
            label="Dirección de Domicilio"
            placeholder="Ej. Av. Primavera 123, Dpto 401, Santiago de Surco"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={saving}
            fullWidth
            multiline
            rows={2}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={saving} variant="outlined" sx={{ borderRadius: "8px", textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saving}
            variant="contained"
            sx={{ borderRadius: "8px", textTransform: "none", minWidth: 130 }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar Cliente"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
