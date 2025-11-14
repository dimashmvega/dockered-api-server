import { ProductEntity } from 'src/entities/product.entity';

export interface ProductFilterParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  model?: string;
  color?: string;
  currency?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  data: ProductEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReportFilters {
  minPrice?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface ProductMetrics {
  totalRecords: number;
  deletedPercentage: number;
  activeFilteredPercentage: number;
}

export interface InventoryHealthReport {
  category: string;
  activeCount: string;
  totalStockValue: string;
  averageStock: string;
  averageAgeDays: string;
}
