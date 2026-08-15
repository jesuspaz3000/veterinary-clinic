"use client";

import { useEffect, useState } from "react";
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
  IconButton,
  Tooltip,
  Paper,
  Divider,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { BrandsService } from "../service/brands.service";
import { BrandResponse } from "../types/productTypes";

interface ManageBrandsDialogProps {
  open: boolean;
  onClose: () => void;
  onBrandChange?: () => void;
}

export default function ManageBrandsDialog({
  open,
  onClose,
  onBrandChange,
}: ManageBrandsDialogProps) {
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [editingBrand, setEditingBrand] = useState<BrandResponse | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setEditingBrand(null);
    setName("");
    setDescription("");
    setNameError(null);
    setErrorMessage(null);
  };

  const loadBrands = async () => {
    setLoading(true);
    try {
      const data = await BrandsService.getAllBrands();
      setBrands(data || []);
    } catch (err) {
      console.error(err);
      setErrorMessage("No se pudieron cargar las marcas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await BrandsService.getAllBrands();
        if (isMounted) {
          setBrands(data || []);
          setEditingBrand(null);
          setName("");
          setDescription("");
          setNameError(null);
          setErrorMessage(null);
        }
      } catch (err: unknown) {
        console.error(err);
        if (isMounted) setErrorMessage("No se pudieron cargar las marcas.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [open]);

  const handleStartEdit = (brand: BrandResponse) => {
    setEditingBrand(brand);
    setName(brand.name);
    setDescription(brand.description || "");
    setNameError(null);
    setErrorMessage(null);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("El nombre de la marca es obligatorio.");
      return;
    }

    setNameError(null);
    setSaving(true);
    setErrorMessage(null);

    try {
      if (editingBrand) {
        await BrandsService.updateBrand(editingBrand.id, {
          name: name.trim(),
          description: description.trim() || null,
        });
      } else {
        await BrandsService.createBrand({
          name: name.trim(),
          description: description.trim() || null,
        });
      }
      resetForm();
      await loadBrands();
      onBrandChange?.();
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(err.response?.data?.message || err.message || "Error al guardar la marca.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setErrorMessage(null);
    try {
      await BrandsService.deleteBrand(id);
      await loadBrands();
      onBrandChange?.();
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(err.response?.data?.message || err.message || "Error al eliminar la marca.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Catálogo de Marcas / Laboratorios</DialogTitle>
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
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {/* Add or Edit Brand Form */}
        <Paper
          variant="outlined"
          component="form"
          noValidate
          onSubmit={(e) => void handleSubmitForm(e)}
          sx={{ p: 2, borderRadius: "10px", bgcolor: "background.paper" }}
        >
          <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700, mb: 1.5 }}>
            {editingBrand ? `Editar Marca: ${name}` : "Agregar Nueva Marca"}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, alignItems: "flex-start" }}>
            <TextField
              label="Nombre de Marca"
              placeholder="Ej. Royal Canin, Zoetis, Bravecto"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(null);
              }}
              disabled={saving}
              error={Boolean(nameError)}
              helperText={nameError}
              required
              size="small"
              sx={{ flex: 1 }}
            />
            <TextField
              label="Descripción"
              placeholder="Descripción breve..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
              size="small"
              sx={{ flex: 2 }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                size="medium"
                startIcon={editingBrand ? <CheckRoundedIcon /> : <AddRoundedIcon />}
                sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, whitespace: "nowrap" }}
              >
                {editingBrand ? "Actualizar" : "Agregar"}
              </Button>
              {editingBrand && (
                <Button
                  variant="outlined"
                  onClick={resetForm}
                  disabled={saving}
                  size="medium"
                  startIcon={<CloseRoundedIcon />}
                  sx={{ borderRadius: "8px", textTransform: "none" }}
                >
                  Cancelar
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        <Divider />

        {/* Brands List */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Marcas Registradas ({brands.length})
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : brands.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
              No hay marcas registradas. Agrega una arriba.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: 320, overflowY: "auto", pr: 0.5 }}>
              {brands.map((brand) => {
                const isDeleting = deletingId === brand.id;

                return (
                  <Paper
                    key={brand.id}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      px: 2,
                      borderRadius: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                        {brand.name}
                      </Typography>
                      {brand.description && (
                        <Typography variant="caption" color="text.secondary">
                          {brand.description}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title="Editar Marca">
                        <IconButton
                          size="small"
                          color="primary"
                          disabled={saving || isDeleting}
                          onClick={() => handleStartEdit(brand)}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Eliminar Marca">
                        <IconButton
                          size="small"
                          color="error"
                          disabled={saving || isDeleting}
                          onClick={() => void handleDelete(brand.id)}
                        >
                          {isDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteRoundedIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={saving} variant="contained" sx={{ borderRadius: "8px", textTransform: "none" }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
