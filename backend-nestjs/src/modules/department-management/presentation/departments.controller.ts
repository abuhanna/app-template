import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/modules/user-management/domain/value-objects/user-role';
import { DepartmentDto, CreateDepartmentDto, UpdateDepartmentDto } from '../application/dto';
import {
  CreateDepartmentCommand,
  UpdateDepartmentCommand,
  DeleteDepartmentCommand,
} from '../application/commands';
import { GetDepartmentsQuery, GetDepartmentByIdQuery } from '../application/queries';

@ApiTags('Departments')
@Controller('departments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DepartmentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ status: 200, type: [DepartmentDto] })
  async findAll(): Promise<DepartmentDto[]> {
    return this.queryBus.execute(new GetDepartmentsQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiResponse({ status: 200, type: DepartmentDto })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<DepartmentDto> {
    return this.queryBus.execute(new GetDepartmentByIdQuery(id));
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Create new department (Admin only)' })
  @ApiResponse({ status: 201, type: DepartmentDto })
  @ApiResponse({ status: 409, description: 'Department code already in use' })
  async create(@Body() dto: CreateDepartmentDto): Promise<DepartmentDto> {
    return this.commandBus.execute(
      new CreateDepartmentCommand(dto.name, dto.code, dto.description),
    );
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Update department (Admin only)' })
  @ApiResponse({ status: 200, type: DepartmentDto })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentDto,
  ): Promise<DepartmentDto> {
    return this.commandBus.execute(
      new UpdateDepartmentCommand(id, dto.name, dto.code, dto.description, dto.isActive),
    );
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete department (Admin only)' })
  @ApiResponse({ status: 204, description: 'Department deleted' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({ status: 400, description: 'Department has assigned users' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.commandBus.execute(new DeleteDepartmentCommand(id));
  }
}
