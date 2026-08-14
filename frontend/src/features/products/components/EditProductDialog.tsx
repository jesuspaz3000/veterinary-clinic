"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  Autocomplete,
  Divider,
  IconButton,
  Tooltip,
  Paper,
  FormControlLabel,
  Checkbox,
  Chip,
  MenuItem,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import ImagePreviewDialog from "@/shared/components/ImagePreviewDialog";
import NumberInput from "@/shared/components/NumberInput";
import { ProductsService } from "../service/products.service";
import { CategoriesService } from "../service/categories.service";
import { BrandsService } from "../service/brands.service";
import {
  ProductResponse,
  CategoryResponse,
  BrandResponse,
  UpdateProductRequest,
  CreateProductVariantRequest,
  ADMINISTRATION_ROUTES,
} from "../types/productTypes";
import ManageCategoriesDialog from "./ManageCategoriesDialog";
import ManageBrandsDialog from "./ManageBrandsDialog";

interface EditProductDialogProps {
  open: boolean;
  product: ProductResponse;
  onClose: () => void;
  onSuccess: () => void;
}

const UNIT_MEASURES = ["Unidad", "Kg", "Gramos", "mL", "Litro", "Tableta", "Frasco", "Caja", "Ampolla", "Pipeta"];
import { PRODUCT_TARGET_SPECIES_OPTIONS } from "@/shared/constants/species";

const TARGET_SPECIES_OPTIONS = PRODUCT_TARGET_SPECIES_OPTIONS;

