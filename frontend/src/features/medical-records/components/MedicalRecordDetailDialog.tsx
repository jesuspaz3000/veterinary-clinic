"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  Link,
} from "@mui/material";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import { MedicalRecordsService } from "../service/medicalRecords.service";
import {
  MedicalRecordResponse,
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  DocumentType,
} from "../type/medicalRecordsTypes";
import { RecordTypeChip, RecordStatusChip } from "./MedicalRecordChips";
import { getUserDisplayName } from "@/features/appointments/utils/professionals";
import { useAuthStore } from "@/store/auth.store";
import { PERMISSIONS } from "@/shared/config/permissions";

interface MedicalRecordDetailDialogProps {
  open: boolean;
  recordId: string;
  onClose: () => void;
  onChanged: () => void;
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
        {label}
      </Typography>
      <Typography variant="body2" color="text.primary" sx={{ whiteSpace: "pre-wrap" }}>
        {value}
      </Typography>
    </Box>
  );
}

function VitalField({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  if (value == null) return null;
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        px: 1.5,
        py: 1,
        textAlign: "center",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main", lineHeight: 1.3 }}>
        {value} <Typography component="span" variant="caption" color="text.secondary">{unit}</Typography>
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
  );
}

export default function MedicalRecordDetailDialog({
  open,
  recordId,
  onClose,
  onChanged,
}: MedicalRecordDetailDialogProps) {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canUpdate = hasPermission(PERMISSIONS.MEDICAL_RECORDS.UPDATE);

  const [record, setRecord] = useState<MedicalRecordResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estado del formulario de subida de documentos
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("otro");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);

  const loadRecord = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await MedicalRecordsService.getMedicalRecordById(recordId);
      setRecord(data);
    } catch (error: unknown) {
      console.error("Error loading medical record:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(err.response?.data?.message || err.message || "Error al cargar el registro.");
    } finally {
      setLoading(false);
    }
  }, [recordId]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    MedicalRecordsService.getMedicalRecordById(recordId)
      .then((data) => {
        if (!cancelled) {
          setRecord(data);
          setErrorMessage(null);
        }
      })
      .catch((error: unknown) => {
        console.error("Error loading medical record:", error);
        const err = error as { response?: { data?: { message?: string } }; message?: string };
        if (!cancelled) {
          setErrorMessage(err.response?.data?.message || err.message || "Error al cargar el registro.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, recordId]);

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Selecciona un archivo para adjuntar.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      await MedicalRecordsService.uploadDocument(recordId, selectedFile, documentType, description);
      setSelectedFile(null);
      setDescription("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadRecord();
      onChanged();
    } catch (error: unknown) {
      console.error("Error uploading document:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setUploadError(err.response?.data?.message || err.message || "Error al subir el documento.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    setDeletingDocumentId(documentId);
    setUploadError(null);
    try {
      await MedicalRecordsService.deleteDocument(recordId, documentId);
      await loadRecord();
      onChanged();
    } catch (error: unknown) {
      console.error("Error deleting document:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setUploadError(err.response?.data?.message || err.message || "Error al eliminar el documento.");
    } finally {
      setDeletingDocumentId(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Detalle del Registro Médico</DialogTitle>
      <DialogContent sx={{ pt: 1.5, pb: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {!loading && record && (
          <>
            {/* Encabezado: paciente + tipo + estado */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {record.pet?.name ?? "Paciente"}{" "}
                  <Typography component="span" variant="body2" color="text.secondary">
                    ({record.pet?.species ?? ""})
                  </Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dueño: {record.pet?.owner?.fullName ?? "-"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                  {dayjs(record.recordDate).format("dddd, D [de] MMMM [de] YYYY — HH:mm")}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <RecordTypeChip type={record.recordType} />
                <RecordStatusChip status={record.status} />
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Veterinario:</strong>{" "}
                {getUserDisplayName(record.veterinarian?.user, "Veterinario")}
              </Typography>
              {record.followUpDate && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Seguimiento:</strong> {dayjs(record.followUpDate).format("DD/MM/YYYY")}
                </Typography>
              )}
            </Box>

            {/* Signos vitales */}
            {(record.weight != null ||
              record.temperature != null ||
              record.heartRate != null ||
              record.respiratoryRate != null) && (
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 1.5 }}>
                <VitalField label="Peso" value={record.weight} unit="kg" />
                <VitalField label="Temperatura" value={record.temperature} unit="°C" />
                <VitalField label="FC" value={record.heartRate} unit="lpm" />
                <VitalField label="FR" value={record.respiratoryRate} unit="rpm" />
              </Box>
            )}

            <Divider />

            {/* Datos clínicos */}
            <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
              Datos clínicos
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <InfoField label="Motivo de la visita" value={record.reason} />
              <InfoField label="Síntomas" value={record.symptoms} />
              <InfoField label="Diagnóstico" value={record.diagnosis} />
              <InfoField label="Tratamiento indicado" value={record.treatment} />
              <InfoField label="Observaciones" value={record.observations} />
              {!record.reason && !record.symptoms && !record.diagnosis && !record.treatment && !record.observations && (
                <Typography variant="body2" color="text.secondary">
                  Sin datos clínicos registrados.
                </Typography>
              )}
            </Box>

            <Divider />

            {/* Prescripciones */}
            <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
              Prescripciones ({record.prescriptions.length})
            </Typography>
            {record.prescriptions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Sin prescripciones registradas.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {record.prescriptions.map((p) => (
                  <Box
                    key={p.id}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      p: 1.5,
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {p.medicationName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {p.dosage} — {p.frequency} — {p.durationDays} día(s)
                    </Typography>
                    {p.instructions && (
                      <Typography variant="body2" color="text.secondary">
                        Indicaciones: {p.instructions}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            )}

            <Divider />

            {/* Documentos */}
            <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
              Documentos adjuntos ({record.documents.length})
            </Typography>
            {record.documents.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Sin documentos adjuntos.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {record.documents.map((doc) => (
                  <Box
                    key={doc.id}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      p: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <DescriptionRoundedIcon color="action" />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {DOCUMENT_TYPE_LABELS[doc.documentType as DocumentType] ?? doc.documentType} —{" "}
                        {doc.fileName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doc.description ? `${doc.description} · ` : ""}
                        Subido el {dayjs(doc.uploadedAt).format("DD/MM/YYYY HH:mm")}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      component={Link}
                      href={doc.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                      Ver
                    </Button>
                    {canUpdate && (
                      <Tooltip title="Eliminar documento">
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={deletingDocumentId === doc.id}
                            onClick={() => void handleDeleteDocument(doc.id)}
                          >
                            {deletingDocumentId === doc.id ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <DeleteRoundedIcon fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </Box>
                ))}
              </Box>
            )}

            {/* Subida de documentos */}
            {canUpdate && (
              <Box
                sx={{
                  border: "1px dashed",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Adjuntar documento
                </Typography>
                {uploadError && <Alert severity="error">{uploadError}</Alert>}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 1.5,
                  }}
                >
                  <TextField
                    select
                    label="Tipo de documento"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    disabled={uploading}
                    size="small"
                  >
                    {DOCUMENT_TYPES.map((t) => (
                      <MenuItem key={t} value={t}>
                        {DOCUMENT_TYPE_LABELS[t]}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Descripción (opcional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={uploading}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    disabled={uploading}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    {selectedFile ? selectedFile.name : "Elegir archivo"}
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : <UploadFileRoundedIcon />}
                    disabled={uploading || !selectedFile}
                    onClick={() => void handleUpload()}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Subir
                  </Button>
                </Box>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: "8px", textTransform: "none" }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
