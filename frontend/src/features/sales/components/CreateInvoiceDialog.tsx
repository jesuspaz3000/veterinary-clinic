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
  Autocomplete,
  Divider,
  IconButton,
  Paper,
  Chip,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import NumberInput from "@/shared/components/NumberInput";
import { OwnerService } from "@/features/owners/service/owners.service";
import { OwnerResponse } from "@/features/owners/type/ownersTypes";
import { ProductsService } from "@/features/products/service/products.service";
import { ProductResponse, ProductVariantResponse } from "@/features/products/types/productTypes";
import { SalesService } from "../service/sales.service";
import { CreateInvoiceRequest, CreateInvoiceItemRequest, CreateInvoicePaymentRequest } from "../types/salesTypes";

interface CreateInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ProductVariantOption {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  sku: string | null;
  barcode: string | null;
  salePrice: number;
  stock: number;
  unitMeasure: string;
  displayText: string;
}

const INVOICE_TYPES = [
  { value: "boleta", label: "Boleta de Venta" },
  { value: "factura", label: "Factura" },
  { value: "ticket", label: "Ticket de Venta (Mostrador)" },
];

const PAYMENT_METHODS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "yape_plin", label: "Yape / Plin" },
  { value: "tarjeta", label: "Tarjeta de Débito/Crédito" },
  { value: "transferencia", label: "Transferencia Bancaria" },
  { value: "credito", label: "Crédito a Cuenta" },
];

