import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';
import { User } from '../users/user.entity';
import { CreateDepartmentDto, UpdateDepartmentDto, DepartmentResponseDto } from './dtos/department.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentsRepository: Repository<Department>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(
    query: PaginationQueryDto,
    isActive?: string,
  ): Promise<PaginatedResult<DepartmentResponseDto>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const qb = this.departmentsRepository.createQueryBuilder('dept');

    if (query.search) {
      qb.andWhere(
        '(dept.name ILIKE :search OR dept.code ILIKE :search OR dept.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (isActive !== undefined && isActive !== '') {
      qb.andWhere('dept.isActive = :isActive', { isActive: isActive === 'true' });
    }

    const validSortFields = ['id', 'code', 'name', 'isActive', 'createdAt'];
    const sortField = query.sortBy && validSortFields.includes(query.sortBy) ? query.sortBy : 'createdAt';
    const direction = query.sortOrder === 'asc' ? 'ASC' : 'DESC';
    qb.orderBy(`dept.${sortField}`, direction);

    const totalItems = await qb.getCount();
    qb.skip((page - 1) * pageSize).take(pageSize);
    const departments = await qb.getMany();

    const dtos = await Promise.all(departments.map(d => this.mapToDto(d)));

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: dtos,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  async findOne(id: number): Promise<DepartmentResponseDto> {
    const dept = await this.departmentsRepository.findOneBy({ id });
    if (!dept) throw new NotFoundException('Department not found');
    return this.mapToDto(dept);
  }

  async create(dto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    const existing = await this.departmentsRepository.findOneBy({ code: dto.code });
    if (existing) {
      throw new ConflictException('Department code already exists');
    }

    const newDept = this.departmentsRepository.create({
      code: dto.code,
      name: dto.name,
      description: dto.description || null,
    });
    const saved = await this.departmentsRepository.save(newDept);
    return this.mapToDto(saved);
  }

  async update(id: number, dto: UpdateDepartmentDto): Promise<DepartmentResponseDto> {
    const dept = await this.departmentsRepository.findOneBy({ id });
    if (!dept) throw new NotFoundException('Department not found');

    if (dto.code !== undefined && dto.code !== dept.code) {
      const existing = await this.departmentsRepository.findOneBy({ code: dto.code });
      if (existing) {
        throw new ConflictException('Department code already exists');
      }
    }

    const updateData: Partial<Department> = {};
    if (dto.code !== undefined) updateData.code = dto.code;
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    await this.departmentsRepository.update(id, updateData);
    const updated = await this.departmentsRepository.findOneBy({ id });
    return this.mapToDto(updated!);
  }

  async remove(id: number): Promise<void> {
    const dept = await this.departmentsRepository.findOneBy({ id });
    if (!dept) throw new NotFoundException('Department not found');
    await this.departmentsRepository.delete(id);
  }

  private async mapToDto(dept: Department): Promise<DepartmentResponseDto> {
    const userCount = await this.usersRepository.count({
      where: { departmentId: dept.id },
    });

    return {
      id: dept.id,
      code: dept.code,
      name: dept.name,
      description: dept.description || null,
      isActive: dept.isActive,
      userCount,
      createdAt: dept.createdAt.toISOString(),
      updatedAt: dept.updatedAt ? dept.updatedAt.toISOString() : null,
    };
  }
}
