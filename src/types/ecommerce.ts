export type Sku = {
  id: string;
  name: string;
  spec: string;
  priceCents: number;
  originalPriceCents: number | null;
  stock: number;
  imageUrl: string | null;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  skus: Sku[];
};

export type PaymentMethod = {
  id: string;
  type: 'WECHAT' | 'ALIPAY';
  name: string;
  qrCodeUrl: string;
  instructions: string;
};

export type CreateOrderRequest = {
  skuId: string;
  quantity: number;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  remark?: string;
};

export type CreateOrderResponse = {
  orderNo: string;
  status: 'PENDING_PAYMENT';
  totalAmountCents: number;
  paymentMethods: PaymentMethod[];
};

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID_CONFIRMED'
  | 'SHIPPING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';
