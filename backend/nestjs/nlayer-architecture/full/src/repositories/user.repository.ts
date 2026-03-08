import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findAllPaginated(
    page: number,
    pageSize: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    search?: string,
    isActive?: boolean,
    departmentId?: number,
  ): Promise<PaginatedResult<User>> {
    const queryBuilder = this.repository.createQueryBuilder('user');
    queryBuilder.leftJoinAndSelect('user.department', 'department');

    if (search) {
      queryBuilder.andWhere(
        '(user.username ILIKE :search OR user.email ILIKE :search OR user.first_name ILIKE :search OR user.last_name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('user.is_active = :isActive', { isActive });
    }

    if (departmentId !== undefined) {
      queryBuilder.andWhere('user.department_id = :departmentId', { departmentId });
    }

    const validSortFields = ['id', 'username', 'email', 'role', 'createdAt', 'isActive'];
    const sortField = sortBy && validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const direction = sortOrder === 'asc' ? 'ASC' : 'DESC';
    queryBuilder.orderBy(`user.${sortField}`, direction);

    const totalItems = await queryBuilder.getCount();
    queryBuilder.skip((page - 1) * pageSize).take(pageSize);
    const items = await queryBuilder.getMany();

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: items,
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

  async findById(id: number): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['department'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
      relations: ['department'],
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({
      where: { username },
      relations: ['department'],
    });
  }

  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    return this.repository.findOne({
      where: [{ email: identifier }, { username: identifier }],
      relations: ['department'],
    });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.repository.create(user);
    const saved = await this.repository.save(newUser);
    return this.findById(saved.id) as Promise<User>;
  }

  async update(id: number, data: Partial<User>): Promise<User | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findAll(): Promise<User[]> {
    return this.repository.find({ relations: ['department'] });
  }
}
