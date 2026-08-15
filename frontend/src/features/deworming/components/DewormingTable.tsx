"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Box,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Button,
  Typography,
  Autocomplete,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import CustomTable, { Column } from "@/shared/components/CustomTable";
import { useDeworming } from "../hooks/useDeworming";
import { DewormingRecordResponse, DEWORMING_TYPES, DEWORMING_TYPE_LABELS, DEWORMING_STATUS_FILTERS } from "../type/dewormingTypes";
import { DewormingTypeChip, DewormingDoseStatusChip } from "./DewormingChips";
import { PetService } from "@/features/pets/service/pets.service";
import { PetResponse } from "@/features/pets/type/petsTypes";
import { getUserDisplayName } from "@/features/appointments/utils/professionals";
import { useAuthStore } from "@/store/auth.store";
import { PERMISSIONS } from "@/shared/config/permissions";
import DewormingFormDialog from "./DewormingFormDialog";
import DeleteDewormingDialog from "./DeleteDewormingDialog";
import ReactivateDewormingDialog from "./ReactivateDewormingDialog";

const DOSE_FILTERS = [
  { value: "", label: "Todas" },
  { value: "upcoming", label: "Próximas 30 días" },
  { value: "overdue", label: "Vencidas" },
] as const;

export default function DewormingTable() {
  const { records, loading, fetchRecords, error } = useDeworming();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canCreate = hasPermission(PERMISSIONS.DEWORMING.CREATE);
  const canUpdate = hasPermission(PERMISSIONS.DEWORMING.UPDATE);
  const canDelete = hasPermission(PERMISSIONS.DEWORMING.DELETE);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pets, setPets] = useState<PetResponse[]>([]);
  const [petFilter, setPetFilter] = useState<PetResponse | null>(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [doseFilter, setDoseFilter] = useState<(typeof DOSE_FILTERS)[number]["value"]>("");
  const [statusFilter, setStatusFilter] = useState<string>("activo");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DewormingRecordResponse | null>(null);

  useEffect(() => {
    PetService.getAllPets()
      .then((data) => setPets(data || []))
      .catch((err) => console.error("Error loading pets:", err));
  }, []);

  const buildParams = () => {
    const today = dayjs().format("YYYY-MM-DD");
    return {
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      petId: petFilter?.id ?? undefined,
      dewormingType: typeFilter || undefined,
      nextApplicationFrom: doseFilter === "upcoming" ? today : undefined,
      nextApplicationTo:
        doseFilter === "upcoming"
          ? dayjs().add(30, "day").format("YYYY-MM-DD")
          : doseFilter === "overdue"
            ? dayjs().subtract(1, "day").format("YYYY-MM-DD")
            : undefined,
      status: statusFilter,
    };
  };

  useEffect(() => {
    void fetchRecords(buildParams());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, petFilter, typeFilter, doseFilter, statusFilter, fetchRecords]);

  const refresh = () => void fetchRecords(buildParams());

  const columns: Column<DewormingRecordResponse>[] = [
    {
      id: "index",
      label: "Nº",
      minWidth: 50,
      render: (_row, index) => page * rowsPerPage + index + 1,
    },
    {
      id: "date",
      label: "Fecha de aplicación",
      minWidth: 140,
      render: (row) => (
        <Typography variant="body2" color="text.primary">
          {dayjs(row.applicationDate).format("DD/MM/YYYY")}
        </Typography>
      ),
    },
    {
      id: "pet",
      label: "Mascota",
      minWidth: 200,
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
            {row.pet?.name ?? "-"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.pet?.owner?.fullName ?? ""}
          </Typography>
        </Box>
      ),
    },
    {
      id: "product",
      label: "Producto",
      minWidth: 180,
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
            {row.productName}
          </Typography>
          {row.productBrand && (
            <Typography variant="caption" color="text.secondary">
              {row.productBrand}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: "type",
      label: "Tipo",
      minWidth: 130,
      render: (row) => <DewormingTypeChip type={row.dewormingType} />,
    },
    {
      id: "veterinarian",
      label: "Veterinario",
      minWidth: 180,
      render: (row) => (
        <Typography variant="body2" color="text.primary">
          {getUserDisplayName(row.veterinarian?.user, "Veterinario")}
        </Typography>
      ),
    },
    {
      id: "nextApplication",
      label: "Próxima aplicación",
      minWidth: 200,
      render: (row) => (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, alignItems: "flex-start" }}>
          <Typography variant="body2" color="text.primary">
            {row.nextApplicationDate ? dayjs(row.nextApplicationDate).format("DD/MM/YYYY") : "-"}
          </Typography>
          <DewormingDoseStatusChip nextApplicationDate={row.nextApplicationDate} />
        </Box>
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
            {canUpdate && (
              <Tooltip title="Editar registro">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => {
                    setSelectedRecord(row);
                    setEditOpen(true);
                  }}
                  sx={{ bgcolor: "action.hover" }}
                >
                  <EditRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title="Eliminar registro">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => {
                    setSelectedRecord(row);
                    setDeleteOpen(true);
                  }}
                  sx={{ bgcolor: "action.hover" }}
                >
                  <DeleteRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ) : (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
            {canUpdate && (
              <Tooltip title="Reactivar registro">
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => {
                    setSelectedRecord(row);
                    setReactivateOpen(true);
                  }}
                  sx={{ bgcolor: "action.hover" }}
                >
                  <RestoreRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Toolbar de filtros */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Autocomplete
            options={pets}
            value={petFilter}
            onChange={(_e, newValue) => {
              setPetFilter(newValue);
              setPage(0);
            }}
            getOptionLabel={(option) =>
              option.owner ? `${option.name} (${option.owner.fullName})` : option.name
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            size="small"
            sx={{ flex: "1 1 auto", maxWidth: { sm: 420 } }}
            renderInput={(params) => (
              <TextField {...params} label="Filtrar por mascota" placeholder="Todas las mascotas" />
            )}
          />
          {canCreate && (
            <>
              <Tooltip title="Nueva Desparasitación">
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
                Nueva Desparasitación
              </Button>
            </>
          )}
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          <TextField
            select
            label="Tipo"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(0);
            }}
            size="small"
            sx={{ width: { xs: "100%", sm: 200 } }}
          >
            <MenuItem value="">Todos</MenuItem>
            {DEWORMING_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {DEWORMING_TYPE_LABELS[t]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Estado de dosis"
            value={doseFilter}
            onChange={(e) => {
              setDoseFilter(e.target.value as (typeof DOSE_FILTERS)[number]["value"]);
              setPage(0);
            }}
            size="small"
            sx={{ width: { xs: "100%", sm: 200 } }}
          >
            {DOSE_FILTERS.map((f) => (
              <MenuItem key={f.value} value={f.value}>
                {f.label}
              </MenuItem>
            ))}
          </TextField>
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
            {DEWORMING_STATUS_FILTERS.map((f) => (
              <MenuItem key={f.value} value={f.value}>
                {f.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      <CustomTable<DewormingRecordResponse>
        columns={columns}
        data={records?.results || []}
        loading={loading}
        error={error}
        page={page}
        rowsPerPage={rowsPerPage}
        totalElements={records?.count || 0}
        onPageChange={(_e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        emptyMessage="No se encontraron registros de desparasitación."
      />

      {createOpen && (
        <DewormingFormDialog open onClose={() => setCreateOpen(false)} onSuccess={refresh} />
      )}

      {editOpen && selectedRecord && (
        <DewormingFormDialog
          key={selectedRecord.id}
          open
          recordId={selectedRecord.id}
          onClose={() => {
            setEditOpen(false);
            setSelectedRecord(null);
          }}
          onSuccess={refresh}
        />
      )}

      {deleteOpen && selectedRecord && (
        <DeleteDewormingDialog
          open
          record={selectedRecord}
          onClose={() => {
            setDeleteOpen(false);
            setSelectedRecord(null);
          }}
          onSuccess={refresh}
        />
      )}

      {reactivateOpen && selectedRecord && (
        <ReactivateDewormingDialog
          open
          record={selectedRecord}
          onClose={() => {
            setReactivateOpen(false);
            setSelectedRecord(null);
          }}
          onSuccess={refresh}
        />
      )}
    </Box>
  );
}
