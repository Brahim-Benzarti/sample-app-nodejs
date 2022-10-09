export interface WebHookPayload {
  store_id:   string;
  producer:   string;
  scope:      string;
  data:       Data;
  hash:       string;
  created_at: number;
}

export interface Data {
  type:               string;
  id:                 number;
  origin_channel_id?: number;
  channel_ids?:       number[];
  inventory?:         Inventory;
}

export interface Inventory {
  product_id:   number;
  method:       string;
  value:        number;
}


// All possible scopes for each used webhook,
// Any additional webhook should have the scopes declared.

export enum CustomerWebHookPayloadScope{
  CREATED= 'store/customer/created',
  UPDATED= 'store/customer/updated',
  DELETED= 'store/customer/deleted',

  ADDRESS_CREATED= 'store/customer/address/created',
  ADDRESS_UPDATED= 'store/customer/address/updated',
  ADDRESS_DELETED= 'store/customer/address/deleted',

  PAYMENT_UPDATED= 'store/customer/payment/instrument/default/updated',
}

export enum ProductWebHookPayloadScope {
  DELETED= 'store/product/deleted',
  CREATED= 'store/product/created',
  UPDATED= 'store/product/updated',

  INVENTORY_UPDATED= 'store/product/inventory/updated',
  INVENTORY_ORDER_UPDATED= 'store/product/inventory/order/updated',
}