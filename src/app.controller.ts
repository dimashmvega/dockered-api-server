import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AppService } from './app.service';
import { ProductService } from './services/product.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { PaginatedProducts } from './interfaces/productFilter.interface';
import { UserService } from './services/user.service';
import { UserEntity } from './entities/user.entity';

export interface GetProductsQuery {
  category?: string;
  brand?: string;
  model?: string;
  color?: string;
  currency?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  limit?: string;
}

interface ReportQuery {
  minPrice?: string;
  startDate?: string;
  endDate?: string;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly productService: ProductService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get a hello world message and my linkedIn' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  @ApiOperation({ summary: 'Create new user (for testing purposes)' })
  async createUser(@Body() userEntity: UserEntity): Promise<string> {
    return await this.userService.createUser(userEntity);
  }

  @Get('/products')
  @ApiOperation({
    summary: 'Get all products with optional filters and pagination',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category',
    type: String,
  })
  @ApiQuery({
    name: 'brand',
    required: false,
    description: 'Filter by brand',
    type: String,
  })
  @ApiQuery({
    name: 'model',
    required: false,
    description: 'Filter by model',
    type: String,
  })
  @ApiQuery({
    name: 'color',
    required: false,
    description: 'Filter by color',
    type: String,
  })
  @ApiQuery({
    name: 'currency',
    required: false,
    description: 'Filter by currency',
    type: String,
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'Minimum price filter',
    minimum: 0,
    type: Number,
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Maximum price filter',
    minimum: 0,
    type: Number,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    minimum: 1,
    type: Number,
    default: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    minimum: 1,
    type: Number,
    default: process.env.DEFAULT_PAGE_SIZE || 5,
  })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully.' })
  async getProducts(
    @Query() query: GetProductsQuery,
  ): Promise<PaginatedProducts> {
    const filters = {
      category: query.category,
      minPrice: query.minPrice ? parseFloat(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : undefined,
      brand: query.brand,
      color: query.color,
      model: query.model,
      currency: query.currency,
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
    };
    return this.productService.getAllProducts(filters);
  }

  @Delete('/products/:sku')
  @ApiResponse({ status: 204, description: 'Product deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a product by SKU' })
  @ApiParam({
    name: 'sku',
    required: true,
    description: 'SKU of the product to delete',
    type: String,
  })
  async deleteProduct(@Param('sku') sku: string): Promise<void> {
    const deletedResult = await this.productService.deleteProduct(sku);
    if (deletedResult.affected === 0) {
      throw new NotFoundException(`Product with SKU "${sku}" not found.`);
    }
  }

  @Get('/reports/metrics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get protected report about product metrics' })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'Minimum price filter',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date for date range filter (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date for date range filter (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Product metrics retrieved successfully.',
  })
  getProtectedReport(@Query() query: ReportQuery): Promise<any> {
    const filters = {
      minPrice: query.minPrice ? parseFloat(query.minPrice) : undefined,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };

    const hasStart = !!filters.startDate;
    const hasEnd = !!filters.endDate;

    if ((hasStart && !hasEnd) || (!hasStart && hasEnd)) {
      throw new HttpException(
        'Both startDate and endDate must be provided for date range filtering.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.productService.getProductMetrics(filters);
  }

  @Get('/reports/inventory-health')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get protected report about inventory health' })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter report by category',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory health report retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getInventoryHealth(@Query('category') category?: string): Promise<any> {
    return this.productService.getInventoryHealthReport(category);
  }
}
