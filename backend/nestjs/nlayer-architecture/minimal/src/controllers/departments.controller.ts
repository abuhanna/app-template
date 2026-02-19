import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { DepartmentsService } from '../services/departments.service';
import { Department } from '../entities/department.entity';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  findAll(): Promise<Department[]> {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Department> {
    return this.departmentsService.findOne(+id);
  }

  @Post()
  create(@Body() department: Partial<Department>): Promise<Department> {
    return this.departmentsService.create(department);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() department: Partial<Department>): Promise<Department> {
    return this.departmentsService.update(+id, department);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.departmentsService.remove(+id);
  }
}
