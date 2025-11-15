import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class FetchService {
  async fetchData(url: string): Promise<any> {
    try {
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          access_token: process.env.EXTERNAL_API_TOKEN,
          content_type: 'product',
        },
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching data from ${url}:`, error.message);
      } else {
        console.error(`Error fetching data from ${url}:`, error);
      }
      throw error;
    }
  }
}
