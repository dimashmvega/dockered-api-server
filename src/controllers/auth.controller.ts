import { Controller, Post, Body, UnauthorizedException, HttpCode } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ApiBody, ApiResponse } from '@nestjs/swagger';

interface LoginDto {
    username: string;
    password: string;
}

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                username: { type: 'string' },
                password: { type: 'string' },
            },
            required: ['username', 'password'],
        },
    })
    @ApiResponse({ status: 201, description: 'User logged in successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @HttpCode(200)
    async login(@Body() loginDto: LoginDto) {        
        if(!loginDto) {
            throw new UnauthorizedException('Login data is required');
        }
        if(!loginDto.username || !loginDto.password) {
            throw new UnauthorizedException('Username and password are required');
        }        
        const user = await this.authService.validateUser(
            loginDto.username, 
            loginDto.password
        );
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }        
        return this.authService.login(user);
    }
}