"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { ProductsService } from "../service/products.service";
import { ProductResponse } from "../types/productTypes";

interface ReactivateProductDialogProps {
  open: boolean;
  product: ProductResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReactivateProductDialog({
  open,
  product,
  onClose,
  onSuccess,
}: ReactivateProductDialogProps) {
  const [reactivating, setReactivating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleReactivate = async () => {
    setReactivating(true);
    setErrorMessage(null);
    try {
      await ProductsService.reactivateProduct(product.id);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error reactivating product:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(err.response?.data?.message || err.message || "Error al reactivar el producto.");
    } finally {
      setReactivating(false);
    }
  };

  return (
    <Dialog open={open} onClose={reactivating ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Reactivar Producto</DialogTitle>
      <IconButton
        aria-label="Cerrar"
        onClick={onClose}
        disabled={reactivating}
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

        <Typography variant="body1">
          ¿Deseas reactivar el producto <strong>{product.name}</strong>? Volverá a aparecer en el listado de
          productos activos junto con todas sus presentaciones/variantes.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={reactivating} variant="outlined" sx={{ borderRadius: "8px", textTransform: "none" }}>
          Cancelar
        </Button>
        <Button
          onClick={() => void handleReactivate()}
          disabled={reactivating}
          variant="contained"
          color="success"
          sx={{ borderRadius: "8px", textTransform: "none", minWidth: 110 }}
        >
          {reactivating ? <CircularProgress size={20} color="inherit" /> : "Reactivar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
