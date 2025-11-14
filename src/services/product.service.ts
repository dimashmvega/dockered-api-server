import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from 'src/entities/product.entity';
import {
  Between,
  DeleteResult,
  FindManyOptions,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import {
  PaginatedProducts,
  ProductFilterParams,
  ReportFilters,
  ProductMetrics,
  InventoryHealthReport,
} from 'src/interfaces/productFilter.interface';

const DEFAULT_PAGE_SIZE = Number(process.env.DEFAULT_PAGE_SIZE) || 5;

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async insertProduct(data: any): Promise<boolean> {
    try {
      const mappedProductData = this.mapContentfulItemToProductEntity(data);
      const product = this.productRepository.create(mappedProductData);
      await this.productRepository.save(product);
      console.log(
        `Product SKU ${mappedProductData.sku} inserted/updated successfully.`,
      );
      return true;
    } catch (error) {
      if (error instanceof Error) {
            console.error('Error inserting product:', error.message);
        } else {            
            console.error('An unexpected error occurred:', error);
        }
      console.log('Insertion failed for data:', data);
      return false;
    }
  }

  async getAllProducts(
    filters: ProductFilterParams = {},
  ): Promise<PaginatedProducts> {
    const page =
      typeof filters.page === 'number' && filters.page > 0 ? filters.page : 1;
    const limit =
      typeof filters.limit === 'number' && filters.limit > 0
        ? filters.limit
        : DEFAULT_PAGE_SIZE;
    const skip = (page - 1) * limit;

    const findOptions: FindManyOptions<ProductEntity> = {
      where: {},
      take: limit,
      skip,
    };

    if (filters.category) {
      findOptions.where = {
        ...findOptions.where,
        category: filters.category,
      };
    }

    if (filters.brand) {
      findOptions.where = {
        ...findOptions.where,
        brand: filters.brand,
      };
    }

    if (filters.model) {
      findOptions.where = {
        ...findOptions.where,
        model: filters.model,
      };
    }

    if (filters.color) {
      findOptions.where = {
        ...findOptions.where,
        color: filters.color,
      };
    }

    if (filters.currency) {
      findOptions.where = {
        ...findOptions.where,
        currency: filters.currency,
      };
    }

    if (filters.minPrice || filters.maxPrice) {
      const priceFilter: any = {};
      if (filters.minPrice) {
        priceFilter.price = MoreThanOrEqual(filters.minPrice);
      }
      if (filters.maxPrice) {
        priceFilter.price = {
          ...priceFilter.price,
          ...LessThanOrEqual(filters.maxPrice),
        };
      }
      findOptions.where = { ...findOptions.where, ...priceFilter };
    }

    try {
      //products = await this.productRepository.find();
      const [data, total] =
        await this.productRepository.findAndCount(findOptions);
      const totalPages = Math.ceil(total / limit);
      return {
        data,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      console.error('Error retrieving products:', error.message);
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  }

  async deleteProduct(sku: string): Promise<DeleteResult> {
    try {
      const deleteResult = await this.productRepository.softDelete(sku);
      if (deleteResult.affected === 0) {
        throw new NotFoundException(`Product with SKU "${sku}" not found.`);
      }
      console.log(`Products deleted successfully`);
      return deleteResult;
    } catch (error) {
      console.error('Error deleting products:', error.message);
      throw error;
    }
  }

  async getProductMetrics(
    filters: ReportFilters = {},
  ): Promise<ProductMetrics> {
    const totalRecords = await this.productRepository.count({
      withDeleted: true,
    });

    if (totalRecords === 0) {
      return {
        totalRecords: 0,
        deletedPercentage: 0,
        activeFilteredPercentage: 0,
      };
    }

    const deletedCount = await this.productRepository.count({
      withDeleted: true,
      where: { deletedAt: Not(IsNull()) },
    });

    const whereClause: any = {
      deletedAt: IsNull(),
    };

    if (filters.minPrice !== undefined) {
      whereClause.price = MoreThanOrEqual(filters.minPrice);
    }

    if (filters.startDate && filters.endDate) {
      whereClause.createdAt = Between(filters.startDate, filters.endDate);
    }

    const activeFilterCount = await this.productRepository.count({
      where: whereClause,
    });

    const deletedPercentage = (deletedCount / totalRecords) * 100;
    const activeFilteredPercentage = (activeFilterCount / totalRecords) * 100;

    return {
      totalRecords,
      deletedPercentage: parseFloat(deletedPercentage.toFixed(2)),
      activeFilteredPercentage: parseFloat(activeFilteredPercentage.toFixed(2)),
    };
  }

  async getInventoryHealthReport(
    category?: string,
  ): Promise<InventoryHealthReport[]> {
    const query = this.productRepository
      .createQueryBuilder('p')
      .select('p.category', 'category')
      .addSelect('COUNT(p.sku)', 'activeCount')
      .addSelect('SUM(CAST(p.price AS numeric) * p.stock)', 'totalStockValue')
      .addSelect('ROUND(AVG(p.stock))', 'averageStock')
      .addSelect(
        'AVG(EXTRACT(EPOCH FROM (NOW() - p."createdAt")) / 86400)',
        'averageAgeDays',
      )
      .where('p."deleted_at" IS NULL')
      .groupBy('p.category')
      .orderBy('"totalStockValue"', 'DESC');

    if (category) {
      query.andWhere('p.category = :category', { category });
    }

    return query.getRawMany<InventoryHealthReport>();
  }

  private mapContentfulItemToProductEntity(data: any): Partial<ProductEntity> {
    const sysCopy = { ...data.sys };
    delete sysCopy.id;
    delete sysCopy.createdAt;
    delete sysCopy.updatedAt;

    return {
      sku: data.fields.sku,
      name: data.fields.name,
      brand: data.fields.brand,
      model: data.fields.model,
      category: data.fields.category,
      color: data.fields.color,
      price: data.fields.price,
      currency: data.fields.currency,
      stock: data.fields.stock,
      contentfulId: data.sys.id,
      createdAt: new Date(data.sys.createdAt),
      updatedAt: new Date(data.sys.updatedAt),
      systemMetadata: {
        metadata: data.metadata,
        sys_remaining: sysCopy,
      },
    };
  }
}
