export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface DiscountCalculation {
  productId: string;
  quantity: number;
  discountTypes: DiscountType[];
}

export const DISCOUNT_TYPES = {
  PERCENTAGE: 'percentage',
  FLAT: 'flat',
  BOGO: 'bogo',
} as const;

export type DiscountType = {
  type: keyof typeof DISCOUNT_TYPES;
  value?: number; // Optional for BOGO
}; 