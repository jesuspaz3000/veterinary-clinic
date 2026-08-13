export interface InvoicePaymentResponse {
  id: string;
  paymentMethod: string;
  amount: number;
  referenceNumber: string | null;
  createdAt: string;
}

export interface InvoiceItemLotResponse {
  id: string;
  lotId: string;
  lotNumber: string;
  expirationDate: string;
  quantity: number;
}

export interface InvoiceItemResponse {
  id: string;
  variantId: string | null;
  productName: string | null;
  variantName: string | null;
  sku: string | null;
  unitMeasure: string | null;
  prescriptionId: string | null;
  serviceName: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  itemLots: InvoiceItemLotResponse[];
}

export interface InvoiceResponse {
  id: string;
  series: string;
  correlative: number;
  invoiceNumber: string;
  invoiceType: string;
  ownerId: string | null;
  ownerName: string | null;
  ownerDocumentNumber: string | null;
  appointmentId: string | null;
  veterinarianId: string | null;
  veterinarianName: string | null;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes: string | null;
  userId: string;
  userName: string;
  issuedAt: string;
  createdAt: string;
  items: InvoiceItemResponse[];
  payments: InvoicePaymentResponse[];
}

export interface CreateInvoicePaymentRequest {
  paymentMethod: string;
  amount: number;
  referenceNumber?: string;
}

export interface CreateInvoiceItemRequest {
  variantId?: string;
  serviceName?: string;
  prescriptionId?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export interface CreateInvoiceRequest {
  series?: string;
  invoiceType?: string;
  ownerId?: string;
  appointmentId?: string;
  veterinarianId?: string;
  globalDiscount?: number;
  notes?: string;
  items: CreateInvoiceItemRequest[];
  payments: CreateInvoicePaymentRequest[];
}

export interface InvoiceFilters {
  search?: string;
  series?: string;
  invoiceType?: string;
  paymentStatus?: string;
  ownerId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface CreditNoteItemResponse {
  id: string;
  invoiceItemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CreditNoteResponse {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  series: string;
  correlative: number;
  creditNoteNumber: string;
  reason: string;
  total: number;
  restockInventory: boolean;
  userId: string;
  userName: string;
  issuedAt: string;
  createdAt: string;
  items: CreditNoteItemResponse[];
}

export interface CreateCreditNoteItemRequest {
  invoiceItemId: string;
  quantity: number;
}

export interface CreateCreditNoteRequest {
  invoiceId: string;
  series?: string;
  reason: string;
  restockInventory?: boolean;
  items: CreateCreditNoteItemRequest[];
}

export interface InventoryMovementResponse {
  id: string;
  variantId: string;
  productName: string | null;
  variantName: string | null;
  sku: string | null;
  lotId: string | null;
  lotNumber: string | null;
  lotExpirationDate: string | null;
  movementType: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceType: string | null;
  referenceId: string | null;
  notes: string | null;
  unitPrice?: number | null;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface InventoryMovementFilters {
  variantId?: string;
  lotId?: string;
  movementType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}
