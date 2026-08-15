"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Dayjs } from "dayjs";
import CustomTable, { Column } from "@/shared/components/CustomTable";
import { useAuthStore } from "@/store/auth.store";
import { PERMISSIONS } from "@/shared/config/permissions";
import { useAppointments } from "../hooks/useAppointments";
import {
  AppointmentResponse,
  AppointmentStatus,
  APPOINTMENT_STATUSES,
  APPOINTMENT_STATUS_LABELS,
} from "../type/appointmentsTypes";
import { getAppointmentProfessional } from "../utils/professionals";
import AppointmentStatusChip from "./AppointmentStatusChip";
import CreateAppointmentDialog from "./CreateAppointmentDialog";
import EditAppointmentDialog from "./EditAppointmentDialog";
import CancelAppointmentDialog from "./CancelAppointmentDialog";

export default function AppointmentsTable() {
  const { appointments, loading, fetchAppointments, error } = useAppointments();
  const hasPermission = useAuthStore((s) => s.hasPermission);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null);

  const refresh = () => {
    void fetchAppointments({
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      status: statusFilter || undefined,
      from: fromDate?.format("YYYY-MM-DD"),
      to: toDate?.format("YYYY-MM-DD"),
    });
  };

  useEffect(() => {
    refresh();
  }, [page, rowsPerPage, statusFilter, fromDate, toDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const canCreate = hasPermission(PERMISSIONS.APPOINTMENTS.CREATE);
  const canUpdate = hasPermission(PERMISSIONS.APPOINTMENTS.UPDATE);
  const canDelete = hasPermission(PERMISSIONS.APPOINTMENTS.DELETE);

  const columns: Column<AppointmentResponse>[] = [
    {
      id: "index",
      label: "Nº",
      minWidth: 60,
      render: (_row, index) => page * rowsPerPage + index + 1,
    },
    {
      id: "date",
      label: "Fecha",
      minWidth: 120,
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
          {row.date}
        </Typography>
      ),
    },
    {
      id: "startTime",
      label: "Horario",
      minWidth: 130,
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>
          {row.startTime.slice(0, 5)} — {row.endTime.slice(0, 5)}
        </Typography>
      ),
    },
    {
      id: "pet",
      label: "Mascota / Dueño",
      minWidth: 220,
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
            {row.pet.name}{" "}
            <Typography component="span" variant="caption" color="text.secondary">
              ({row.pet.species})
            </Typography>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.pet.owner?.fullName || "Dueño no registrado"}
          </Typography>
        </Box>
      ),
    },
    {
      id: "veterinarian",
      label: "Profesional",
      minWidth: 170,
      render: (row) => {
        const professional = getAppointmentProfessional(row);
        return (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>
              {professional?.label || "Sin asignar"}
            </Typography>
            {professional && (
              <Typography variant="caption" color="text.secondary">
                {professional.kind === "veterinarian" ? "Veterinario" : "Grooming"}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      id: "serviceType",
      label: "Servicio",
      minWidth: 160,
      render: (row) => (
        <Chip
          label={row.serviceType}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 600, borderRadius: "6px", maxWidth: 180 }}
        />
      ),
    },
    {
      id: "status",
      label: "Estado",
      minWidth: 120,
      render: (row) => <AppointmentStatusChip status={row.status} />,
    },
    {
      id: "actions",
      label: "Acciones",
      minWidth: 110,
      align: "center",
      render: (row) => (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          {canUpdate && (
            <Tooltip title="Editar Cita">
              <IconButton
                size="small"
                color="primary"
                onClick={() => {
                  setSelectedAppointment(row);
                  setEditOpen(true);
                }}
                sx={{ bgcolor: "action.hover" }}
              >
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canDelete && row.status !== "cancelada" && row.status !== "completada" && (
            <Tooltip title="Cancelar Cita">
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  setSelectedAppointment(row);
                  setCancelOpen(true);
                }}
                sx={{ bgcolor: "action.hover" }}
              >
                <CancelRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
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
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(auto-fit, minmax(190px, 1fr))" },
            gap: 2,
            alignItems: "center",
            width: { xs: "100%", md: "auto" },
            flexGrow: 1,
            maxWidth: { md: "70%" },
          }}
        >
          <TextField
            select
            label="Filtrar por estado"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            size="small"
            sx={{ width: "100%" }}
          >
            <MenuItem value="">Todos los estados</MenuItem>
            {APPOINTMENT_STATUSES.map((s: AppointmentStatus) => (
              <MenuItem key={s} value={s}>
                {APPOINTMENT_STATUS_LABELS[s]}
              </MenuItem>
            ))}
          </TextField>

          <DatePicker
            label="Desde"
            value={fromDate}
            onChange={(newValue) => {
              setFromDate(newValue);
              setPage(0);
            }}
            maxDate={toDate ?? undefined}
            format="DD/MM/YYYY"
            slotProps={{ field: { clearable: true }, textField: { size: "small", sx: { width: "100%" } } }}
          />
          <DatePicker
            label="Hasta"
            value={toDate}
            onChange={(newValue) => {
              setToDate(newValue);
              setPage(0);
            }}
            minDate={fromDate ?? undefined}
            format="DD/MM/YYYY"
            slotProps={{ field: { clearable: true }, textField: { size: "small", sx: { width: "100%" } } }}
          />
        </Box>

        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600, px: 2.5 }}
          >
            Nueva Cita
          </Button>
        )}
      </Box>

      {/* Table */}
      <CustomTable<AppointmentResponse>
        columns={columns}
        data={appointments?.results || []}
        loading={loading}
        error={error}
        page={page}
        rowsPerPage={rowsPerPage}
        totalElements={appointments?.count || 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="No se encontraron citas registradas."
      />

      {/* Dialogs */}
      {createOpen && (
        <CreateAppointmentDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSuccess={refresh}
        />
      )}

      {editOpen && selectedAppointment && (
        <EditAppointmentDialog
          key={selectedAppointment.id}
          open={editOpen}
          appointmentId={selectedAppointment.id}
          onClose={() => {
            setEditOpen(false);
            setSelectedAppointment(null);
          }}
          onSuccess={refresh}
        />
      )}

      {cancelOpen && selectedAppointment && (
        <CancelAppointmentDialog
          open={cancelOpen}
          appointment={selectedAppointment}
          onClose={() => {
            setCancelOpen(false);
            setSelectedAppointment(null);
          }}
          onSuccess={refresh}
        />
      )}
    </Box>
  );
}
