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
} from "@mui/material";
import { ProductsService } from "../service/products.service";
import { ProductResponse } from "../types/productTypes";

interface DeleteProductDialogProps {
  open: boolean;
  product: ProductResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteProductDialog({
  open,
  product,
  onClose,
  onSuccess,
}: DeleteProductDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setErrorMessage(null);
    try {
      await ProductsService.deleteProduct(product.id);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error deleting product:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(
        err.response?.data?.message || err.message || "Error al eliminar el producto e inventario."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={deleting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Eliminar Producto</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Typography variant="body1">
          ¿Estás seguro de que deseas eliminar el producto <strong>{product.name}</strong>?
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Esta acción eliminará permanentemente el producto y todas sus presentaciones/variantes registradas.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={deleting} variant="outlined" sx={{ borderRadius: "8px", textTransform: "none" }}>
          Cancelar
        </Button>
        <Button
          onClick={() => void handleDelete()}
          disabled={deleting}
          variant="contained"
          color="error"
          sx={{ borderRadius: "8px", textTransform: "none", minWidth: 110 }}
        >
          {deleting ? <CircularProgress size={20} color="inherit" /> : "Eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
