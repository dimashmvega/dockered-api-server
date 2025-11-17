import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FetchService } from './fetch.service';
import { ProductService } from './product.service';
import { ContentfulItem } from 'src/interfaces/contentful.interface';

@Injectable()
export class TaskService {
  constructor(private readonly productService: ProductService) { }

  onModuleInit() {
    this.runDatasyncTask();
  }

  @Cron(CronExpression.EVERY_HOUR)
  handleCron() {
    this.runDatasyncTask();
  }

  /**
   * Executes the data synchronization task by fetching entries from Contentful
  * and inserting them using the product service.
  *
  * This method builds a request URL using the `SPACE_ID` and
  * `ENVIRONMENT_EXTERNAL` environment variables, then retrieves the data
  * through the `FetchService`. Each returned item is processed and stored
  * locally via `productService.insertProduct()`.
  *
  * Error handling:
  * - Logs a specific message when a `404` error occurs (likely due to incorrect
  *   `SPACE_ID` or `ENVIRONMENT_EXTERNAL`).
  * - Logs a generic HTTP failure message for other request-related errors.
  * - Handles unknown or non-Error exceptions safely. 
   */
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
