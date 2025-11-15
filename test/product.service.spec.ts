import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductService } from '../src/services/product.service';
import { ProductEntity } from '../src/entities/product.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: Repository<ProductEntity>;

  const mockProductRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    softDelete: jest.fn(),
    count: jest.fn(),
    findAndCount: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepository = module.get<Repository<ProductEntity>>(
      getRepositoryToken(ProductEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('insertProduct', () => {
    it('should insert a product successfully', async () => {
      const mockContentfulItem = {
        sys: { id: '1', type: 'Entry' },
        fields: {
          productName: ['Test Product'],
          sku: ['SKU123'],
          category: ['Electronics'],
          brand: ['TestBrand'],
          price: [99.99],
          currency: ['USD'],
        },
      };

      const mockProductEntity = {
        id: 'uuid-123',
        name: 'Test Product',
        sku: 'SKU123',
        category: 'Electronics',
        brand: 'TestBrand',
        price: 99.99,
        currency: 'USD',
      };

      mockProductRepository.create.mockReturnValue(mockProductEntity);
      mockProductRepository.save.mockResolvedValue(mockProductEntity);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await service.insertProduct(mockContentfulItem as any);

      expect(result).toBe(true);
      expect(mockProductRepository.create).toHaveBeenCalled();
      expect(mockProductRepository.save).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('SKU123'),
      );

      consoleSpy.mockRestore();
    });

    it('should return false on insertion error', async () => {
      const mockContentfulItem = {
        sys: { id: '1', type: 'Entry' },
        fields: {
          productName: ['Test Product'],
          sku: ['SKU456'],
        },
      };

      mockProductRepository.create.mockImplementation(() => {
        throw new Error('Database error');
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await service.insertProduct(mockContentfulItem as any);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error inserting product:',
        'Database error',
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getAllProducts', () => {
    it('should return paginated products with default pagination', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', sku: 'SKU001' },
        { id: '2', name: 'Product 2', sku: 'SKU002' },
      ];

      mockProductRepository.findAndCount.mockResolvedValue([mockProducts, 2]);

      const result = await service.getAllProducts();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
      expect(mockProductRepository.findAndCount).toHaveBeenCalled();
    });

    it('should filter products by category', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', category: 'Electronics' },
      ];

      mockProductRepository.findAndCount.mockResolvedValue([mockProducts, 1]);

      const result = await service.getAllProducts({
        category: 'Electronics',
      });

      expect(mockProductRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'Electronics',
          }),
        }),
      );
    });

    it('should filter products by brand', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', brand: 'TestBrand' },
      ];

      mockProductRepository.findAndCount.mockResolvedValue([mockProducts, 1]);

      const result = await service.getAllProducts({ brand: 'TestBrand' });

      expect(mockProductRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            brand: 'TestBrand',
          }),
        }),
      );
    });

    it('should handle custom pagination', async () => {
      const mockProducts = [];

      mockProductRepository.findAndCount.mockResolvedValue([mockProducts, 0]);

      const result = await service.getAllProducts({
        page: 2,
        limit: 10,
      });

      expect(mockProductRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });

    it('should filter by price range', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 99.99 },
      ];

      mockProductRepository.findAndCount.mockResolvedValue([mockProducts, 1]);

      const result = await service.getAllProducts({
        minPrice: 50,
        maxPrice: 150,
      });

      expect(mockProductRepository.findAndCount).toHaveBeenCalled();
    });

    it('should return empty data on error', async () => {
      mockProductRepository.findAndCount.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await service.getAllProducts();

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product successfully', async () => {
      mockProductRepository.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteProduct('SKU001');

      expect(result).toHaveProperty('affected', 1);
      expect(mockProductRepository.softDelete).toHaveBeenCalledWith('SKU001');
    });

    it('should throw error if product not found', async () => {
      mockProductRepository.softDelete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteProduct('SKU999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getProductMetrics', () => {
    it('should return product metrics', async () => {
      mockProductRepository.count
        .mockResolvedValueOnce(100) // total records
        .mockResolvedValueOnce(10); // deleted count

      const result = await service.getProductMetrics();

      expect(result).toHaveProperty('totalRecords', 100);
      expect(result).toHaveProperty('deletedPercentage');
      expect(result).toHaveProperty('activeFilteredPercentage');
      expect(mockProductRepository.count).toHaveBeenCalled();
    });

    it('should return zero metrics when no products exist', async () => {
      mockProductRepository.count.mockResolvedValue(0);

      const result = await service.getProductMetrics();

      expect(result.totalRecords).toBe(0);
      expect(result.deletedPercentage).toBe(0);
      expect(result.activeFilteredPercentage).toBe(0);
    });

    it('should apply filters to metrics calculation', async () => {
      mockProductRepository.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(50);

      const result = await service.getProductMetrics({
        minPrice: 50,
      });

      expect(result).toBeDefined();
      expect(mockProductRepository.count).toHaveBeenCalled();
    });
  });
});
