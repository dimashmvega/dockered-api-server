import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../auth/jwt.strategy';
import { AuthController } from 'src/controllers/auth.controller';
import { AuthService } from 'src/services/auth.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET')!,
        signOptions: {
          expiresIn: parseInt(
            configService.get<string>('JWT_EXPIRATION_TIME') || '3600',
            10,
          ),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, PassportModule],
  providers: [JwtStrategy, AuthService],
})
export class AuthModule {}
