import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DepartmentsService } from '../services/departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto, DepartmentResponseDto } from '../dtos/department.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

class DepartmentQueryDto extends PaginationQueryDto {
  isActive?: string;
}

@ApiTags('Departments')
@Controller('departments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth('JWT-auth')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all departments with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of departments' })
  @ResponseMessage('Departments retrieved successfully')
  async findAll(
    @Query() query: DepartmentQueryDto,
  ): Promise<PaginatedResult<DepartmentResponseDto>> {
    const isActive =
      query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined;

    return this.departmentsService.findAllPaginated(
      query.page ?? 1,
      query.pageSize ?? 10,
      query.sortBy,
      query.sortOrder,
      query.search,
      isActive,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiResponse({ status: 200, description: 'Department found' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ResponseMessage('Department retrieved successfully')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<DepartmentResponseDto> {
    return this.departmentsService.findOne(id);
  }

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a department' })
  @ApiResponse({ status: 201, description: 'Department created' })
  @ResponseMessage('Department created successfully')
  async create(@Body() dto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    return this.departmentsService.create(dto);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a department' })
  @ApiResponse({ status: 200, description: 'Department updated' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ResponseMessage('Department updated successfully')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    return this.departmentsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a department' })
  @ApiResponse({ status: 204, description: 'Department deleted' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.departmentsService.remove(id);
  }
}
