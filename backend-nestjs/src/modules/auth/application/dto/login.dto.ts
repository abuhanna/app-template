import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'johndoe', description: 'Username or email' })
  @IsString()
  @IsNotEmpty()
  usernameOrEmail: string;

  @ApiProperty({ example: 'password123', description: 'Password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
