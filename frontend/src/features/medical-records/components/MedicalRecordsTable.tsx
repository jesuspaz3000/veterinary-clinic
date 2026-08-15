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
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import CustomTable, { Column } from "@/shared/components/CustomTable";
import { useMedicalRecords } from "../hooks/useMedicalRecords";
import { MedicalRecordResponse, RECORD_TYPES, RECORD_TYPE_LABELS } from "../type/medicalRecordsTypes";
import { RecordTypeChip, RecordStatusChip } from "./MedicalRecordChips";
import { PetService } from "@/features/pets/service/pets.service";
import { PetResponse } from "@/features/pets/type/petsTypes";
import { getUserDisplayName } from "@/features/appointments/utils/professionals";
import { useAuthStore } from "@/store/auth.store";
import { PERMISSIONS } from "@/shared/config/permissions";
import MedicalRecordFormDialog from "./MedicalRecordFormDialog";
import MedicalRecordDetailDialog from "./MedicalRecordDetailDialog";
import DeleteMedicalRecordDialog from "./DeleteMedicalRecordDialog";

export default function MedicalRecordsTable() {
  const { records, loading, fetchRecords, error } = useMedicalRecords();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canCreate = hasPermission(PERMISSIONS.MEDICAL_RECORDS.CREATE);
  const canUpdate = hasPermission(PERMISSIONS.MEDICAL_RECORDS.UPDATE);
  const canDelete = hasPermission(PERMISSIONS.MEDICAL_RECORDS.DELETE);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pets, setPets] = useState<PetResponse[]>([]);
  const [petFilter, setPetFilter] = useState<PetResponse | null>(null);
  const [typeFilter, setTypeFilter] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecordResponse | null>(null);

  useEffect(() => {
    PetService.getAllPets()
      .then((data) => setPets(data || []))
      .catch((err) => console.error("Error loading pets:", err));
  }, []);

  useEffect(() => {
    void fetchRecords({
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      petId: petFilter?.id ?? undefined,
      recordType: typeFilter || undefined,
    });
  }, [page, rowsPerPage, petFilter, typeFilter, fetchRecords]);

  const refresh = () =>
    void fetchRecords({
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      petId: petFilter?.id ?? undefined,
      recordType: typeFilter || undefined,
    });

  const columns: Column<MedicalRecordResponse>[] = [
    {
      id: "index",
      label: "Nº",
      minWidth: 50,
      render: (_row, index) => page * rowsPerPage + index + 1,
    },
    {
      id: "date",
      label: "Fecha",
      minWidth: 130,
      render: (row) => (
        <Typography variant="body2" color="text.primary">
          {dayjs(row.recordDate).format("DD/MM/YYYY HH:mm")}
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
      id: "type",
      label: "Tipo",
      minWidth: 130,
      render: (row) => <RecordTypeChip type={row.recordType} />,
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
      id: "diagnosis",
      label: "Diagnóstico",
      minWidth: 200,
      render: (row) => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            maxWidth: 260,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {row.diagnosis || "-"}
        </Typography>
      ),
    },
    {
      id: "status",
      label: "Estado",
      minWidth: 150,
      render: (row) => <RecordStatusChip status={row.status} />,
    },
    {
      id: "actions",
      label: "Acciones",
      minWidth: 140,
      align: "center",
      render: (row) => (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          <Tooltip title="Ver detalle">
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
              <Tooltip title="Nuevo Registro">
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
                Nuevo Registro
              </Button>
            </>
          )}
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          <TextField
            select
            label="Tipo de registro"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(0);
            }}
            size="small"
            sx={{ width: { xs: "100%", sm: 200 } }}
          >
            <MenuItem value="">Todos</MenuItem>
            {RECORD_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {RECORD_TYPE_LABELS[t]}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      <CustomTable<MedicalRecordResponse>
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
        emptyMessage="No se encontraron registros médicos."
      />

      {createOpen && (
        <MedicalRecordFormDialog open onClose={() => setCreateOpen(false)} onSuccess={refresh} />
      )}

      {editOpen && selectedRecord && (
        <MedicalRecordFormDialog
          key={selectedRecord.id}
          open
          record={selectedRecord}
          onClose={() => {
            setEditOpen(false);
            setSelectedRecord(null);
          }}
          onSuccess={refresh}
        />
      )}

      {detailOpen && selectedRecord && (
        <MedicalRecordDetailDialog
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
        <DeleteMedicalRecordDialog
          open
          record={selectedRecord}
          onClose={() => {
            setDeleteOpen(false);
            setSelectedRecord(null);
          }}
          onSuccess={refresh}
        />
      )}
    </Box>
  );
}
