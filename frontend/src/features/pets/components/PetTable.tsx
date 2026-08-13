"use client";

import { useEffect, useState } from "react";
import { usePets } from "../hooks/usePets";
import CustomTable, { Column } from "@/shared/components/CustomTable";
import ImagePreviewDialog from "@/shared/components/ImagePreviewDialog";
import { PetResponse } from "../type/petsTypes";
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
import PetsIcon from "@mui/icons-material/Pets";
import CreatePetDialog from "./CreatePetDialog";
import EditPetDialog from "./EditPetDialog";
import DeletePetDialog from "./DeletePetDialog";

export default function PetTable() {
  const { pets, loading, fetchPets, error } = usePets();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<PetResponse | null>(null);

  // Image preview state
  const [previewImage, setPreviewImage] = useState<{ src: string; title: string } | null>(null);

  useEffect(() => {
    void fetchPets({
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      search: search.trim() || undefined,
    });
  }, [page, rowsPerPage, search, fetchPets]);

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

  const columns: Column<PetResponse>[] = [
    {
      id: "index",
      label: "Nº",
      minWidth: 60,
      render: (_row, index) => page * rowsPerPage + index + 1,
    },
    {
      id: "name",
      label: "Mascota",
      minWidth: 200,
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Tooltip title={row.photoUrl ? "Hacer clic para ampliar foto" : ""} arrow>
            <Avatar
              src={row.photoUrl || undefined}
              alt={row.name}
              onClick={() => {
                if (row.photoUrl) {
                  setPreviewImage({
                    src: row.photoUrl,
                    title: `Mascota: ${row.name} (${row.species}${row.breed ? ` - ${row.breed}` : ""})`,
                  });
                }
              }}
              sx={{
                width: 42,
                height: 42,
                bgcolor: row.photoUrl ? "transparent" : "primary.main",
                cursor: row.photoUrl ? "pointer" : "default",
                transition: "transform 0.15s ease",
                "&:hover": row.photoUrl ? { transform: "scale(1.1)" } : {},
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
              {!row.photoUrl && <PetsIcon fontSize="small" />}
            </Avatar>
          </Tooltip>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.age || "Edad no disp."}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: "species",
      label: "Especie / Raza",
      minWidth: 160,
      render: (row) => (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, alignItems: "flex-start" }}>
          <Chip
            label={row.species}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600, borderRadius: "6px" }}
          />
          {row.breed && (
            <Typography variant="caption" color="text.secondary">
              {row.breed}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: "details",
      label: "Sexo / Peso",
      minWidth: 140,
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>
            {row.sex}
          </Typography>
          {row.weight !== null && row.weight !== undefined && (
            <Typography variant="caption" color="text.secondary">
              {row.weight} Kg
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: "owner",
      label: "Dueño / Cliente",
      minWidth: 200,
      render: (row) => {
        const owner = row.owner;
        if (!owner) return "-";
        return (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
              {owner.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {owner.documentNumber
                ? `${owner.documentType || "DNI"}: ${owner.documentNumber} • Tel: ${owner.phone}`
                : `Tel: ${owner.phone}`}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: "status",
      label: "Estado",
      minWidth: 100,
      render: (row) => {
        const isActive = row.status === "activo";
        return (
          <Chip
            label={isActive ? "Activo" : row.status}
            size="small"
            color={isActive ? "success" : "default"}
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
          <Tooltip title="Editar Mascota">
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setSelectedPet(row);
                setEditOpen(true);
              }}
              sx={{ bgcolor: "action.hover" }}
            >
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Desactivar Mascota">
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                setSelectedPet(row);
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
          placeholder="Buscar por nombre, especie, raza, microchip o dueño..."
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
            Nueva Mascota
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <CustomTable<PetResponse>
        columns={columns}
        data={pets?.results || []}
        loading={loading}
        error={error}
        page={page}
        rowsPerPage={rowsPerPage}
        totalElements={pets?.count || 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="No se encontraron mascotas registradas."
      />

      {/* Modals */}
      {createOpen && (
        <CreatePetDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSuccess={() =>
            void fetchPets({
              limit: rowsPerPage,
              offset: page * rowsPerPage,
              search: search.trim() || undefined,
            })
          }
        />
      )}

      {editOpen && selectedPet && (
        <EditPetDialog
          key={selectedPet.id}
          open={editOpen}
          pet={selectedPet}
          onClose={() => {
            setEditOpen(false);
            setSelectedPet(null);
          }}
          onSuccess={() =>
            void fetchPets({
              limit: rowsPerPage,
              offset: page * rowsPerPage,
              search: search.trim() || undefined,
            })
          }
        />
      )}

      {deleteOpen && selectedPet && (
        <DeletePetDialog
          open={deleteOpen}
          pet={selectedPet}
          onClose={() => {
            setDeleteOpen(false);
            setSelectedPet(null);
          }}
          onSuccess={() =>
            void fetchPets({
              limit: rowsPerPage,
              offset: page * rowsPerPage,
              search: search.trim() || undefined,
            })
          }
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
