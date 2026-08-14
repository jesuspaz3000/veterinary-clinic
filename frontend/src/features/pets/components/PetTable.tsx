"use client";

import { useEffect, useState } from "react";
import { usePets } from "../hooks/usePets";
import CustomTable, { Column } from "@/shared/components/CustomTable";
import ImagePreviewDialog from "@/shared/components/ImagePreviewDialog";
import { PET_STATUS_FILTERS, PetResponse } from "../type/petsTypes";
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
import PhotoLibraryRoundedIcon from "@mui/icons-material/PhotoLibraryRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import PetsIcon from "@mui/icons-material/Pets";
import CreatePetDialog from "./CreatePetDialog";
import EditPetDialog from "./EditPetDialog";
import DeletePetDialog from "./DeletePetDialog";
import ReactivatePetDialog from "./ReactivatePetDialog";
import PetPhotosDialog from "./PetPhotosDialog";
import ClinicalHistoryDialog from "./ClinicalHistoryDialog";

export default function PetTable() {
  const { pets, loading, fetchPets, error } = usePets();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("activo");

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [photosOpen, setPhotosOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<PetResponse | null>(null);

  // Image preview state
  const [previewImage, setPreviewImage] = useState<{ src: string; title: string } | null>(null);

  const refresh = () =>
    void fetchPets({
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      search: search.trim() || undefined,
      status: statusFilter,
    });

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search, statusFilter, fetchPets]);

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
            label={isActive ? "Activo" : row.status === "inactivo" ? "Inactivo" : row.status}
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
      minWidth: 150,
      align: "center",
      render: (row) =>
        row.status === "activo" ? (
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
            <Tooltip title="Galería de Fotos">
              <IconButton
                size="small"
                color="secondary"
                onClick={() => {
                  setSelectedPet(row);
                  setPhotosOpen(true);
                }}
                sx={{ bgcolor: "action.hover" }}
              >
                <PhotoLibraryRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Historial Clínico">
              <IconButton
                size="small"
                onClick={() => {
                  setSelectedPet(row);
                  setHistoryOpen(true);
                }}
                sx={{ bgcolor: "action.hover" }}
              >
                <HistoryRoundedIcon fontSize="small" />
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
        ) : (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
            <Tooltip title="Galería de Fotos">
              <IconButton
                size="small"
                color="secondary"
                onClick={() => {
                  setSelectedPet(row);
                  setPhotosOpen(true);
                }}
                sx={{ bgcolor: "action.hover" }}
              >
                <PhotoLibraryRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Historial Clínico">
              <IconButton
                size="small"
                onClick={() => {
                  setSelectedPet(row);
                  setHistoryOpen(true);
                }}
                sx={{ bgcolor: "action.hover" }}
              >
                <HistoryRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reactivar Mascota">
              <IconButton
                size="small"
                color="success"
                onClick={() => {
                  setSelectedPet(row);
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", flexGrow: 1, maxWidth: { md: "70%" } }}>
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
              flexGrow: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                bgcolor: "background.paper",
              },
            }}
          />
          <TextField
            select
            label="Estado"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            size="small"
            sx={{ minWidth: 160 }}
          >
            {PET_STATUS_FILTERS.map((f) => (
              <MenuItem key={f.value} value={f.value}>
                {f.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

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
          onSuccess={refresh}
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
          onSuccess={refresh}
        />
      )}

      {reactivateOpen && selectedPet && (
        <ReactivatePetDialog
          open={reactivateOpen}
          pet={selectedPet}
          onClose={() => {
            setReactivateOpen(false);
            setSelectedPet(null);
          }}
          onSuccess={refresh}
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
          onSuccess={refresh}
        />
      )}

      {photosOpen && selectedPet && (
        <PetPhotosDialog
          open={photosOpen}
          petId={selectedPet.id}
          onClose={() => {
            setPhotosOpen(false);
            setSelectedPet(null);
          }}
          onChanged={refresh}
        />
      )}

      {historyOpen && selectedPet && (
        <ClinicalHistoryDialog
          open={historyOpen}
          pet={selectedPet}
          onClose={() => {
            setHistoryOpen(false);
            setSelectedPet(null);
          }}
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
