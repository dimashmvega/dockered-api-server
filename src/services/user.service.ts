import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/entities/user.entity";
import { CreationUserDto } from "src/interfaces/creation-user.interfaces";
import { Repository } from "typeorm";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) { }

    async createUser(userDto: CreationUserDto): Promise<string> {
        try {
            const user = this.userRepository.create(userDto);
            await this.userRepository.save(user);
            return 'User created successfully';
        } catch (error) {
            if(error instanceof Error) {
                console.error('Error creating user:', error.message);
            } else {
                console.error('An unexpected user creation error occurred:', error);
            }            
            throw new Error('User creation failed');
        }
    }

    async validateUser(username: string, password: string): Promise<UserEntity | null> {
        const user = await this.userRepository.findOne({ where: { username, password } });
        return user || null;
    }
}