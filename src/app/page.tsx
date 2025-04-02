'use client';

import { useState } from 'react';
import axios from 'axios';
import { ProductList } from '@/components/product-management/product-list';
import { ProductForm } from '@/components/product-management/product-form';
import { DiscountCalculator } from '@/components/discount-calculator/discount-calculator';
import { Product } from '@/types';

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProductSubmit = async (data: Omit<Product, 'id'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:8000/products/', data);
      const newProduct: Product = response.data;
      // The product list will automatically refresh on the next fetch
      setSelectedProduct(newProduct); // Optionally select the new product
    } catch (err) {
      setError('Failed to create product. Please try again.');
      console.error('Error creating product:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Discount Calculation System
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
              <ProductForm 
                onSubmit={handleProductSubmit}
                isLoading={isLoading}
              />
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Available Products</h2>
              <ProductList
                onSelectProduct={setSelectedProduct}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Calculate Discount</h2>
            <DiscountCalculator
              selectedProduct={selectedProduct}
              onCalculate={async (calculation) => {
                // Add API integration here
                console.log('Calculation:', calculation);
              }}
            />

            {finalPrice !== null && (
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="text-lg font-medium text-gray-900">Final Price</h3>
                <p className="text-2xl font-bold text-indigo-600 mt-2">
                  pop
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}