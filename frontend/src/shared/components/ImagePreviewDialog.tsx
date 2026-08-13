"use client";

import { Dialog, IconButton, Box, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface ImagePreviewDialogProps {
  open: boolean;
  src: string | null;
  title?: string;
  onClose: () => void;
}

export default function ImagePreviewDialog({
  open,
  src,
  title,
  onClose,
}: ImagePreviewDialogProps) {
  if (!src) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      slotProps={{
        backdrop: {
          sx: { backdropFilter: "blur(6px)", bgcolor: "rgba(0, 0, 0, 0.85)" },
        },
        paper: {
          sx: {
            bgcolor: "transparent",
            boxShadow: "none",
            overflow: "visible",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          },
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 1,
          maxWidth: "100%",
        }}
      >
        {/* Close Button floating top-right */}
        <IconButton
          onClick={onClose}
          aria-label="Cerrar vista previa"
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            bgcolor: "rgba(0, 0, 0, 0.65)",
            color: "#ffffff",
            backdropFilter: "blur(4px)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
            "&:hover": {
              bgcolor: "rgba(0, 0, 0, 0.85)",
            },
            zIndex: 10,
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Maximized Image */}
        <Box
          component="img"
          src={src}
          alt={title || "Vista previa"}
          sx={{
            maxHeight: "75vh",
            maxWidth: "90vw",
            borderRadius: "16px",
            objectFit: "contain",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        />

        {/* Optional Title Caption */}
        {title && (
          <Typography
            variant="subtitle1"
            sx={{
              mt: 1.5,
              color: "#fff",
              fontWeight: 600,
              textAlign: "center",
              textShadow: "0 2px 4px rgba(0,0,0,0.8)",
            }}
          >
            {title}
          </Typography>
        )}
      </Box>
    </Dialog>
  );
}
