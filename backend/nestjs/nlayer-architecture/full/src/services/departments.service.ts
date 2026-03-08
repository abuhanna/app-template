import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
import { CreateDepartmentDto, UpdateDepartmentDto, DepartmentResponseDto } from '../dtos/department.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
  ) {}

  async findAllPaginated(
    page: number,
    pageSize: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    search?: string,
    isActive?: boolean,
  ): Promise<PaginatedResult<DepartmentResponseDto>> {
    const queryBuilder = this.departmentsRepository.createQueryBuilder('dept');
    queryBuilder.loadRelationCountAndMap('dept.userCount', 'dept.users');

    if (search) {
      queryBuilder.andWhere(
        '(dept.name ILIKE :search OR dept.code ILIKE :search OR dept.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('dept.is_active = :isActive', { isActive });
    }

    const validSortFields = ['id', 'name', 'code', 'createdAt', 'isActive'];
    const sortField = sortBy && validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const direction = sortOrder === 'asc' ? 'ASC' : 'DESC';
    queryBuilder.orderBy(`dept.${sortField}`, direction);

    const totalItems = await queryBuilder.getCount();
    queryBuilder.skip((page - 1) * pageSize).take(pageSize);
    const items = await queryBuilder.getMany();

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: items.map((dept) => this.mapToDto(dept)),
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
    const dept = await this.departmentsRepository.findOne({
      where: { id },
      relations: ['users'],
    });
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
      description: dto.description ?? undefined,
    });
    const saved = await this.departmentsRepository.save(newDept);
    return this.mapToDto({ ...saved, users: [] } as any);
  }

  async update(id: number, dto: UpdateDepartmentDto): Promise<DepartmentResponseDto> {
    const existing = await this.departmentsRepository.findOneBy({ id });
    if (!existing) throw new NotFoundException('Department not found');

    if (dto.code && dto.code !== existing.code) {
      const dup = await this.departmentsRepository.findOneBy({ code: dto.code });
      if (dup) throw new ConflictException('Department code already exists');
    }

    const updateData: Partial<Department> = {};
    if (dto.code !== undefined) updateData.code = dto.code;
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    await this.departmentsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.departmentsRepository.findOneBy({ id });
    if (!existing) throw new NotFoundException('Department not found');
    await this.departmentsRepository.delete(id);
  }

  async findAll(): Promise<Department[]> {
    return this.departmentsRepository.find({ relations: ['users'] });
  }

  private mapToDto(dept: any): DepartmentResponseDto {
    return {
      id: dept.id,
      code: dept.code,
      name: dept.name,
      description: dept.description || null,
      isActive: dept.isActive,
      userCount: dept.userCount ?? dept.users?.length ?? 0,
      createdAt: dept.createdAt?.toISOString(),
      updatedAt: dept.updatedAt ? dept.updatedAt.toISOString() : null,
    };
  }
}
