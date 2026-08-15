"use client";

import { useEffect, useState } from "react";
import { useUsers } from "../hooks/usersHooks";
import CustomTable, { Column } from "@/shared/components/CustomTable";
import ImagePreviewDialog from "@/shared/components/ImagePreviewDialog";
import { USER_STATUS_FILTERS, UserResponse } from "../type/usersTypes";
import {
  Box,
  TextField,
  MenuItem,
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
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CreateUser from "./CreateUser";
import EditUser from "./EditUser";
import DeleteUser from "./DeleteUser";
import ReactivateUser from "./ReactivateUser";

export default function UsersTable() {
  const { users, loading, fetchUsers, error } = useUsers();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("activo");

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

  // Image Preview
  const [previewImage, setPreviewImage] = useState<{ src: string; title: string } | null>(null);

  const refresh = () =>
    void fetchUsers({
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      search: search.trim() || undefined,
      status: statusFilter,
    });

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search, statusFilter, fetchUsers]);

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

  const columns: Column<UserResponse>[] = [
    {
      id: "index",
      label: "Nº",
      minWidth: 60,
      render: (_row, index) => (page * rowsPerPage) + index + 1,
    },
    {
      id: "username",
      label: "Usuario",
      minWidth: 180,
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Tooltip title={row.avatarUrl ? "Hacer clic para ampliar foto" : ""} arrow>
            <Avatar
              src={row.avatarUrl || undefined}
              alt={row.username}
              onClick={() => {
                if (row.avatarUrl) {
                  setPreviewImage({
                    src: row.avatarUrl,
                    title: `Usuario: ${row.username}`,
                  });
                }
              }}
              sx={{
                width: 38,
                height: 38,
                bgcolor: row.avatarUrl ? "transparent" : "primary.main",
                cursor: row.avatarUrl ? "pointer" : "default",
                transition: "transform 0.15s ease",
                "&:hover": row.avatarUrl ? { transform: "scale(1.1)" } : {},
              }}
              slotProps={{
                img: {
                  style: { objectFit: "cover" },
                  onError: (e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  },
                },
              }}
            >
              {!row.avatarUrl && row.username.charAt(0).toUpperCase()}
            </Avatar>
          </Tooltip>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
            {row.username}
          </Typography>
        </Box>
      ),
    },
    {
      id: "fullName",
      label: "Nombre Completo",
      minWidth: 180,
      render: (row) => {
        const fullName = [row.firstName, row.lastName].filter(Boolean).join(" ");
        return fullName || "-";
      },
    },
    {
      id: "email",
      label: "Correo Electrónico",
      minWidth: 200,
      render: (row) => row.email,
    },
    {
      id: "role",
      label: "Rol",
      minWidth: 140,
      render: (row) => (
        <Chip
          label={row.role || "Sin rol"}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 600, borderRadius: "6px" }}
        />
      ),
    },
    {
      id: "status",
      label: "Estado",
      minWidth: 100,
      render: (row) => (
        <Chip
          label={row.isActive ? "Activo" : "Inactivo"}
          size="small"
          color={row.isActive ? "success" : "default"}
          sx={{ fontWeight: 600, borderRadius: "6px" }}
        />
      ),
    },
    {
      id: "actions",
      label: "Acciones",
      minWidth: 110,
      align: "center",
      render: (row) =>
        row.isActive ? (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
            <Tooltip title="Editar Usuario">
              <IconButton
                size="small"
                color="primary"
                onClick={() => {
                  setSelectedUser(row);
                  setEditOpen(true);
                }}
                sx={{ bgcolor: "action.hover" }}
              >
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Desactivar Usuario">
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  setSelectedUser(row);
                  setDeleteOpen(true);
                }}
                sx={{ bgcolor: "action.hover" }}
              >
                <DeleteRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
            <Tooltip title="Reactivar Usuario">
              <IconButton
                size="small"
                color="success"
                onClick={() => {
                  setSelectedUser(row);
                  setReactivateOpen(true);
                }}
                sx={{ bgcolor: "action.hover" }}
              >
                <RestoreRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Table Toolbar */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <TextField
            placeholder="Buscar usuario..."
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
              flex: "1 1 auto",
              maxWidth: { sm: 600 },
              "& .MuiOutlinedInput-root": { bgcolor: "background.paper" },
            }}
          />
          <Tooltip title="Nuevo Usuario">
            <IconButton
              onClick={() => setCreateOpen(true)}
              sx={{
                display: { xs: "inline-flex", sm: "none" },
                bgcolor: "primary.main",
                color: "primary.contrastText",
                borderRadius: 1,
                flexShrink: 0,
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              <AddRoundedIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{
              display: { xs: "none", sm: "inline-flex" },
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              px: 2.5,
              flexShrink: 0,
            }}
          >
            Nuevo Usuario
          </Button>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          <TextField
            select
            label="Estado"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            size="small"
            sx={{ width: { xs: "100%", sm: 200 } }}
          >
            {USER_STATUS_FILTERS.map((f) => (
              <MenuItem key={f.value} value={f.value}>
                {f.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {/* Table */}
      <CustomTable<UserResponse>
        columns={columns}
        data={users?.results || []}
        loading={loading}
        error={error}
        page={page}
        rowsPerPage={rowsPerPage}
        totalElements={users?.count || 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="No se encontraron usuarios registrados."
      />

      {/* Modals */}
      {createOpen && (
        <CreateUser
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSuccess={refresh}
        />
      )}

      {editOpen && selectedUser && (
        <EditUser
          key={selectedUser.id}
          open={editOpen}
          user={selectedUser}
          onClose={() => {
            setEditOpen(false);
            setSelectedUser(null);
          }}
          onSuccess={refresh}
        />
      )}

      {reactivateOpen && selectedUser && (
        <ReactivateUser
          open={reactivateOpen}
          user={selectedUser}
          onClose={() => {
            setReactivateOpen(false);
            setSelectedUser(null);
          }}
          onSuccess={refresh}
        />
      )}

      {deleteOpen && selectedUser && (
        <DeleteUser
          open={deleteOpen}
          user={selectedUser}
          onClose={() => {
            setDeleteOpen(false);
            setSelectedUser(null);
          }}
          onSuccess={refresh}
        />
      )}

      {/* Image Preview Lightbox */}
      <ImagePreviewDialog
        open={Boolean(previewImage)}
        src={previewImage?.src || null}
        title={previewImage?.title}
        onClose={() => setPreviewImage(null)}
      />
    </Box>
  );
}
