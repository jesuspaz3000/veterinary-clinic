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
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Popover,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { SpecialtiesService } from "../service/specialties.service";
import { SpecialtyResponse } from "../type/specialtiesTypes";

interface ManageSpecialtiesDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export default function ManageSpecialtiesDialog({
  open,
  onClose,
  onUpdated,
}: ManageSpecialtiesDialogProps) {
  const [specialties, setSpecialties] = useState<SpecialtyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states (for creating or editing)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Popover state for assigned veterinarians list
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [activeVetList, setActiveVetList] = useState<string[]>([]);
  const [activeSpecialtyName, setActiveSpecialtyName] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setNameError(null);
    setErrorMessage(null);
  };

  const loadSpecialties = async () => {
    setLoading(true);
    try {
      const data = await SpecialtiesService.getAllSpecialties();
      setSpecialties(data || []);
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage("No se pudieron cargar las especialidades.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    const fetchData = async () => {
      try {
        const data = await SpecialtiesService.getAllSpecialties();
        if (isMounted) {
          setSpecialties(data || []);
          setEditingId(null);
          setName("");
          setDescription("");
          setErrorMessage(null);
        }
      } catch (err: unknown) {
        console.error(err);
        if (isMounted) setErrorMessage("No se pudieron cargar las especialidades.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [open]);

  const handleStartEdit = (spec: SpecialtyResponse) => {
    setEditingId(spec.id);
    setName(spec.name);
    setDescription(spec.description || "");
    setNameError(null);
    setErrorMessage(null);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("El nombre de la especialidad es obligatorio.");
      return;
    }

    setNameError(null);
    setSaving(true);
    setErrorMessage(null);

    try {
      if (editingId) {
        await SpecialtiesService.updateSpecialty(editingId, {
          name: name.trim(),
          description: description.trim() || null,
        });
      } else {
        await SpecialtiesService.createSpecialty({
          name: name.trim(),
          description: description.trim() || null,
        });
      }
      resetForm();
      await loadSpecialties();
      if (onUpdated) onUpdated();
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(err.response?.data?.message || err.message || "Error al guardar la especialidad.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (spec: SpecialtyResponse) => {
    if (spec.veterinariansCount > 0) return;

    setSaving(true);
    setErrorMessage(null);
    try {
      await SpecialtiesService.deleteSpecialty(spec.id);
      await loadSpecialties();
      if (onUpdated) onUpdated();
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(err.response?.data?.message || err.message || "Error al eliminar la especialidad.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>, spec: SpecialtyResponse) => {
    setPopoverAnchor(event.currentTarget);
    setActiveVetList(spec.assignedVeterinarians || []);
    setActiveSpecialtyName(spec.name);
  };

  const handleClosePopover = () => {
    setPopoverAnchor(null);
    setActiveVetList([]);
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Catálogo de Especialidades Médicas</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {/* Add or Edit Specialty Form */}
        <Paper
          variant="outlined"
          component="form"
          noValidate
          onSubmit={(e) => void handleSubmitForm(e)}
          sx={{ p: 2, borderRadius: "10px", bgcolor: "background.paper" }}
        >
          <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700, mb: 1.5 }}>
            {editingId ? `Editar Especialidad: ${name}` : "Agregar Nueva Especialidad"}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, alignItems: "flex-start" }}>
            <TextField
              label="Nombre de Especialidad"
              placeholder="Ej. Cirugía General, Dermatología"
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
                startIcon={editingId ? <CheckRoundedIcon /> : <AddRoundedIcon />}
                sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, whitespace: "nowrap" }}
              >
                {editingId ? "Actualizar" : "Agregar"}
              </Button>
              {editingId && (
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

        {/* Specialties List */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Especialidades Registradas ({specialties.length})
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : specialties.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
              No hay especialidades registradas. Agrega una arriba.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {specialties.map((spec) => {
                const inUse = spec.veterinariansCount > 0;
                return (
                  <Paper
                    key={spec.id}
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
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                          {spec.name}
                        </Typography>
                        <Chip
                          label={`${spec.veterinariansCount} asignado(s)`}
                          size="small"
                          color={inUse ? "primary" : "default"}
                          variant={inUse ? "filled" : "outlined"}
                          sx={{ fontWeight: 600, height: 22, fontSize: "0.75rem" }}
                        />
                        {inUse && (
                          <Tooltip title="Ver veterinarios asignados">
                            <IconButton
                              size="small"
                              onClick={(e) => handleOpenPopover(e, spec)}
                              sx={{ p: 0.5, color: "primary.main" }}
                            >
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                      {spec.description && (
                        <Typography variant="caption" color="text.secondary">
                          {spec.description}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title="Editar Especialidad">
                        <IconButton
                          size="small"
                          color="primary"
                          disabled={saving}
                          onClick={() => handleStartEdit(spec)}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip
                        title={
                          inUse
                            ? `No se puede eliminar porque está asignada a ${spec.veterinariansCount} veterinario(s)`
                            : "Eliminar Especialidad"
                        }
                      >
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={saving || inUse}
                            onClick={() => void handleDelete(spec)}
                          >
                            <DeleteRoundedIcon fontSize="small" />
                          </IconButton>
                        </span>
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

      {/* Popover displaying assigned veterinarians */}
      <Popover
        open={Boolean(popoverAnchor)}
        anchorEl={popoverAnchor}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Box sx={{ p: 2, maxWidth: 300 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "primary.main" }}>
            Veterinarios con {activeSpecialtyName}:
          </Typography>
          <List dense disablePadding>
            {activeVetList.map((vetName, index) => (
              <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      • {vetName}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Popover>
    </Dialog>
  );
}
