import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.repository.find({ relations: ['department'] });
  }

  async findById(id: number): Promise<User | null> {
    return this.repository.findOne({ where: { id }, relations: ['department'] });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email }, relations: ['department'] });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({ where: { username }, relations: ['department'] });
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

  getRepository(): Repository<User> {
    return this.repository;
  }
}
