import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '@/common/decorators/current-user.decorator';
import { PaginationQueryDto } from '@/common/dto';
import { PagedResult } from '@/common/types/paginated';
import { UserRole } from '../domain/value-objects/user-role';
import { UserDto, CreateUserDto, UpdateUserDto, ChangePasswordDto } from '../application/dto';
import {
  CreateUserCommand,
  UpdateUserCommand,
  DeleteUserCommand,
  ChangePasswordCommand,
} from '../application/commands';
import { GetUsersQuery, GetUserByIdQuery } from '../application/queries';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Get all users with pagination (Admin only)' })
  @ApiResponse({ status: 200, description: 'Paginated list of users' })
  async findAll(@Query() queryDto: PaginationQueryDto): Promise<PagedResult<UserDto>> {
    return this.queryBus.execute(
      new GetUsersQuery(
        queryDto.page,
        queryDto.pageSize,
        queryDto.sortBy,
        queryDto.sortDir,
        queryDto.search,
      ),
    );
  }

  @Get(':id')
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({ status: 200, type: UserDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserDto> {
    return this.queryBus.execute(new GetUserByIdQuery(id));
  }

  @Post()
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Create new user (Admin only)' })
  @ApiResponse({ status: 201, type: UserDto })
  @ApiResponse({ status: 409, description: 'Email or username already in use' })
  async create(@Body() dto: CreateUserDto): Promise<UserDto> {
    return this.commandBus.execute(
      new CreateUserCommand(
        dto.email,
        dto.username,
        dto.password,
        dto.firstName,
        dto.lastName,
        dto.role,
        dto.departmentId,
      ),
    );
  }

  @Put(':id')
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Update user (Admin only)' })
  @ApiResponse({ status: 200, type: UserDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.commandBus.execute(
      new UpdateUserCommand(
        id,
        dto.email,
        dto.username,
        dto.firstName,
        dto.lastName,
        dto.role,
        dto.departmentId,
        dto.isActive,
      ),
    );
  }

  @Delete(':id')
  @Roles(UserRole.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.commandBus.execute(new DeleteUserCommand(id));
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change current user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  async changePassword(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    await this.commandBus.execute(
      new ChangePasswordCommand(user.sub, dto.currentPassword, dto.newPassword),
    );
    return { message: 'Password changed successfully' };
  }
}
