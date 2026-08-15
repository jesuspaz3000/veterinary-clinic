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
  Typography,
  IconButton,
  Tooltip,
  TextField,
  Paper,
  Avatar,
  Divider,
} from "@mui/material";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PhotoLibraryRoundedIcon from "@mui/icons-material/PhotoLibraryRounded";
import PetsIcon from "@mui/icons-material/Pets";
import ImagePreviewDialog from "@/shared/components/ImagePreviewDialog";
import { PetService } from "../service/pets.service";
import { PetPhotoResponse, PetResponse } from "../type/petsTypes";
import { useAuthStore } from "@/store/auth.store";
import { PERMISSIONS } from "@/shared/config/permissions";

interface PetPhotosDialogProps {
  open: boolean;
  petId: string;
  onClose: () => void;
  onChanged: () => void;
}

function ZoomableThumb({
  src,
  alt,
  size = 88,
  radius = 2,
  onZoom,
}: {
  src: string;
  alt: string;
  size?: number;
  radius?: number;
  onZoom: () => void;
}) {
  return (
    <Tooltip title="Hacer clic para ampliar" arrow>
      <Box
        onClick={onZoom}
        sx={{
          position: "relative",
          width: size,
          height: size,
          flexShrink: 0,
          borderRadius: radius,
          overflow: "hidden",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          "&:hover .zoom-overlay": { opacity: 1 },
          "&:hover img": { transform: "scale(1.06)" },
        }}
      >
        <Box
          component="img"
          src={src}
          alt={alt}
          sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.2s ease" }}
        />
        <Box
          className="zoom-overlay"
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            opacity: 0,
            transition: "opacity 0.2s ease",
          }}
        >
          <ZoomInIcon fontSize="small" />
        </Box>
      </Box>
    </Tooltip>
  );
}

