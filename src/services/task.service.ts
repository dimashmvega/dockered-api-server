import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FetchService } from './fetch.service';
import { ProductService } from './product.service';

@Injectable()
export class TaskService {
  constructor(private readonly productService: ProductService) {}

  //@Cron('*/30 * * * * *') //Test purpose: every 30 seconds
  @Cron(CronExpression.EVERY_HOUR)
  handleCron() {
    const SPACE_ID = process.env.SPACE_ID;
    const ENVIRONMENT_EXTERNAL = process.env.ENVIRONMENT_EXTERNAL;
    const baseURL = `https://cdn.contentful.com/spaces/${SPACE_ID}/environments/${ENVIRONMENT_EXTERNAL}/entries?`;
    try {
      const fetchService = new FetchService();
      fetchService.fetchData(baseURL).then((data) => {
        data.items.forEach((item: any) => {
          console.log('Processing item:', item);
          this.productService.insertProduct(item);
        });
      });
    } catch (error) {
      console.error('Error in cron job:', error);
    }
  }
}
