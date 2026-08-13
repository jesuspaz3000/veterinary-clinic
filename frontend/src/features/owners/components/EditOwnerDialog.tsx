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
} from "@mui/material";
import PhoneInput from "@/shared/components/PhoneInput";
import { OwnerService } from "../service/owners.service";
import { OwnerResponse, OwnerUpdateRequest } from "../type/ownersTypes";

interface EditOwnerDialogProps {
  open: boolean;
  owner: OwnerResponse;
  onClose: () => void;
  onSuccess: () => void;
}

const DOCUMENT_TYPES = [
  { value: "DNI", label: "DNI (Documento Nacional de Identidad)" },
  { value: "CE", label: "Carnet de Extranjería (CE)" },
  { value: "PASAPORTE", label: "Pasaporte" },
  { value: "RUC", label: "RUC" },
];

export default function EditOwnerDialog({ open, owner, onClose, onSuccess }: EditOwnerDialogProps) {
  const [firstName, setFirstName] = useState(owner?.firstName || "");
  const [lastName, setLastName] = useState(owner?.lastName || "");
  const [documentType, setDocumentType] = useState(owner?.documentType || "DNI");
  const [documentNumber, setDocumentNumber] = useState(owner?.documentNumber || "");
  const [phone, setPhone] = useState(owner?.phone || "");
  const [email, setEmail] = useState(owner?.email || "");
  const [address, setAddress] = useState(owner?.address || "");

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    const dto: OwnerUpdateRequest = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      documentType: documentType.trim() || "DNI",
      documentNumber: documentNumber.trim() || null,
      phone: phone.trim(),
      email: email.trim() || null,
      address: address.trim() || null,
    };

    try {
      await OwnerService.updateOwner(owner.id, dto);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error updating owner:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const apiErrorMsg =
        err.response?.data?.message || err.message || "Error inesperado al actualizar el cliente.";
      setErrorMessage(apiErrorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Editar Cliente / Propietario</DialogTitle>
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
            {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar Cambios"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