export default function PetPhotosDialog({ open, petId, onClose, onChanged }: PetPhotosDialogProps) {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canUpdate = hasPermission(PERMISSIONS.PETS.UPDATE);

  const [pet, setPet] = useState<PetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);

  const loadPet = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await PetService.getPetById(petId);
      setPet(data);
    } catch (error: unknown) {
      console.error("Error loading pet:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(err.response?.data?.message || err.message || "Error al cargar la mascota.");
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    PetService.getPetById(petId)
      .then((data) => {
        if (!cancelled) {
          setPet(data);
          setErrorMessage(null);
        }
      })
      .catch((error: unknown) => {
        console.error("Error loading pet:", error);
        const err = error as { response?: { data?: { message?: string } }; message?: string };
        if (!cancelled) {
          setErrorMessage(err.response?.data?.message || err.message || "Error al cargar la mascota.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, petId]);

  useEffect(() => {
    return () => {
      if (selectedFilePreview) URL.revokeObjectURL(selectedFilePreview);
    };
  }, [selectedFilePreview]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedFilePreview(URL.createObjectURL(file));
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (selectedFilePreview) URL.revokeObjectURL(selectedFilePreview);
    setSelectedFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Selecciona una foto para subir.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      await PetService.addPetPhoto(petId, selectedFile, description);
      clearSelectedFile();
      setDescription("");
      await loadPet();
      onChanged();
    } catch (error: unknown) {
      console.error("Error uploading pet photo:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setUploadError(err.response?.data?.message || err.message || "Error al subir la foto.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photo: PetPhotoResponse) => {
    setDeletingPhotoId(photo.id);
    setUploadError(null);
    try {
      await PetService.deletePetPhoto(petId, photo.id);
      await loadPet();
      onChanged();
    } catch (error: unknown) {
      console.error("Error deleting pet photo:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setUploadError(err.response?.data?.message || err.message || "Error al eliminar la foto.");
    } finally {
      setDeletingPhotoId(null);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Galería de Fotos</DialogTitle>
        <IconButton
          aria-label="Cerrar"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
            color: "text.secondary",
          }}
        >
          <CloseRoundedIcon />
        </IconButton>
        <DialogContent sx={{ pt: 1.5, pb: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          {!loading && pet && (
            <>
              {/* Encabezado: foto de perfil + datos de la mascota */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  borderRadius: "16px",
                  bgcolor: "background.default",
                  borderColor: "divider",
                }}
              >
                {pet.photoUrl ? (
                  <ZoomableThumb
                    src={pet.photoUrl}
                    alt={pet.name}
                    size={72}
                    radius={3}
                    onZoom={() => setZoomSrc(pet.photoUrl)}
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: 3,
                      bgcolor: "primary.main",
                    }}
                  >
                    <PetsIcon />
                  </Avatar>
                )}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {pet.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pet.species}
                    {pet.breed ? ` · ${pet.breed}` : ""}
                  </Typography>
                </Box>
              </Paper>

              <Divider />

              {/* Fotos adicionales */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PhotoLibraryRoundedIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
                  Fotos adicionales ({pet.photos.length})
                </Typography>
              </Box>

              {pet.photos.length === 0 ? (
                <Box
                  sx={{
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: "16px",
                    py: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    color: "text.secondary",
                  }}
                >
                  <PhotoLibraryRoundedIcon sx={{ fontSize: 32, opacity: 0.5 }} />
                  <Typography variant="body2">Sin fotos adicionales registradas.</Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                    gap: 2,
                  }}
                >
                  {pet.photos.map((photo) => (
                    <Paper
                      key={photo.id}
                      variant="outlined"
                      sx={{
                        position: "relative",
                        borderRadius: "12px",
                        overflow: "hidden",
                        borderColor: "divider",
                        transition: "box-shadow 0.2s ease",
                        "&:hover": { boxShadow: "0 4px 14px rgba(0,0,0,0.15)" },
                      }}
                    >
                      <Box
                        onClick={() => setZoomSrc(photo.photoUrl)}
                        sx={{
                          position: "relative",
                          cursor: "pointer",
                          "&:hover .zoom-overlay": { opacity: 1 },
                        }}
                      >
                        <Box
                          component="img"
                          src={photo.photoUrl}
                          alt={photo.description || "Foto de la mascota"}
                          sx={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", display: "block" }}
                        />
                        <Box
                          className="zoom-overlay"
                          sx={{
                            position: "absolute",
                            inset: 0,
                            bgcolor: "rgba(0, 0, 0, 0.4)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            opacity: 0,
                            transition: "opacity 0.2s ease",
                          }}
                        >
                          <ZoomInIcon />
                        </Box>
                      </Box>

                      {canUpdate && (
                        <Tooltip title="Eliminar foto">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={deletingPhotoId === photo.id}
                              onClick={() => void handleDeletePhoto(photo)}
                              sx={{
                                position: "absolute",
                                top: 6,
                                right: 6,
                                bgcolor: "rgba(255,255,255,0.85)",
                                "&:hover": { bgcolor: "rgba(255,255,255,0.95)" },
                              }}
                            >
                              {deletingPhotoId === photo.id ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : (
                                <DeleteRoundedIcon fontSize="small" />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}

                      <Box sx={{ p: 1.25 }}>
                        {photo.description && (
                          <Typography
                            variant="caption"
                            color="text.primary"
                            sx={{
                              display: "block",
                              fontWeight: 600,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {photo.description}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(photo.uploadedAt).format("DD/MM/YYYY")}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}

              {/* Subida de foto */}
              {canUpdate && (
                <>
                  <Divider />
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: "16px",
                      bgcolor: "background.default",
                      borderColor: "divider",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Agregar foto
                    </Typography>
                    {uploadError && <Alert severity="error">{uploadError}</Alert>}

                    <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                      {selectedFilePreview ? (
                        <ZoomableThumb
                          src={selectedFilePreview}
                          alt="Vista previa"
                          onZoom={() => setZoomSrc(selectedFilePreview)}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 88,
                            height: 88,
                            flexShrink: 0,
                            borderRadius: 2,
                            border: "1px dashed",
                            borderColor: "divider",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "text.disabled",
                          }}
                        >
                          <PetsIcon />
                        </Box>
                      )}

                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flexGrow: 1, minWidth: 220 }}>
                        <TextField
                          label="Descripción (opcional)"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          disabled={uploading}
                          size="small"
                          fullWidth
                        />
                        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            hidden
                            disabled={uploading}
                            onChange={handleFileChange}
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            disabled={uploading}
                            onClick={() => fileInputRef.current?.click()}
                            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
                          >
                            {selectedFile ? "Cambiar foto" : "Elegir foto"}
                          </Button>
                          {selectedFile && (
                            <Button
                              variant="text"
                              color="error"
                              size="small"
                              disabled={uploading}
                              onClick={clearSelectedFile}
                              sx={{ textTransform: "none" }}
                            >
                              Quitar
                            </Button>
                          )}
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : <UploadFileRoundedIcon />}
                            disabled={uploading || !selectedFile}
                            onClick={() => void handleUpload()}
                            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, ml: "auto" }}
                          >
                            Subir
                          </Button>
                        </Box>
                        {selectedFile && (
                          <Typography variant="caption" color="text.secondary" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {selectedFile.name}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </>
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

      <ImagePreviewDialog
        open={Boolean(zoomSrc)}
        src={zoomSrc}
        title={pet ? `Mascota: ${pet.name}` : undefined}
        onClose={() => setZoomSrc(null)}
      />
    </>
  );
}
