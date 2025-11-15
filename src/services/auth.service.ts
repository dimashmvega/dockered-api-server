import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/jwt.strategy';
import { UserService } from './user.service';

type AuthenticatedUser = Omit<JwtPayload, 'sub'> & { userId: string };

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async validateUser(username: string, pass: string): Promise<AuthenticatedUser | null> {
    const user = await this.userService.validateUser(username, pass);
    if (user) {
      const authenticatedUser: AuthenticatedUser = {
        userId: user.username,
        username: user.username,
        role: user.rol || 'reporter',
      };
      return authenticatedUser;
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
