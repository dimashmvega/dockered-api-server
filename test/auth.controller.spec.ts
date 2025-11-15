import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/controllers/auth.controller';
import { AuthService } from '../src/services/auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', () => {
      const loginDto = {
        username: 'testuser',
        password: 'password123',
      };

      const mockUser = { id: '1', username: 'testuser' };
      const mockToken = { access_token: 'token123' };

      mockAuthService.validateUser.mockReturnValue(mockUser);
      mockAuthService.login.mockReturnValue(mockToken);

      const result = controller.login(loginDto);

      expect(result).toEqual(mockToken);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        'testuser',
        'password123',
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should throw UnauthorizedException when no login data provided', () => {
      const loginDto = null;

      expect(() => controller.login(loginDto as any)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when username is missing', () => {
      const loginDto = {
        username: '',
        password: 'password123',
      };

      expect(() => controller.login(loginDto)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is missing', () => {
      const loginDto = {
        username: 'testuser',
        password: '',
      };

      expect(() => controller.login(loginDto)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when credentials are invalid', () => {
      const loginDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      mockAuthService.validateUser.mockReturnValue(null);

      expect(() => controller.login(loginDto)).toThrow(
        UnauthorizedException,
      );
    });
  });
});
