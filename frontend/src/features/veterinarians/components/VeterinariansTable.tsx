"use client";

import { useEffect, useState } from "react";
import { useVeterinarians } from "../hooks/veterinariansHooks";
import CustomTable, { Column } from "@/shared/components/CustomTable";
import { VeterinarianResponse } from "../type/veterinariansTypes";
import {
  Box,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Avatar,
  Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import CreateVeterinarian from "./CreateVeterinarian";
import EditVeterinarian from "./EditVeterinarian";
import DeleteVeterinarian from "./DeleteVeterinarian";
import ManageSpecialtiesDialog from "@/features/specialties/components/ManageSpecialtiesDialog";

export default function VeterinariansTable() {
  const { veterinarians, loading, fetchVeterinarians, error } = useVeterinarians();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [manageSpecialtiesOpen, setManageSpecialtiesOpen] = useState(false);
  const [selectedVeterinarian, setSelectedVeterinarian] = useState<VeterinarianResponse | null>(null);

  // Fetch veterinarians on pagination or search change
  useEffect(() => {
    fetchVeterinarians({
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      search: search.trim() || undefined,
    });
  }, [page, rowsPerPage, search, fetchVeterinarians]);

  const handlePageChange = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const columns: Column<VeterinarianResponse>[] = [
    {
      id: "index",
      label: "Nº",
      minWidth: 60,
      render: (_row, index) => page * rowsPerPage + index + 1,
    },
    {
      id: "name",
      label: "Veterinario",
      minWidth: 220,
      render: (row) => {
        const user = row.user;
        const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              src={user.avatarUrl || undefined}
              alt={user.username}
              sx={{ width: 40, height: 40, bgcolor: user.avatarUrl ? "transparent" : "primary.main" }}
              slotProps={{
                img: {
                  style: { objectFit: "cover" },
                  onError: (e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  },
                },
              }}
            >
              {!user.avatarUrl && (user.firstName?.charAt(0) || user.username.charAt(0)).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                {fullName || user.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                @{user.username}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      id: "licenseNumber",
      label: "N° Licencia",
      minWidth: 130,
      render: (row) => (
        <Chip
          label={row.licenseNumber}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 600, borderRadius: "6px" }}
        />
      ),
    },
    {
      id: "specialties",
      label: "Especialidad(es)",
      minWidth: 220,
      render: (row) => {
        const specs = row.specialties || [];
        if (specs.length === 0) return "-";
        return (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {specs.map((spec) => (
              <Chip
                key={spec.id}
                label={spec.name}
                size="small"
                color="secondary"
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
            ))}
          </Box>
        );
      },
    },
    {
      id: "contact",
      label: "Contacto",
      minWidth: 180,
      render: (row) => {
        const user = row.user;
        return (
          <Box>
            <Typography variant="body2" color="text.primary">
              {user.email}
            </Typography>
            {user.phone && (
              <Typography variant="caption" color="text.secondary">
                {user.phone}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      id: "hireDate",
      label: "Contratación",
      minWidth: 120,
      render: (row) => {
        if (!row.hireDate) return "-";
        return new Date(row.hireDate + "T00:00:00").toLocaleDateString("es-ES", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      },
    },
    {
      id: "status",
      label: "Estado",
      minWidth: 110,
      render: (row) => {
        const isActivo = row.status?.toLowerCase() === "activo" && row.user.isActive;
        return (
          <Chip
            label={isActivo ? "Activo" : "Inactivo"}
            size="small"
            color={isActivo ? "success" : "default"}
            sx={{ fontWeight: 600, borderRadius: "6px" }}
          />
        );
      },
    },
    {
      id: "actions",
      label: "Acciones",
      minWidth: 110,
      align: "center",
      render: (row) => (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          <Tooltip title="Editar Veterinario">
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setSelectedVeterinarian(row);
                setEditOpen(true);
              }}
              sx={{ bgcolor: "action.hover" }}
            >
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Desactivar Veterinario">
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                setSelectedVeterinarian(row);
                setDeleteOpen(true);
              }}
              sx={{ bgcolor: "action.hover" }}
            >
              <DeleteRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Table Toolbar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <TextField
          placeholder="Buscar por nombre, usuario, correo o licencia..."
          value={search}
          onChange={handleSearchChange}
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            width: { xs: "100%", md: "40%" },
            maxWidth: 450,
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              bgcolor: "background.paper",
            },
          }}
        />

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            startIcon={<SettingsRoundedIcon />}
            onClick={() => setManageSpecialtiesOpen(true)}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              px: 2,
            }}
          >
            Gestionar Especialidades
          </Button>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              px: 2.5,
            }}
          >
            Nuevo Veterinario
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <CustomTable<VeterinarianResponse>
        columns={columns}
        data={veterinarians?.results || []}
        loading={loading}
        error={error}
        page={page}
        rowsPerPage={rowsPerPage}
        totalElements={veterinarians?.count || 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="No se encontraron veterinarios registrado(a)s."
      />

      {/* Modals */}
      {createOpen && (
        <CreateVeterinarian
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSuccess={() =>
            void fetchVeterinarians({
              limit: rowsPerPage,
              offset: page * rowsPerPage,
              search: search.trim() || undefined,
            })
          }
        />
      )}

      {editOpen && selectedVeterinarian && (
        <EditVeterinarian
          key={selectedVeterinarian.id}
          open={editOpen}
          veterinarian={selectedVeterinarian}
          onClose={() => {
            setEditOpen(false);
            setSelectedVeterinarian(null);
          }}
          onSuccess={() =>
            void fetchVeterinarians({
              limit: rowsPerPage,
              offset: page * rowsPerPage,
              search: search.trim() || undefined,
            })
          }
        />
      )}

      {deleteOpen && selectedVeterinarian && (
        <DeleteVeterinarian
          open={deleteOpen}
          veterinarian={selectedVeterinarian}
          onClose={() => {
            setDeleteOpen(false);
            setSelectedVeterinarian(null);
          }}
          onSuccess={() =>
            void fetchVeterinarians({
              limit: rowsPerPage,
              offset: page * rowsPerPage,
              search: search.trim() || undefined,
            })
          }
        />
      )}

      {manageSpecialtiesOpen && (
        <ManageSpecialtiesDialog
          open={manageSpecialtiesOpen}
          onClose={() => setManageSpecialtiesOpen(false)}
          onUpdated={() =>
            void fetchVeterinarians({
              limit: rowsPerPage,
              offset: page * rowsPerPage,
              search: search.trim() || undefined,
            })
          }
        />
      )}
    </Box>
  );
}
