'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Product, DiscountType, DISCOUNT_TYPES } from '@/types';

interface DiscountCalculatorProps {
  selectedProduct: Product | null;
  onCalculate: (calculation: DiscountCalculation) => Promise<void>;
}

interface DiscountCalculation {
  productId: number;
  quantity: number;
  discountTypes: DiscountType[];
}

interface ApiResponse {
  status: string;
  detail: {
    description: string;
    data: Array<{
      id: number;
      type: string;
      value?: number;
      description: string;
    }>;
  };
}

export function DiscountCalculator({ selectedProduct, onCalculate }: DiscountCalculatorProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedDiscounts, setSelectedDiscounts] = useState<DiscountType[]>([]);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [availableDiscounts, setAvailableDiscounts] = useState<Array<{
    id: number;
    type: string;
    value?: number;
    description: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscounts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<ApiResponse>('http://localhost:8000/discounts/');
      setAvailableDiscounts(response.data.detail.data);
    } catch (err) {
      setError('Failed to fetch available discounts');
      console.error('Error fetching discounts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleAddDiscount = (type: keyof typeof DISCOUNT_TYPES) => {
    const newDiscount: DiscountType = {
      type,
      value: type !== 'BOGO' ? discountValue : undefined,
    };
    setSelectedDiscounts([...selectedDiscounts, newDiscount]);
    setDiscountValue(0);
  };

  const handleCalculate = async () => {
    if (!selectedProduct) return;
    
    await onCalculate({
      productId: selectedProduct.id,
      quantity,
      discountTypes: selectedDiscounts,
    });
  };

  if (!selectedProduct) {
    return (
      <div className="text-center text-gray-500 py-8">
        Please select a product to calculate discounts
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold">Selected Product: {selectedProduct.name}</h3>
        <p>Base Price: ₦{parseFloat(selectedProduct.price.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Available Discounts</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {availableDiscounts.map((discount) => (
              <button
                key={discount.id}
                onClick={() => handleAddDiscount(discount.type as keyof typeof DISCOUNT_TYPES)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                {discount.name}
                {discount.discount_value && ` (${discount.discount_value}${discount.discount_type.toLowerCase() === 'percentage' ? '%' : 'N'})`}
              </button>
            ))}
          </div>
        </div>

        {selectedDiscounts.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Applied Discounts:</h4>
            <ul className="space-y-1">
              {selectedDiscounts.map((discount, index) => {
                console.log(discount);   
                  return (<li 
                   key={index} 
                   className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 p-2 rounded"
                 >
                   <span>
                     
                     {discount.discount_type === 'BOGO' 
                       ? 'Buy One Get One Free' 
                       : `${discount.discount_type === 'percentage' ? discount.discount_value + '%' : 'N' + discount.discount_value} off`}
                   </span>
                   <button
                     onClick={() => {
                       const newDiscounts = [...selectedDiscounts];
                       newDiscounts.splice(index, 1);
                       setSelectedDiscounts(newDiscounts);
                     }}
                     className="text-red-600 hover:text-red-800"
                   >
                     Remove
                   </button>
                 </li>
              )} 
              )}
            </ul>
          </div>
        )}

        <button
          onClick={handleCalculate}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Calculate Final Price
        </button>
      </div>
    </div>
  );
}