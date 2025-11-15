import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from '../src/services/task.service';
import { ProductService } from '../src/services/product.service';
import { FetchService } from '../src/services/fetch.service';

jest.mock('../src/services/fetch.service');

describe('TaskService', () => {
  let service: TaskService;
  let productService: ProductService;
  let fetchService: FetchService;

  beforeEach(async () => {
    // Mock ProductService
    const mockProductService = {
      insertProduct: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    productService = module.get<ProductService>(ProductService);
    fetchService = new FetchService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should call runDatasyncTask on module initialization', async () => {
      const runDatasyncTaskSpy = jest.spyOn(service as any, 'runDatasyncTask');
      service.onModuleInit();
      expect(runDatasyncTaskSpy).toHaveBeenCalled();
    });
  });

  describe('handleCron', () => {
    it('should execute cron job', async () => {
      const runDatasyncTaskSpy = jest.spyOn(service as any, 'runDatasyncTask');
      service.handleCron();
      expect(runDatasyncTaskSpy).toHaveBeenCalled();
    });
  });

  describe('runDatasyncTask', () => {
    it('should fetch data and insert products successfully', async () => {
      const mockData = {
        items: [
          {
            sys: { id: '1', type: 'Entry' },
            fields: {
              productName: ['Test Product'],
              sku: ['SKU123'],
              category: ['Electronics'],
            },
          },
        ],
      };

      jest.spyOn(FetchService.prototype, 'fetchData').mockResolvedValue(mockData);
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await (service as any).runDatasyncTask();

      expect(consoleSpy).toHaveBeenCalledWith('Running data sync task...');
      expect(productService.insertProduct).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle fetch errors gracefully', async () => {
      const mockError = new Error('404 Not Found');
      
      jest.spyOn(FetchService.prototype, 'fetchData').mockRejectedValue(mockError);
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await (service as any).runDatasyncTask();

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(productService.insertProduct).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle unexpected errors', async () => {
      const unexpectedError = 'Unexpected error';
      
      jest.spyOn(FetchService.prototype, 'fetchData').mockRejectedValue(unexpectedError);
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await (service as any).runDatasyncTask();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'An unexpected error occurred during data sync:',
        unexpectedError,
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
