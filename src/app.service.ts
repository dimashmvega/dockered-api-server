import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    const messageAboutMe =
      'This API server is developed by Dimas Martinez LinkedIn https://sv.linkedin.com/in/dimas-vega-28b17955';
    return `Hello World! and a new job` + '\n' + messageAboutMe;
  }
}
