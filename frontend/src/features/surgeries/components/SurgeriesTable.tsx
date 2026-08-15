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
import { useSurgeries } from "../hooks/useSurgeries";
import { SurgeryRecordResponse, SURGERY_TYPES, SURGERY_TYPE_LABELS, SURGERY_STATUSES, SURGERY_STATUS_LABELS, SURGERY_ACTIVE_STATUS_FILTERS } from "../type/surgeriesTypes";
import { SurgeryTypeChip, SurgeryStatusChip } from "./SurgeryChips";
import { PetService } from "@/features/pets/service/pets.service";
import { PetResponse } from "@/features/pets/type/petsTypes";
import { getUserDisplayName } from "@/features/appointments/utils/professionals";
import { useAuthStore } from "@/store/auth.store";
import { PERMISSIONS } from "@/shared/config/permissions";
import SurgeryFormDialog from "./SurgeryFormDialog";
import DeleteSurgeryDialog from "./DeleteSurgeryDialog";
import ReactivateSurgeryDialog from "./ReactivateSurgeryDialog";

export default function SurgeriesTable() {
  const { records, loading, fetchRecords, error } = useSurgeries();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canCreate = hasPermission(PERMISSIONS.SURGERIES.CREATE);
  const canUpdate = hasPermission(PERMISSIONS.SURGERIES.UPDATE);
  const canDelete = hasPermission(PERMISSIONS.SURGERIES.DELETE);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pets, setPets] = useState<PetResponse[]>([]);
  const [petFilter, setPetFilter] = useState<PetResponse | null>(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("activo");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SurgeryRecordResponse | null>(null);

  useEffect(() => {
    PetService.getAllPets()
      .then((data) => setPets(data || []))
      .catch((err) => console.error("Error loading pets:", err));
  }, []);

  const buildParams = () => ({
    limit: rowsPerPage,
    offset: page * rowsPerPage,
    petId: petFilter?.id ?? undefined,
    surgeryType: typeFilter || undefined,
    status: statusFilter || undefined,
    activeStatus: activeStatusFilter,
  });

  useEffect(() => {
    void fetchRecords(buildParams());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, petFilter, typeFilter, statusFilter, activeStatusFilter, fetchRecords]);

  const refresh = () => void fetchRecords(buildParams());

  const columns: Column<SurgeryRecordResponse>[] = [
    {
      id: "index",
      label: "Nº",
      minWidth: 50,
      render: (_row, index) => page * rowsPerPage + index + 1,
    },
    {
      id: "date",
      label: "Fecha de cirugía",
      minWidth: 150,
      render: (row) => (
        <Box>
          <Typography variant="body2" color="text.primary">
            {dayjs(row.surgeryDate).format("DD/MM/YYYY HH:mm")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Creado {dayjs(row.createdAt).format("DD/MM/YYYY HH:mm")}
          </Typography>
        </Box>
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
      id: "type",
      label: "Tipo",
      minWidth: 130,
      render: (row) => <SurgeryTypeChip type={row.surgeryType} />,
    },
    {
      id: "surgeon",
      label: "Cirujano",
      minWidth: 180,
      render: (row) => (
        <Typography variant="body2" color="text.primary">
          {getUserDisplayName(row.veterinarian?.user, "Veterinario")}
        </Typography>
      ),
    },
    {
      id: "duration",
      label: "Duración",
      minWidth: 100,
      render: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.durationMinutes ? `${row.durationMinutes} min` : "-"}
        </Typography>
      ),
    },
    {
      id: "status",
      label: "Estado",
      minWidth: 150,
      render: (row) => <SurgeryStatusChip status={row.status} />,
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
              <Tooltip title="Nueva Cirugía">
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
                Nueva Cirugía
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
            {SURGERY_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {SURGERY_TYPE_LABELS[t]}
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
            <MenuItem value="">Todos</MenuItem>
            {SURGERY_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {SURGERY_STATUS_LABELS[s]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Activo/Inactivo"
            value={activeStatusFilter}
            onChange={(e) => {
              setActiveStatusFilter(e.target.value);
              setPage(0);
            }}
            size="small"
            sx={{ width: { xs: "100%", sm: 200 } }}
          >
            {SURGERY_ACTIVE_STATUS_FILTERS.map((f) => (
              <MenuItem key={f.value} value={f.value}>
                {f.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      <CustomTable<SurgeryRecordResponse>
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
        emptyMessage="No se encontraron registros de cirugía."
      />

      {createOpen && (
        <SurgeryFormDialog open onClose={() => setCreateOpen(false)} onSuccess={refresh} />
      )}

      {editOpen && selectedRecord && (
        <SurgeryFormDialog
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
        <DeleteSurgeryDialog
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
        <ReactivateSurgeryDialog
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
