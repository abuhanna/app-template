import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto, DepartmentResponseDto } from './dtos/department.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Departments')
@Controller('departments')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all departments with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of departments' })
  @ResponseMessage('Departments retrieved successfully')
  async findAll(
    @Query() query: PaginationQueryDto,
    @Query('isActive') isActive?: string,
  ): Promise<PaginatedResult<DepartmentResponseDto>> {
    return this.departmentsService.findAll(query, isActive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiResponse({ status: 200, description: 'Department found' })
  @ResponseMessage('Department retrieved successfully')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<DepartmentResponseDto> {
    return this.departmentsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new department (admin only)' })
  @ApiResponse({ status: 201, description: 'Department created' })
  @ResponseMessage('Department created successfully')
  async create(@Body() dto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    return this.departmentsService.create(dto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update a department (admin only)' })
  @ApiResponse({ status: 200, description: 'Department updated' })
  @ResponseMessage('Department updated successfully')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    return this.departmentsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a department (admin only)' })
  @ApiResponse({ status: 204, description: 'Department deleted' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.departmentsService.remove(id);
  }
}
