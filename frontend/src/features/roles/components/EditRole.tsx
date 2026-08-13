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
  Checkbox,
  FormControlLabel,
  FormGroup,
  CircularProgress,
  Alert,
  Paper,
  Divider,
} from "@mui/material";
import { RolesService } from "../services/roles.service";
import { PermissionsService } from "../services/permissions.service";
import { Permission, Role, RoleCreateUpdateDTO } from "../types/rolesTypes";

interface EditRoleProps {
  open: boolean;
  role: Role | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditRole({ open, role, onClose, onSuccess }: EditRoleProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  
  // Loading & error states
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load all permissions and role details by ID once on mount
  useEffect(() => {
    if (!role) return;
    
    const loadData = async () => {
      setLoadingPermissions(true);
      setErrorMessage(null);
      try {
        // Fetch permissions (non-paginated backend path) and role details by ID in parallel
        const [permissionsResponse, roleDetails] = await Promise.all([
          PermissionsService.getAllPermissions(),
          RolesService.getRoleById(role.id),
        ]);
        
        setAllPermissions(permissionsResponse.results);
        setName(roleDetails.name);
        setDescription(roleDetails.description || "");
        setSelectedPermissionIds(roleDetails.permissions?.map((p) => p.id) || []);
      } catch (error: unknown) {
        console.error("Error loading edit role details:", error);
        setErrorMessage("No se pudieron cargar los detalles del rol o los permisos.");
      } finally {
        setLoadingPermissions(false);
      }
    };
    void loadData();
  }, [role]);

  // Group permissions by module
  const groupedPermissions = allPermissions.reduce((acc, item) => {
    const moduleName = item.module || "OTROS";
    if (!acc[moduleName]) {
      acc[moduleName] = [];
    }
    acc[moduleName].push(item);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handlePermissionToggle = (id: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectModuleAll = (moduleName: string, permissions: Permission[], checked: boolean) => {
    const permissionIds = permissions.map((p) => p.id);
    if (checked) {
      setSelectedPermissionIds((prev) => Array.from(new Set([...prev, ...permissionIds])));
    } else {
      setSelectedPermissionIds((prev) => prev.filter((id) => !permissionIds.includes(id)));
    }
  };

  const isModuleAllSelected = (permissions: Permission[]) => {
    return permissions.every((p) => selectedPermissionIds.includes(p.id));
  };

  const isModuleSomeSelected = (permissions: Permission[]) => {
    const selectedCount = permissions.filter((p) => selectedPermissionIds.includes(p.id)).length;
    return selectedCount > 0 && selectedCount < permissions.length;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!role) return;
    if (!name.trim()) {
      setErrorMessage("El nombre del rol es requerido.");
      return;
    }
    if (!description.trim()) {
      setErrorMessage("La descripción del rol es requerida.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const dto: RoleCreateUpdateDTO = {
      name: name.trim().toUpperCase(),
      description: description.trim(),
      permissionIds: selectedPermissionIds,
    };

    try {
      await RolesService.updateRole(role.id, dto);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error updating role:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const apiErrorMsg = err.response?.data?.message || err.message || "Error inesperado al actualizar el rol.";
      setErrorMessage(apiErrorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Editar Rol: {role?.name}</DialogTitle>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1, minHeight: 200 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          {loadingPermissions ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
              <CircularProgress size={40} />
            </Box>
          ) : (
            <>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
                <TextField
                  label="Nombre del Rol"
                  placeholder="Ej. ADMINISTRADOR"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving || (role !== null && ["SUPERADMIN", "VETERINARIAN", "ADMIN", "GROOMING"].includes(role.name))}
                  fullWidth
                  required
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Descripción"
                  placeholder="Ej. Acceso total a la administración"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={saving}
                  fullWidth
                  required
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
                  sx={{ flex: 2 }}
                />
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Asignación de Permisos
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Selecciona las acciones que este rol tendrá autorizado realizar en la plataforma.
                </Typography>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
                  {Object.entries(groupedPermissions).map(([moduleName, permissions]) => {
                    const allChecked = isModuleAllSelected(permissions);
                    const someChecked = isModuleSomeSelected(permissions);

                    return (
                      <Box key={moduleName}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: "10px",
                            height: "100%",
                            bgcolor: "background.paper",
                            borderColor: "divider",
                          }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "primary.main" }}>
                              Módulo: {moduleName}
                            </Typography>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  size="small"
                                  checked={allChecked}
                                  indeterminate={someChecked}
                                  onChange={(e) => handleSelectModuleAll(moduleName, permissions, e.target.checked)}
                                  disabled={saving}
                                />
                              }
                              label={
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                  Seleccionar Todo
                                </Typography>
                              }
                            />
                          </Box>
                          <Divider sx={{ mb: 1.5 }} />
                          <FormGroup>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                              {permissions.map((p) => (
                                <Box key={p.id}>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        size="small"
                                        checked={selectedPermissionIds.includes(p.id)}
                                        onChange={() => handlePermissionToggle(p.id)}
                                        disabled={saving}
                                      />
                                    }
                                    label={
                                      <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                          {p.labelEs || p.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                          {p.name}
                                        </Typography>
                                      </Box>
                                    }
                                  />
                                </Box>
                              ))}
                            </Box>
                          </FormGroup>
                        </Paper>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={saving} variant="outlined" sx={{ borderRadius: "8px", textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saving}
            variant="contained"
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              minWidth: 100,
            }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar Cambios"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
