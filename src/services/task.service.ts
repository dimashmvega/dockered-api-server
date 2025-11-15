import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FetchService } from './fetch.service';
import { ProductService } from './product.service';
import { ContentfulItem } from 'src/interfaces/contentful.interface';

@Injectable()
export class TaskService {
  constructor(private readonly productService: ProductService) {}

  onModuleInit() {
    this.runDatasyncTask();
  }

  @Cron(CronExpression.EVERY_HOUR)
  handleCron() {
    this.runDatasyncTask();
  }

  private async runDatasyncTask() {
    console.log('Running data sync task...');
    const SPACE_ID = process.env.SPACE_ID;
    const ENVIRONMENT_EXTERNAL = process.env.ENVIRONMENT_EXTERNAL;
    const baseURL = `https://cdn.contentful.com/spaces/${SPACE_ID}/environments/${ENVIRONMENT_EXTERNAL}/entries?`;
    try {
      const fetchService = new FetchService();
      const data = await fetchService.fetchData(baseURL);
      data.items.forEach((item: ContentfulItem) => {
        console.log('Processing item:', item);
        this.productService.insertProduct(item);
      });
    } catch (error) {
      let logMessage = 'An unexpected error occurred during data sync.';
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
        if (errorMessage.includes('404')) {
          logMessage =
            'Contentful endpoint returned 404. Check SPACE_ID/ENVIRONMENT_EXTERNAL.';
        } else {
          logMessage = 'An HTTP request failed.';
        }
        console.error(`${logMessage}: ${errorMessage}`);
      } else {
        console.error('An unexpected error occurred during data sync:', error);
      }
    }
  }
}
