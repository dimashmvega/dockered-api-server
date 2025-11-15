import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryColumn, Column, DeleteDateColumn } from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity {
    @ApiProperty({ example: 'john_doe', description: 'The unique username of the user' })        
    @PrimaryColumn({ type: 'varchar', length: 50 })
    username: string;

    @ApiProperty({ example: 'strongPassword123', description: 'The password of the user' })
    @Column({ type: 'varchar' })
    password: string;

    @ApiProperty({ example: 'john.doe@example.com', description: 'The email address of the user', required: false })
    @Column({ type: 'varchar', nullable: true })
    email?: string;

    @ApiProperty({ example: 'admin', description: 'The role of the user', required: false })
    @Column({ type: 'varchar', nullable: true })
    rol?: string;
}