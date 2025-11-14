import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/jwt.strategy';

type AuthenticatedUser = Omit<JwtPayload, 'sub'> & { userId: string };

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  validateUser(username: string, pass: string): AuthenticatedUser | null {
    if (username === 'admin' && pass === 'password123') {
      const user: AuthenticatedUser = {
        userId: '1',
        username: 'admin',
        role: 'reporter',
      };
      return user;
    }
    return null;
  }

  async login(user: AuthenticatedUser) {
    const payload: JwtPayload = {
      username: user.username,
      sub: user.userId,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
