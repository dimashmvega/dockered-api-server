import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskService } from './services/task.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { AuthModule } from './modules/auth.module';
import { ProductService } from './services/product.service';
import { UserService } from './services/user.service';
import { UserEntity } from './entities/user.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        entities: [ProductEntity, UserEntity],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([ProductEntity, UserEntity]),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, TaskService, ProductService, UserService],
})
export class AppModule {}
