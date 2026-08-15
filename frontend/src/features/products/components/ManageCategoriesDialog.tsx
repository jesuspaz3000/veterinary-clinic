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
import { CategoriesService } from "../service/categories.service";
import { CategoryResponse } from "../types/productTypes";

interface ManageCategoriesDialogProps {
  open: boolean;
  onClose: () => void;
  onCategoryChange?: () => void;
}

export default function ManageCategoriesDialog({
  open,
  onClose,
  onCategoryChange,
}: ManageCategoriesDialogProps) {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setNameError(null);
    setErrorMessage(null);
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await CategoriesService.getAllCategories();
      setCategories(data || []);
    } catch (err) {
      console.error(err);
      setErrorMessage("No se pudieron cargar las categorías.");
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
        const data = await CategoriesService.getAllCategories();
        if (isMounted) {
          setCategories(data || []);
          setEditingCategory(null);
          setName("");
          setDescription("");
          setNameError(null);
          setErrorMessage(null);
        }
      } catch (err: unknown) {
        console.error(err);
        if (isMounted) setErrorMessage("No se pudieron cargar las categorías.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [open]);

  const handleStartEdit = (cat: CategoryResponse) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setNameError(null);
    setErrorMessage(null);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("El nombre de la categoría es obligatorio.");
      return;
    }

    setNameError(null);
    setSaving(true);
    setErrorMessage(null);

    try {
      if (editingCategory) {
        await CategoriesService.updateCategory(editingCategory.id, {
          name: name.trim(),
          description: description.trim() || null,
        });
      } else {
        await CategoriesService.createCategory({
          name: name.trim(),
          description: description.trim() || null,
        });
      }
      resetForm();
      await loadCategories();
      onCategoryChange?.();
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(err.response?.data?.message || err.message || "Error al guardar la categoría.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setErrorMessage(null);
    try {
      await CategoriesService.deleteCategory(id);
      await loadCategories();
      onCategoryChange?.();
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(err.response?.data?.message || err.message || "Error al eliminar la categoría.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Catálogo de Categorías de Productos</DialogTitle>
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

        {/* Add or Edit Category Form */}
        <Paper
          variant="outlined"
          component="form"
          noValidate
          onSubmit={(e) => void handleSubmitForm(e)}
          sx={{ p: 2, borderRadius: "10px", bgcolor: "background.paper" }}
        >
          <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700, mb: 1.5 }}>
            {editingCategory ? `Editar Categoría: ${name}` : "Agregar Nueva Categoría"}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, alignItems: "flex-start" }}>
            <TextField
              label="Nombre de Categoría"
              placeholder="Ej. Medicamentos, Alimentos"
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
                startIcon={editingCategory ? <CheckRoundedIcon /> : <AddRoundedIcon />}
                sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, whitespace: "nowrap" }}
              >
                {editingCategory ? "Actualizar" : "Agregar"}
              </Button>
              {editingCategory && (
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

        {/* Categories List */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Categorías Registradas ({categories.length})
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : categories.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
              No hay categorías registradas. Agrega una arriba.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: 320, overflowY: "auto", pr: 0.5 }}>
              {categories.map((cat) => {
                const isDeleting = deletingId === cat.id;

                return (
                  <Paper
                    key={cat.id}
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
                        {cat.name}
                      </Typography>
                      {cat.description && (
                        <Typography variant="caption" color="text.secondary">
                          {cat.description}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title="Editar Categoría">
                        <IconButton
                          size="small"
                          color="primary"
                          disabled={saving || isDeleting}
                          onClick={() => handleStartEdit(cat)}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Eliminar Categoría">
                        <IconButton
                          size="small"
                          color="error"
                          disabled={saving || isDeleting}
                          onClick={() => void handleDelete(cat.id)}
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
