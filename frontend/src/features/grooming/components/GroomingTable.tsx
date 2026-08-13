"use client";

import { useEffect, useState } from "react";
import { useGroomingStaff } from "../hooks/groomingHooks";
import CustomTable, { Column } from "@/shared/components/CustomTable";
import { GroomingStaffResponse } from "../type/groomingTypes";
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
import CreateGroomingStaff from "./CreateGroomingStaff";
import EditGroomingStaff from "./EditGroomingStaff";
import DeleteGroomingStaff from "./DeleteGroomingStaff";
import ManageGroomingSpecialtiesDialog from "./ManageGroomingSpecialtiesDialog";

export default function GroomingTable() {
  const { groomingStaff, loading, fetchGroomingStaff, error } = useGroomingStaff();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [manageSpecialtiesOpen, setManageSpecialtiesOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<GroomingStaffResponse | null>(null);

  useEffect(() => {
    fetchGroomingStaff({
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      search: search.trim() || undefined,
    });
  }, [page, rowsPerPage, search, fetchGroomingStaff]);

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

  const columns: Column<GroomingStaffResponse>[] = [
    {
      id: "index",
      label: "Nº",
      minWidth: 60,
      render: (_row, index) => page * rowsPerPage + index + 1,
    },
    {
      id: "name",
      label: "Personal de Grooming",
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
      id: "specialties",
      label: "Especialidades",
      minWidth: 200,
      render: (row) => {
        if (!row.specialties || row.specialties.length === 0) return "-";
        return (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {row.specialties.map((spec) => (
              <Chip
                key={spec.id}
                label={spec.name}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ borderRadius: "6px", fontWeight: 500, fontSize: "0.75rem" }}
              />
            ))}
          </Box>
        );
      },
    },
    {
      id: "experienceYears",
      label: "Experiencia",
      minWidth: 110,
      render: (row) =>
        row.experienceYears !== null && row.experienceYears !== undefined
          ? `${row.experienceYears} año(s)`
          : "-",
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
      minWidth: 110,
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
      minWidth: 100,
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
          <Tooltip title="Editar Personal">
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setSelectedStaff(row);
                setEditOpen(true);
              }}
              sx={{ bgcolor: "action.hover" }}
            >
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Desactivar Personal">
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                setSelectedStaff(row);
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
          placeholder="Buscar por nombre, usuario, correo o especialidad..."
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
            width: { xs: "100%", md: "38%" },
            maxWidth: 400,
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
            Nuevo Personal de Grooming
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <CustomTable<GroomingStaffResponse>
        columns={columns}
        data={groomingStaff?.results || []}
        loading={loading}
        error={error}
        page={page}
        rowsPerPage={rowsPerPage}
        totalElements={groomingStaff?.count || 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="No se encontraron estilistas / personal de grooming registrados."
      />

      {/* Modals */}
      {createOpen && (
        <CreateGroomingStaff
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSuccess={() =>
            void fetchGroomingStaff({
              limit: rowsPerPage,
              offset: page * rowsPerPage,
              search: search.trim() || undefined,
            })
          }
        />
      )}

      {editOpen && selectedStaff && (
        <EditGroomingStaff
          key={selectedStaff.id}
          open={editOpen}
          staff={selectedStaff}
          onClose={() => {
            setEditOpen(false);
            setSelectedStaff(null);
          }}
          onSuccess={() =>
            void fetchGroomingStaff({
              limit: rowsPerPage,
              offset: page * rowsPerPage,
              search: search.trim() || undefined,
            })
          }
        />
      )}

      {deleteOpen && selectedStaff && (
        <DeleteGroomingStaff
          open={deleteOpen}
          staff={selectedStaff}
          onClose={() => {
            setDeleteOpen(false);
            setSelectedStaff(null);
          }}
          onSuccess={() =>
            void fetchGroomingStaff({
              limit: rowsPerPage,
              offset: page * rowsPerPage,
              search: search.trim() || undefined,
            })
          }
        />
      )}

      {manageSpecialtiesOpen && (
        <ManageGroomingSpecialtiesDialog
          open={manageSpecialtiesOpen}
          onClose={() => setManageSpecialtiesOpen(false)}
          onSpecialtyChange={() =>
            void fetchGroomingStaff({
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
