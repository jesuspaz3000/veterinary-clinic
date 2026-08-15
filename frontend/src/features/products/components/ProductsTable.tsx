"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  TextField,
  InputAdornment,
  MenuItem,
  Button,
  FormControlLabel,
  Switch,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";

import CustomTable, { Column } from "@/shared/components/CustomTable";
import ImagePreviewDialog from "@/shared/components/ImagePreviewDialog";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { ProductResponse } from "../types/productTypes";
import CreateProductDialog from "./CreateProductDialog";
import EditProductDialog from "./EditProductDialog";
import DeleteProductDialog from "./DeleteProductDialog";
import ManageCategoriesDialog from "./ManageCategoriesDialog";

export default function ProductsTable() {
  const { products, loading, fetchProducts, error } = useProducts();
  const { categories } = useCategories();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLowStockOnly, setIsLowStockOnly] = useState(false);

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);

  // Image Preview
  const [previewImage, setPreviewImage] = useState<{ src: string; title: string } | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      void fetchProducts({
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        search: search.trim() || undefined,
        categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
        isLowStock: isLowStockOnly || undefined,
      });
    }, 300);

    return () => clearTimeout(handler);
  }, [page, rowsPerPage, search, selectedCategory, isLowStockOnly, fetchProducts]);

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

  const refreshData = () => {
    void fetchProducts({
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      search: search.trim() || undefined,
      categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
      isLowStock: isLowStockOnly || undefined,
    });
  };

  const columns: Column<ProductResponse>[] = [
    {
      id: "index",
      label: "Nº",
      minWidth: 60,
      render: (_row, index) => page * rowsPerPage + index + 1,
    },
    {
      id: "product",
      label: "Producto / Medicamento",
      minWidth: 240,
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Tooltip title={row.imageUrl ? "Hacer clic para ampliar foto" : ""} arrow>
            <Avatar
              src={row.imageUrl || undefined}
              variant="rounded"
              onClick={() => {
                if (row.imageUrl) {
                  setPreviewImage({
                    src: row.imageUrl,
                    title: `Producto: ${row.name}`,
                  });
                }
              }}
              sx={{
                width: 38,
                height: 38,
                bgcolor: row.imageUrl ? "transparent" : "primary.main",
                fontWeight: 700,
                fontSize: "1.1rem",
                cursor: row.imageUrl ? "pointer" : "default",
                transition: "transform 0.15s ease",
                "&:hover": row.imageUrl ? { transform: "scale(1.1)" } : {},
              }}
            >
              {!row.imageUrl && (row.name?.charAt(0) || "P").toUpperCase()}
            </Avatar>
          </Tooltip>

          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
              {row.name}
            </Typography>
            {row.activeIngredient && (
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                P. Activo: {row.activeIngredient}
              </Typography>
            )}
            <Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
              {row.requiresPrescription && (
                <Chip
                  icon={<MedicalServicesIcon sx={{ fontSize: "0.8rem !important" }} />}
                  label="Receta Requerida"
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700 }}
                />
              )}
              {row.allowsFractioning && (
                <Chip
                  icon={<LocalPharmacyIcon sx={{ fontSize: "0.8rem !important" }} />}
                  label="Fraccionable"
                  size="small"
                  color="info"
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.65rem", fontWeight: 600 }}
                />
              )}
            </Box>
          </Box>
        </Box>
      ),
    },
    {
      id: "category",
      label: "Categoría y Marca",
      minWidth: 160,
      render: (row) => (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Chip
            label={row.category?.name || "Sin categoría"}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600, width: "fit-content" }}
          />
          {row.brand && (
            <Typography variant="caption" color="text.secondary">
              Marca: {row.brand.name}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: "variants",
      label: "Presentaciones y Precios",
      minWidth: 180,
      render: (row) => {
        const variantCount = row.variants?.length || 0;
        if (variantCount === 0) return "-";

        const prices = row.variants.map((v) => v.salePrice);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        const priceText =
          minPrice === maxPrice
            ? `S/. ${minPrice.toFixed(2)}`
            : `S/. ${minPrice.toFixed(2)} - S/. ${maxPrice.toFixed(2)}`;

        return (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: "success.main" }}>
              {priceText}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {variantCount} {variantCount === 1 ? "presentación" : "presentaciones"}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: "totalStock",
      label: "Stock Total",
      minWidth: 130,
      render: (row) => {
        const hasLowStock = row.variants?.some((v) => v.stock <= v.minStock);

        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Chip
              label={`${row.totalStock} unid.`}
              size="small"
              color={hasLowStock ? "warning" : "default"}
              sx={{ fontWeight: 700, borderRadius: "6px" }}
            />
            {hasLowStock && (
              <Tooltip title="Uno o más presentaciones con stock bajo">
                <WarningAmberIcon color="warning" fontSize="small" />
              </Tooltip>
            )}
          </Box>
        );
      },
    },
    {
      id: "targetSpecies",
      label: "Especie Destino",
      minWidth: 130,
      render: (row) => (
        <Chip
          label={row.targetSpecies || "Todas"}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600, borderRadius: "6px" }}
        />
      ),
    },
    {
      id: "actions",
      label: "Acciones",
      minWidth: 110,
      align: "center",
      render: (row) => (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          <Tooltip title="Editar Producto">
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setSelectedProduct(row);
                setEditOpen(true);
              }}
              sx={{ bgcolor: "action.hover" }}
            >
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar Producto">
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                setSelectedProduct(row);
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
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <TextField
            placeholder="Buscar producto..."
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
              flex: "1 1 auto",
              maxWidth: { sm: 600 },
              "& .MuiOutlinedInput-root": { bgcolor: "background.paper" },
            }}
          />
          <Tooltip title="Nuevo Producto">
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
            Nuevo Producto
          </Button>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            select
            size="small"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(0);
            }}
            sx={{ width: { xs: "100%", sm: 200 } }}
            label="Categoría"
          >
            <MenuItem value="all">Todas las categorías</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>

          <FormControlLabel
            control={
              <Switch
                checked={isLowStockOnly}
                onChange={(e) => {
                  setIsLowStockOnly(e.target.checked);
                  setPage(0);
                }}
                color="warning"
                size="small"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Solo Stock Bajo
              </Typography>
            }
            sx={{ ml: 0, mr: 0 }}
          />

          <Button
            variant="outlined"
            startIcon={<CategoryRoundedIcon />}
            onClick={() => setManageCategoriesOpen(true)}
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
          >
            Categorías
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <CustomTable<ProductResponse>
        columns={columns}
        data={products?.results || []}
        loading={loading}
        error={error}
        page={page}
        rowsPerPage={rowsPerPage}
        totalElements={products?.count || 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="No se encontraron productos registrados."
      />

      {/* Modals */}
      {createOpen && (
        <CreateProductDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSuccess={refreshData}
        />
      )}

      {editOpen && selectedProduct && (
        <EditProductDialog
          key={selectedProduct.id}
          open={editOpen}
          product={selectedProduct}
          onClose={() => {
            setEditOpen(false);
            setSelectedProduct(null);
          }}
          onSuccess={refreshData}
        />
      )}

      {deleteOpen && selectedProduct && (
        <DeleteProductDialog
          open={deleteOpen}
          product={selectedProduct}
          onClose={() => {
            setDeleteOpen(false);
            setSelectedProduct(null);
          }}
          onSuccess={refreshData}
        />
      )}

      <ManageCategoriesDialog
        open={manageCategoriesOpen}
        onClose={() => setManageCategoriesOpen(false)}
        onCategoryChange={refreshData}
      />

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
