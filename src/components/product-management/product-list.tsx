'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Product } from '@/types';

interface ProductListProps {
  onSelectProduct: (product: Product) => void;
}

interface PaginatedApiResponse {
  status: string;
  detail: {
    description: string;
    data: Array<{
      id: number;
      name: string;
      price: string;
      created_at: string;
    }>;
    page: number;
    pages: number;
    total: number;
  };
}

export function ProductList({ onSelectProduct }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (page: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<PaginatedApiResponse>(`http://localhost:8000/products/?page=${page}&limit=6`);
      setProducts(response.data.detail.data.map((product: { id: number; name: string; price: string; created_at: string }) => ({
        id: product.id.toString(),
        name: product.name,
        price: parseFloat(product.price),
        created_at: product.created_at
      })));
      setTotalPages(response.data.detail.pages);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectProduct(product)}
          >
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-gray-600">₦{parseFloat(product.price.toString()).toFixed(2)}</p>
            <p className="text-sm text-gray-500">
              {new Date(product.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center space-x-2">
        <button
          onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-md ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          Previous
        </button>
        
        <div className="flex items-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-md ${
                currentPage === page
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-md ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
} 