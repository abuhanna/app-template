import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
  ) {}

  findAll(): Promise<Department[]> {
    return this.departmentsRepository.find();
  }

  async findOne(id: number): Promise<Department> {
    const dept = await this.departmentsRepository.findOneBy({ id });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  create(department: Partial<Department>): Promise<Department> {
    const newDept = this.departmentsRepository.create(department);
    return this.departmentsRepository.save(newDept);
  }

  async update(id: number, department: Partial<Department>): Promise<Department> {
    await this.findOne(id);
    await this.departmentsRepository.update(id, department);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.departmentsRepository.delete(id);
  }
}
