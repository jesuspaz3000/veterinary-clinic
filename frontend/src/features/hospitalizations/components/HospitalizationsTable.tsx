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
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import CustomTable, { Column } from "@/shared/components/CustomTable";
import { useHospitalizations } from "../hooks/useHospitalizations";
import { HospitalizationRecordResponse, HOSPITALIZATION_STATUSES, HOSPITALIZATION_STATUS_LABELS, HOSPITALIZATION_ACTIVE_STATUS_FILTERS } from "../type/hospitalizationsTypes";
import { HospitalizationStatusChip } from "./HospitalizationChips";
import { PetService } from "@/features/pets/service/pets.service";
import { PetResponse } from "@/features/pets/type/petsTypes";
import { getUserDisplayName } from "@/features/appointments/utils/professionals";
import { useAuthStore } from "@/store/auth.store";
import { PERMISSIONS } from "@/shared/config/permissions";
import HospitalizationFormDialog from "./HospitalizationFormDialog";
import HospitalizationDetailDialog from "./HospitalizationDetailDialog";
import DeleteHospitalizationDialog from "./DeleteHospitalizationDialog";
import ReactivateHospitalizationDialog from "./ReactivateHospitalizationDialog";

export default function HospitalizationsTable() {
  const { records, loading, fetchRecords, error } = useHospitalizations();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canCreate = hasPermission(PERMISSIONS.HOSPITALIZATION.CREATE);
  const canUpdate = hasPermission(PERMISSIONS.HOSPITALIZATION.UPDATE);
  const canDelete = hasPermission(PERMISSIONS.HOSPITALIZATION.DELETE);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pets, setPets] = useState<PetResponse[]>([]);
  const [petFilter, setPetFilter] = useState<PetResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("activo");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HospitalizationRecordResponse | null>(null);

  useEffect(() => {
    PetService.getAllPets()
      .then((data) => setPets(data || []))
      .catch((err) => console.error("Error loading pets:", err));
  }, []);

  const buildParams = () => ({
    limit: rowsPerPage,
    offset: page * rowsPerPage,
    petId: petFilter?.id ?? undefined,
    status: statusFilter || undefined,
    activeStatus: activeStatusFilter,
  });

  useEffect(() => {
    void fetchRecords(buildParams());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, petFilter, statusFilter, activeStatusFilter, fetchRecords]);

  const refresh = () => void fetchRecords(buildParams());

  const columns: Column<HospitalizationRecordResponse>[] = [
    {
      id: "index",
      label: "Nº",
      minWidth: 50,
      render: (_row, index) => page * rowsPerPage + index + 1,
    },
    {
      id: "admission",
      label: "Ingreso",
      minWidth: 140,
      render: (row) => (
        <Typography variant="body2" color="text.primary">
          {dayjs(row.admissionDate).format("DD/MM/YYYY HH:mm")}
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
      id: "cage",
      label: "Jaula",
      minWidth: 90,
      render: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.cageNumber || "-"}
        </Typography>
      ),
    },
    {
      id: "veterinarian",
      label: "Responsable",
      minWidth: 180,
      render: (row) => (
        <Typography variant="body2" color="text.primary">
          {getUserDisplayName(row.veterinarian?.user, "Veterinario")}
        </Typography>
      ),
    },
    {
      id: "evolutions",
      label: "Evoluciones",
      minWidth: 100,
      align: "center",
      render: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.evolutions.length}
        </Typography>
      ),
    },
    {
      id: "status",
      label: "Estado",
      minWidth: 130,
      render: (row) => <HospitalizationStatusChip status={row.status} />,
    },
    {
      id: "actions",
      label: "Acciones",
      minWidth: 140,
      align: "center",
      render: (row) => (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          <Tooltip title="Ver detalle / evoluciones">
            <IconButton
              size="small"
              color="info"
              onClick={() => {
                setSelectedRecord(row);
                setDetailOpen(true);
              }}
              sx={{ bgcolor: "action.hover" }}
            >
              <VisibilityRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {row.isActive ? (
            <>
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
            </>
          ) : (
            canUpdate && (
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
            )
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Toolbar de filtros */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", flexGrow: 1, maxWidth: { md: "70%" } }}>
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
            sx={{ minWidth: 260, flexGrow: 1 }}
            renderInput={(params) => (
              <TextField {...params} label="Filtrar por mascota" placeholder="Todas las mascotas" size="small" />
            )}
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
            <MenuItem value="">Todos</MenuItem>
            {HOSPITALIZATION_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {HOSPITALIZATION_STATUS_LABELS[s]}
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
            sx={{ minWidth: 170 }}
          >
            {HOSPITALIZATION_ACTIVE_STATUS_FILTERS.map((f) => (
              <MenuItem key={f.value} value={f.value}>
                {f.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600, px: 2.5 }}
          >
            Nueva Hospitalización
          </Button>
        )}
      </Box>

      <CustomTable<HospitalizationRecordResponse>
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
        emptyMessage="No se encontraron registros de hospitalización."
      />

      {createOpen && (
        <HospitalizationFormDialog open onClose={() => setCreateOpen(false)} onSuccess={refresh} />
      )}

      {editOpen && selectedRecord && (
        <HospitalizationFormDialog
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

      {detailOpen && selectedRecord && (
        <HospitalizationDetailDialog
          key={`detail-${selectedRecord.id}`}
          open
          recordId={selectedRecord.id}
          onClose={() => {
            setDetailOpen(false);
            setSelectedRecord(null);
          }}
          onChanged={refresh}
        />
      )}

      {deleteOpen && selectedRecord && (
        <DeleteHospitalizationDialog
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
        <ReactivateHospitalizationDialog
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
