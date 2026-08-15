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
import { AdministrativeAreasService } from "../service/administrativeArea.service";
import { useAdministrativeAreas } from "../hooks/administrativeAreaHooks";
import { AdministrativeAreaResponse } from "../type/administrativeAreaTypes";

interface ManageAdministrativeAreasDialogProps {
  open: boolean;
  onClose: () => void;
  onAreaChange?: () => void;
}

export default function ManageAdministrativeAreasDialog({
  open,
  onClose,
  onAreaChange,
}: ManageAdministrativeAreasDialogProps) {
  const { areas, loading, fetchAreas } = useAdministrativeAreas();

  // Form states (for creating or editing)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Popover state for assigned administrative staff list
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [activeStaffList, setActiveStaffList] = useState<string[]>([]);
  const [activeAreaName, setActiveAreaName] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setNameError(null);
    setErrorMessage(null);
  };

  useEffect(() => {
    if (!open) return;
    const init = async () => {
      await fetchAreas();
      setEditingId(null);
      setName("");
      setDescription("");
      setNameError(null);
      setErrorMessage(null);
    };
    void init();
  }, [open, fetchAreas]);

  const handleStartEdit = (area: AdministrativeAreaResponse) => {
    setEditingId(area.id);
    setName(area.name);
    setDescription(area.description || "");
    setNameError(null);
    setErrorMessage(null);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("El nombre del área es obligatorio.");
      return;
    }

    setNameError(null);
    setSaving(true);
    setErrorMessage(null);

    try {
      if (editingId) {
        await AdministrativeAreasService.updateArea(editingId, {
          name: name.trim(),
          description: description.trim() || null,
        });
      } else {
        await AdministrativeAreasService.createArea({
          name: name.trim(),
          description: description.trim() || null,
        });
      }
      resetForm();
      await fetchAreas();
      if (onAreaChange) onAreaChange();
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(err.response?.data?.message || err.message || "Error al guardar el área administrativa.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (area: AdministrativeAreaResponse) => {
    if (area.assignedCount > 0) return;

    setSaving(true);
    setErrorMessage(null);
    try {
      await AdministrativeAreasService.deleteArea(area.id);
      await fetchAreas();
      if (onAreaChange) onAreaChange();
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(err.response?.data?.message || err.message || "Error al eliminar el área.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>, area: AdministrativeAreaResponse) => {
    setPopoverAnchor(event.currentTarget);
    setActiveStaffList(area.assignedStaffNames || []);
    setActiveAreaName(area.name);
  };

  const handleClosePopover = () => {
    setPopoverAnchor(null);
    setActiveStaffList([]);
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pr: 5 }}>Catálogo de Áreas Administrativas</DialogTitle>
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

        {/* Add or Edit Area Form */}
        <Paper
          variant="outlined"
          component="form"
          noValidate
          onSubmit={(e) => void handleSubmitForm(e)}
          sx={{ p: 2, borderRadius: "10px", bgcolor: "background.paper" }}
        >
          <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700, mb: 1.5 }}>
            {editingId ? `Editar Área: ${name}` : "Agregar Nueva Área"}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, alignItems: "flex-start" }}>
            <TextField
              label="Nombre del Área"
              placeholder="Ej. Recepción, Finanzas, Servicios Generales"
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
              placeholder="Descripción breve del área..."
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

        {/* Areas List */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Áreas Registradas ({areas.length})
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : areas.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
              No hay áreas registradas. Agrega una arriba.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {areas.map((area) => {
                const inUse = area.assignedCount > 0;
                return (
                  <Paper
                    key={area.id}
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
                          {area.name}
                        </Typography>
                        <Chip
                          label={`${area.assignedCount} asignado(s)`}
                          size="small"
                          color={inUse ? "primary" : "default"}
                          variant={inUse ? "filled" : "outlined"}
                          sx={{ fontWeight: 600, height: 22, fontSize: "0.75rem" }}
                        />
                        {inUse && (
                          <Tooltip title="Ver personal asignado">
                            <IconButton
                              size="small"
                              onClick={(e) => handleOpenPopover(e, area)}
                              sx={{ p: 0.5, color: "primary.main" }}
                            >
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                      {area.description && (
                        <Typography variant="caption" color="text.secondary">
                          {area.description}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title="Editar Área">
                        <IconButton
                          size="small"
                          color="primary"
                          disabled={saving}
                          onClick={() => handleStartEdit(area)}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip
                        title={
                          inUse
                            ? `No se puede eliminar porque está asignada a ${area.assignedCount} personal(es) administrativo(s)`
                            : "Eliminar Área"
                        }
                      >
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={saving || inUse}
                            onClick={() => void handleDelete(area)}
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

      {/* Popover displaying assigned staff */}
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
            Personal en área {activeAreaName}:
          </Typography>
          <List dense disablePadding>
            {activeStaffList.map((staffName, index) => (
              <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      • {staffName}
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