export default function CreateInvoiceDialog({ open, onClose, onSuccess }: CreateInvoiceDialogProps) {
  const [owners, setOwners] = useState<OwnerResponse[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<OwnerResponse | null>(null);
  const [isOTC, setIsOTC] = useState(true); // Venta mostrador sin cliente

  const [invoiceType, setInvoiceType] = useState("boleta");
  const [notes, setNotes] = useState("");
  const [globalDiscount, setGlobalDiscount] = useState<number>(0);

  // Variant options for autocomplete search
  const [variantOptions, setVariantOptions] = useState<ProductVariantOption[]>([]);
  const [selectedProductOption, setSelectedProductOption] = useState<ProductVariantOption | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Shopping cart items
  const [items, setItems] = useState<CreateInvoiceItemRequest[]>([]);

  // Payment methods
  const [payments, setPayments] = useState<CreateInvoicePaymentRequest[]>([
    { paymentMethod: "efectivo", amount: 0, referenceNumber: "" },
  ]);

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let isMounted = true;

    const loadData = async () => {
      setLoadingProducts(true);
      try {
        const [ownersData, productsRes] = await Promise.all([
          OwnerService.getAllOwners(),
          ProductsService.getAllProducts(),
        ]);

        if (isMounted) {
          setOwners(ownersData || []);

          // Map products & variants to searchable options
          const options: ProductVariantOption[] = [];
          (productsRes?.results || []).forEach((prod: ProductResponse) => {
            (prod.variants || []).forEach((v: ProductVariantResponse) => {
              if (v.isActive) {
                options.push({
                  productId: prod.id,
                  productName: prod.name,
                  variantId: v.id,
                  variantName: v.name,
                  sku: v.sku,
                  barcode: v.barcode,
                  salePrice: v.salePrice,
                  stock: v.stock,
                  unitMeasure: v.unitMeasure,
                  displayText: `${prod.name} - ${v.name} (Stock: ${v.stock} ${v.unitMeasure}) - S/. ${v.salePrice.toFixed(2)}`,
                });
              }
            });
          });
          setVariantOptions(options);
        }
      } catch (err) {
        console.error("Error loading POS options:", err);
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    };

    void loadData();
    return () => {
      isMounted = false;
    };
  }, [open]);

  const handleAddVariantToCart = (opt: ProductVariantOption | null) => {
    if (!opt) return;

    // Check if already in cart
    const existingIndex = items.findIndex((i) => i.variantId === opt.variantId);
    if (existingIndex >= 0) {
      setItems((prev) => {
        const copy = [...prev];
        copy[existingIndex].quantity = (copy[existingIndex].quantity || 1) + 1;
        return copy;
      });
    } else {
      setItems((prev) => [
        ...prev,
        {
          variantId: opt.variantId,
          description: `${opt.productName} - ${opt.variantName}`,
          quantity: 1,
          unitPrice: opt.salePrice,
          discount: 0,
        },
      ]);
    }
    setSelectedProductOption(null);
  };

  const handleAddManualService = () => {
    setItems((prev) => [
      ...prev,
      {
        serviceName: "Servicio Clínico / Peluquería",
        description: "Servicio veterinario o grooming",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
      },
    ]);
  };

  const handleItemChange = (index: number, field: keyof CreateInvoiceItemRequest, value: unknown) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculate totals
  const subtotalBeforeDiscounts = items.reduce((sum, item) => {
    const qty = item.quantity || 0;
    const price = item.unitPrice || 0;
    return sum + qty * price;
  }, 0);

  const totalItemDiscounts = items.reduce((sum, item) => sum + (item.discount || 0), 0);
  const calculatedSubtotal = Math.max(0, subtotalBeforeDiscounts - totalItemDiscounts - (globalDiscount || 0));
  const totalAmount = calculatedSubtotal;
  const subtotalBeforeTax = totalAmount / 1.18;
  const taxAmount = totalAmount - subtotalBeforeTax;

  // Payments logic
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const remainingToPay = totalAmount - totalPaid;

  const handleAddPaymentRow = () => {
    const nextAmount = Math.max(0, remainingToPay);
    setPayments((prev) => [...prev, { paymentMethod: "yape_plin", amount: nextAmount, referenceNumber: "" }]);
  };

  const handleRemovePaymentRow = (index: number) => {
    if (payments.length <= 1) return;
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePaymentChange = (index: number, field: keyof CreateInvoicePaymentRequest, value: unknown) => {
    setPayments((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSetExactTotalOnFirstPayment = () => {
    setPayments((prev) => {
      const copy = [...prev];
      if (copy.length > 0) {
        copy[0].amount = Math.round(totalAmount * 100) / 100;
      }
      return copy;
    });
  };

  const resetForm = () => {
    setSelectedOwner(null);
    setIsOTC(true);
    setInvoiceType("boleta");
    setNotes("");
    setGlobalDiscount(0);
    setItems([]);
    setPayments([{ paymentMethod: "efectivo", amount: 0, referenceNumber: "" }]);
    setErrorMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (items.length === 0) {
      setErrorMessage("Debe agregar al menos un producto o servicio al carrito.");
      return;
    }

    // Un abono parcial (o ningún pago = venta al crédito) es válido; solo se rechaza
    // si lo cobrado supera el total del comprobante.
    if (remainingToPay < -0.05) {
      setErrorMessage(`El total pagado (S/. ${totalPaid.toFixed(2)}) no puede superar el total del comprobante (S/. ${totalAmount.toFixed(2)}).`);
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    // Los pagos en 0 (p. ej. la fila inicial sin tocar en una venta al crédito) no se envían.
    const nonZeroPayments = payments.filter((p) => (p.amount || 0) > 0);

    const dto: CreateInvoiceRequest = {
      series: invoiceType === "factura" ? "F001" : invoiceType === "ticket" ? "T001" : "B001",
      invoiceType,
      ownerId: !isOTC && selectedOwner ? selectedOwner.id : undefined,
      globalDiscount,
      notes: notes.trim() || undefined,
      items,
      payments: nonZeroPayments,
    };

    try {
      await SalesService.createInvoice(dto);
      resetForm();
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error processing sale:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(err.response?.data?.message || err.message || "Error al procesar la venta.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
        <ShoppingCartRoundedIcon color="primary" /> Nueva Venta / Punto de Venta (POS)
      </DialogTitle>

      <form noValidate onSubmit={(e) => void handleSubmit(e)}>
        <DialogContent sx={{ pt: 1.5, pb: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          {/* Section 1: Customer & Invoice Header */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
            <TextField
              select
              label="Tipo de Comprobante"
              size="small"
              value={invoiceType}
              onChange={(e) => setInvoiceType(e.target.value)}
              disabled={saving}
              fullWidth
            >
              {INVOICE_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </TextField>

            <Autocomplete
              options={owners}
              value={selectedOwner}
              onChange={(_e, newValue) => {
                setSelectedOwner(newValue);
                setIsOTC(!newValue);
              }}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.documentNumber || "S/D"})`}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              disabled={saving}
              fullWidth
              renderInput={(params) => (
                <TextField {...params} label="Cliente / Propietario" placeholder="Buscar cliente..." size="small" />
              )}
            />

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Chip
                label={isOTC ? "Cliente Genérico (Venta Mostrador)" : `Cliente: ${selectedOwner?.firstName} ${selectedOwner?.lastName}`}
                color={isOTC ? "default" : "primary"}
                variant="filled"
                sx={{
                  borderRadius: "6px",
                  height: "40px",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  bgcolor: "action.selected",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              />
            </Box>
          </Box>

          <Divider />

          {/* Section 2: Product & Service Search */}
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, alignItems: "center" }}>
            <Autocomplete
              options={variantOptions}
              value={selectedProductOption}
              onChange={(_e, newValue) => {
                setSelectedProductOption(newValue);
                handleAddVariantToCart(newValue);
              }}
              getOptionLabel={(opt) => opt.displayText}
              isOptionEqualToValue={(opt, val) => opt.variantId === val.variantId}
              loading={loadingProducts}
              disabled={saving}
              sx={{ flex: 1 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar Producto por Nombre, SKU o Código de Barras"
                  placeholder="Escribe o escanea con lector de código de barras..."
                  size="small"
                />
              )}
            />

            <Button
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              onClick={handleAddManualService}
              disabled={saving}
              sx={{
                height: "44px",
                textTransform: "none",
                fontWeight: 600,
                whitespace: "nowrap",
                px: 2.5,
              }}
            >
              Agregar Servicio
            </Button>
          </Box>

          {/* Section 3: Shopping Cart Items Table */}
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: "10px" }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "action.hover" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Descripción / Ítem</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, width: 150 }}>
                    Cantidad
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, width: 150 }}>
                    Precio U. (S/.)
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, width: 150 }}>
                    Dscto (S/.)
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, width: 130 }}>
                    Subtotal (S/.)
                  </TableCell>
                  <TableCell align="center" sx={{ width: 50 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3, color: "text.secondary" }}>
                      El carrito de compras está vacío. Selecciona un producto arriba o agrega un servicio.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, index) => {
                    const lineSubtotal = (item.quantity || 0) * (item.unitPrice || 0) - (item.discount || 0);

                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            value={item.description || ""}
                            onChange={(e) => handleItemChange(index, "description", e.target.value)}
                            size="small"
                            fullWidth
                            variant="standard"
                            slotProps={{ input: { disableUnderline: true } }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <NumberInput
                            value={item.quantity}
                            onChange={(val) => handleItemChange(index, "quantity", val || 1)}
                            size="small"
                            min={0.001}
                            step={0.1}
                            disabled={saving}
                            sx={{ width: 130 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <NumberInput
                            value={item.unitPrice}
                            onChange={(val) => handleItemChange(index, "unitPrice", val || 0)}
                            size="small"
                            min={0}
                            step={0.1}
                            disabled={saving}
                            sx={{ width: 130 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <NumberInput
                            value={item.discount || 0}
                            onChange={(val) => handleItemChange(index, "discount", val || 0)}
                            size="small"
                            min={0}
                            step={0.1}
                            disabled={saving}
                            sx={{ width: 130 }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          S/. {lineSubtotal.toFixed(2)}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" color="error" onClick={() => handleRemoveItem(index)} disabled={saving}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Section 4: Totals & Mixed Payment Methods */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 380px" }, gap: 3, alignItems: "start" }}>
            {/* Left: Mixed Payments */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: "10px", display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 0.5 }}>
                  <PaymentsRoundedIcon fontSize="small" /> Registro de Pagos (Soporta Pagos Mixtos)
                </Typography>
                <Button size="small" onClick={handleSetExactTotalOnFirstPayment} sx={{ textTransform: "none" }}>
                  Cobrar Total Exacto
                </Button>
              </Box>

              {payments.map((p, index) => (
                <Box key={index} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <TextField
                    select
                    size="small"
                    label="Método"
                    value={p.paymentMethod}
                    onChange={(e) => handlePaymentChange(index, "paymentMethod", e.target.value)}
                    disabled={saving}
                    sx={{ width: 160 }}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <NumberInput
                    label="Monto (S/.)"
                    size="small"
                    value={p.amount}
                    onChange={(val) => handlePaymentChange(index, "amount", val || 0)}
                    min={0}
                    step={0.1}
                    disabled={saving}
                    sx={{ width: 150 }}
                  />

                  <TextField
                    label="N° Operación / Voucher (Opcional)"
                    size="small"
                    placeholder="Ej. 123456"
                    value={p.referenceNumber || ""}
                    onChange={(e) => handlePaymentChange(index, "referenceNumber", e.target.value)}
                    disabled={saving}
                    sx={{ flex: 1 }}
                  />

                  {payments.length > 1 && (
                    <IconButton size="small" color="error" onClick={() => handleRemovePaymentRow(index)} disabled={saving}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              ))}

              <Button
                variant="text"
                size="small"
                startIcon={<AddRoundedIcon />}
                onClick={handleAddPaymentRow}
                disabled={saving}
                sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 600 }}
              >
                Agregar otro pago (Pago Mixto)
              </Button>
            </Paper>

            {/* Right: Summary Card */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: "10px", bgcolor: "background.paper", display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Subtotal:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  S/. {subtotalBeforeTax.toFixed(2)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  IGV (18% incluido):
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  S/. {taxAmount.toFixed(2)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Descuento Global (S/.):
                </Typography>
                <NumberInput
                  size="small"
                  value={globalDiscount}
                  onChange={(val) => setGlobalDiscount(val || 0)}
                  min={0}
                  step={0.1}
                  disabled={saving}
                  sx={{ width: 150 }}
                />
              </Box>

              <Divider sx={{ my: 0.5 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  TOTAL COMPROBANTE:
                </Typography>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>
                  S/. {totalAmount.toFixed(2)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Total Cobrado:
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: totalPaid >= totalAmount ? "success.main" : "warning.main" }}>
                  S/. {totalPaid.toFixed(2)}
                </Typography>
              </Box>

              {remainingToPay > 0.05 && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" color="text.secondary">
                    Saldo pendiente {totalPaid > 0 ? "(venta parcial)" : "(venta al crédito)"}:
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "warning.main" }}>
                    S/. {remainingToPay.toFixed(2)}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>

          <TextField
            label="Notas / Observaciones del Comprobante"
            placeholder="Detalles adicionales del pago o entrega..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={saving}
            fullWidth
            size="small"
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={saving} variant="outlined" sx={{ textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saving || items.length === 0}
            variant="contained"
            sx={{ textTransform: "none", minWidth: 150, fontWeight: 700 }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar y Emitir"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