export default function EditProductDialog({
  open,
  product,
  onClose,
  onSuccess,
}: EditProductDialogProps) {
  // Catalogs
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [manageBrandsOpen, setManageBrandsOpen] = useState(false);

  // Form state
  const [name, setName] = useState(product.name || "");
  const [activeIngredient, setActiveIngredient] = useState(product.activeIngredient || "");
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(product.category || null);
  const [selectedBrand, setSelectedBrand] = useState<BrandResponse | null>(product.brand || null);
  const [targetSpecies, setTargetSpecies] = useState(product.targetSpecies || "Todas");
  const [description, setDescription] = useState(product.description || "");
  const [requiresPrescription, setRequiresPrescription] = useState(product.requiresPrescription || false);
  const [allowsFractioning, setAllowsFractioning] = useState(product.allowsFractioning || false);

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product.imageUrl || null);
  const [removeImage, setRemoveImage] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  // Variants state
  const [variants, setVariants] = useState<CreateProductVariantRequest[]>(
    product.variants && product.variants.length > 0
      ? product.variants.map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku || "",
        barcode: v.barcode || "",
        salePrice: v.salePrice,
        costPrice: v.costPrice,
        stock: v.stock,
        minStock: v.minStock,
        unitMeasure: v.unitMeasure || "Unidad",
        administrationRoute: v.administrationRoute || "oral",
        weightOrVolume: v.weightOrVolume,
      }))
      : [
        {
          name: "Estándar / Unidad",
          sku: "",
          barcode: "",
          salePrice: 0,
          costPrice: 0,
          stock: 0,
          minStock: 5,
          unitMeasure: "Unidad",
          administrationRoute: "oral",
          weightOrVolume: null,
        },
      ]
  );

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let isMounted = true;
    const fetchCatalogs = async () => {
      try {
        const [catData, brandData] = await Promise.all([
          CategoriesService.getAllCategories(),
          BrandsService.getAllBrands(),
        ]);
        if (isMounted) {
          setCategories(catData || []);
          setBrands(brandData || []);
        }
      } catch (err) {
        console.error("Error loading catalogs for edit product:", err);
      }
    };
    void fetchCatalogs();
    return () => {
      isMounted = false;
    };
  }, [open]);

  const loadCatalogs = async () => {
    try {
      const [catData, brandData] = await Promise.all([
        CategoriesService.getAllCategories(),
        BrandsService.getAllBrands(),
      ]);
      setCategories(catData || []);
      setBrands(brandData || []);
    } catch (err) {
      console.error("Error loading catalogs:", err);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setRemoveImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    setRemoveImage(true);
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        name: `Presentación ${prev.length + 1}`,
        sku: "",
        barcode: "",
        salePrice: 0,
        costPrice: 0,
        stock: 0,
        minStock: 5,
        unitMeasure: "Unidad",
        administrationRoute: "oral",
        weightOrVolume: null,
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof CreateProductVariantRequest, value: unknown) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim() || !selectedCategory) {
      setErrorMessage("Por favor, ingresa el nombre del producto y selecciona una categoría.");
      return;
    }

    if (variants.length === 0) {
      setErrorMessage("Debe incluir al menos una presentación o variante para el producto.");
      return;
    }

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.name.trim()) {
        setErrorMessage(`Ingresa un nombre para la presentación #${i + 1}.`);
        return;
      }
      if (v.salePrice === undefined || v.salePrice === null || v.salePrice < 0) {
        setErrorMessage(`Ingresa un precio de venta válido para "${v.name}".`);
        return;
      }
    }

    setSaving(true);
    setErrorMessage(null);

    const dto: UpdateProductRequest = {
      categoryId: selectedCategory.id,
      brandId: selectedBrand?.id || null,
      name: name.trim(),
      activeIngredient: activeIngredient.trim() || null,
      targetSpecies: targetSpecies.trim() || null,
      description: description.trim() || null,
      requiresPrescription,
      allowsFractioning,
      image,
      removeImage: removeImage || undefined,
      variants,
    };

    try {
      await ProductsService.updateProduct(product.id, dto);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error updating product:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const apiErrorMsg =
        err.response?.data?.message || err.message || "Error inesperado al actualizar el producto.";
      setErrorMessage(apiErrorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Editar Producto de Inventario / Farmacia</DialogTitle>
        <form noValidate onSubmit={(e) => void handleSubmit(e)}>
          <DialogContent sx={{ pt: 1.5, pb: 3 }}>
            {errorMessage && <Alert severity="error" sx={{ mb: 2.5 }}>{errorMessage}</Alert>}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "220px 1fr" },
                gap: 3,
                alignItems: "start",
              }}
            >
              {/* LEFT COLUMN: Image Frame Card */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: 2,
                  borderRadius: "16px",
                  bgcolor: "background.default",
                  borderColor: "divider",
                }}
              >
                <Tooltip title={imagePreview ? "Hacer clic para maximizar la foto" : ""} arrow placement="top">
                  <Box
                    onClick={() => imagePreview && setZoomOpen(true)}
                    sx={{
                      position: "relative",
                      cursor: imagePreview ? "pointer" : "default",
                      borderRadius: "12px",
                      overflow: "hidden",
                      width: 140,
                      height: 140,
                      "&:hover .zoom-overlay": {
                        opacity: imagePreview ? 1 : 0,
                      },
                    }}
                  >
                    <Avatar
                      src={imagePreview || undefined}
                      variant="rounded"
                      sx={{
                        width: "100%",
                        height: "100%",
                        bgcolor: imagePreview ? "transparent" : "primary.main",
                        fontSize: "3rem",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                      }}
                    >
                      {!imagePreview && ((name?.charAt(0) || "P").toUpperCase())}
                    </Avatar>
                    {imagePreview && (
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
                        <ZoomInIcon sx={{ fontSize: 36 }} />
                      </Box>
                    )}
                  </Box>
                </Tooltip>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}>
                  <Button
                    variant="outlined"
                    component="label"
                    size="small"
                    startIcon={<CloudUploadIcon />}
                    disabled={saving}
                    fullWidth
                    sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
                  >
                    {imagePreview ? "Cambiar foto" : "Subir foto"}
                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                  </Button>

                  {imagePreview && (
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={handleRemoveImage}
                      disabled={saving}
                      fullWidth
                      sx={{ borderRadius: "8px", textTransform: "none" }}
                    >
                      Quitar foto
                    </Button>
                  )}
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                  JPG, PNG. Máximo 5MB.
                </Typography>
              </Paper>

              {/* RIGHT COLUMN: Form Controls */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {/* Section 1: General Info */}
                <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
                  Información Básica del Producto
                </Typography>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <TextField
                    label="Nombre del Producto *"
                    placeholder="Ej. Meloxivet 0.5mg / Royal Canin Medium Adult"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={saving}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Principio Activo (Farmacia)"
                    placeholder="Ej. Meloxicam, Amoxicilina"
                    value={activeIngredient}
                    onChange={(e) => setActiveIngredient(e.target.value)}
                    disabled={saving}
                    fullWidth
                  />
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                    <Autocomplete
                      options={categories}
                      value={selectedCategory}
                      onChange={(_e, newValue) => setSelectedCategory(newValue)}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      disabled={saving}
                      fullWidth
                      renderInput={(params) => (
                        <TextField {...params} label="Categoría *" placeholder="Medicamentos, Alimentos..." required />
                      )}
                    />
                    <Tooltip title="Gestionar categorías">
                      <IconButton color="primary" onClick={() => setManageCategoriesOpen(true)} disabled={saving}>
                        <SettingsRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                    <Autocomplete
                      options={brands}
                      value={selectedBrand}
                      onChange={(_e, newValue) => setSelectedBrand(newValue)}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      disabled={saving}
                      fullWidth
                      renderInput={(params) => (
                        <TextField {...params} label="Marca / Laboratorio" placeholder="Royal Canin, Zoetis..." />
                      )}
                    />
                    <Tooltip title="Gestionar marcas">
                      <IconButton color="primary" onClick={() => setManageBrandsOpen(true)} disabled={saving}>
                        <SettingsRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <TextField
                    select
                    label="Especie Destino"
                    value={targetSpecies}
                    onChange={(e) => setTargetSpecies(e.target.value)}
                    disabled={saving}
                    fullWidth
                  >
                    {TARGET_SPECIES_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, pt: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={requiresPrescription}
                          onChange={(e) => setRequiresPrescription(e.target.checked)}
                          disabled={saving}
                          color="warning"
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Requiere Receta Médica
                        </Typography>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={allowsFractioning}
                          onChange={(e) => setAllowsFractioning(e.target.checked)}
                          disabled={saving}
                          color="info"
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Permite Fraccionamiento (mL/Pastillas)
                        </Typography>
                      }
                    />
                  </Box>
                </Box>

                <TextField
                  label="Descripción / Indicaciones"
                  placeholder="Detalles de administración, indicaciones o especificaciones..."
                  multiline
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={saving}
                  fullWidth
                />

                <Divider sx={{ my: 1 }} />

                {/* Section 2: Presentaciones / Variantes */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
                    Presentaciones / Variantes del Producto ({variants.length})
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddRoundedIcon />}
                    onClick={handleAddVariant}
                    disabled={saving}
                    sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
                  >
                    Agregar Presentación
                  </Button>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {variants.map((variant, index) => (
                    <Paper
                      key={index}
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: "12px",
                        bgcolor: "background.default",
                        borderColor: "divider",
                        position: "relative",
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                        <Chip
                          label={`Presentación #${index + 1}`}
                          size="small"
                          color="primary"
                          variant="filled"
                          sx={{ fontWeight: 700, borderRadius: "6px" }}
                        />
                        {variants.length > 1 && (
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleRemoveVariant(index)}
                            disabled={saving}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>

                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2, mb: 1.5 }}>
                        <TextField
                          label="Nombre de variante *"
                          placeholder="Ej. Bolsa 3 kg, Frasco 100ml, 5-10 kg"
                          size="small"
                          value={variant.name}
                          onChange={(e) => handleVariantChange(index, "name", e.target.value)}
                          disabled={saving}
                          fullWidth
                          required
                        />
                        <TextField
                          label="SKU (opcional)"
                          placeholder="Ej. PRO-RC-3KG"
                          size="small"
                          value={variant.sku || ""}
                          onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                          disabled={saving}
                          fullWidth
                        />
                        <TextField
                          label="Código de Barras (EAN/UPC)"
                          placeholder="Ej. 7751234567890"
                          size="small"
                          value={variant.barcode || ""}
                          onChange={(e) => handleVariantChange(index, "barcode", e.target.value)}
                          disabled={saving}
                          fullWidth
                        />
                      </Box>

                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr 1fr" }, gap: 2 }}>
                        <NumberInput
                          label="Precio Venta (S/.) *"
                          placeholder="0.00"
                          size="small"
                          value={variant.salePrice}
                          onChange={(val) => handleVariantChange(index, "salePrice", val || 0)}
                          min={0}
                          step={0.1}
                          disabled={saving}
                          fullWidth
                        />
                        <NumberInput
                          label="Precio Costo (S/.) *"
                          placeholder="0.00"
                          size="small"
                          value={variant.costPrice}
                          onChange={(val) => handleVariantChange(index, "costPrice", val || 0)}
                          min={0}
                          step={0.1}
                          disabled={saving}
                          fullWidth
                        />
                        <NumberInput
                          label="Stock Actual *"
                          placeholder="0"
                          size="small"
                          value={variant.stock}
                          onChange={(val) => handleVariantChange(index, "stock", val || 0)}
                          min={0}
                          step={1}
                          disabled={saving}
                          fullWidth
                        />
                        <TextField
                          select
                          label="Unidad Medida *"
                          size="small"
                          value={variant.unitMeasure}
                          onChange={(e) => handleVariantChange(index, "unitMeasure", e.target.value)}
                          disabled={saving}
                          fullWidth
                        >
                          {UNIT_MEASURES.map((u) => (
                            <MenuItem key={u} value={u}>
                              {u}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          select
                          label="Vía de Administración *"
                          size="small"
                          value={variant.administrationRoute}
                          onChange={(e) => handleVariantChange(index, "administrationRoute", e.target.value)}
                          disabled={saving}
                          fullWidth
                        >
                          {ADMINISTRATION_ROUTES.map((r) => (
                            <MenuItem key={r.value} value={r.value}>
                              {r.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={onClose} disabled={saving} variant="outlined" sx={{ borderRadius: "8px", textTransform: "none" }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              variant="contained"
              sx={{ borderRadius: "8px", textTransform: "none", minWidth: 130 }}
            >
              {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar Cambios"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Catalog Modals */}
      <ManageCategoriesDialog
        open={manageCategoriesOpen}
        onClose={() => setManageCategoriesOpen(false)}
        onCategoryChange={() => void loadCatalogs()}
      />

      <ManageBrandsDialog
        open={manageBrandsOpen}
        onClose={() => setManageBrandsOpen(false)}
        onBrandChange={() => void loadCatalogs()}
      />

      {/* Image Preview Lightbox */}
      <ImagePreviewDialog
        open={zoomOpen}
        src={imagePreview}
        title={name ? `Producto: ${name}` : "Foto de producto"}
        onClose={() => setZoomOpen(false)}
      />
    </>
  );
}
