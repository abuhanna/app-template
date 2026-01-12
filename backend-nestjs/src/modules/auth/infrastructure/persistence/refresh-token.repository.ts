import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { RefreshTokenOrmEntity } from './refresh-token.orm-entity';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.repository.interface';

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenOrmEntity)
    private readonly repository: Repository<RefreshTokenOrmEntity>,
  ) {}

  async findByToken(token: string): Promise<RefreshToken | null> {
    const entity = await this.repository.findOne({ where: { token } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByUserId(userId: number): Promise<RefreshToken[]> {
    const entities = await this.repository.find({
      where: { userId: userId.toString() },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async save(refreshToken: RefreshToken): Promise<RefreshToken> {
    const entity = this.toEntity(refreshToken);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async revokeByToken(token: string): Promise<void> {
    await this.repository.update({ token }, { isRevoked: true, revokedAt: new Date() });
  }

  async revokeAllByUserId(userId: number): Promise<void> {
    await this.repository.update(
      { userId: userId.toString(), isRevoked: false },
      { isRevoked: true, revokedAt: new Date() },
    );
  }

  async deleteExpired(): Promise<void> {
    await this.repository.delete({
      expiresAt: LessThan(new Date()),
    });
  }

  private toDomain(entity: RefreshTokenOrmEntity): RefreshToken {
    return RefreshToken.reconstitute(
      parseInt(entity.id, 10),
      parseInt(entity.userId, 10),
      entity.token,
      entity.expiresAt,
      entity.deviceInfo,
      entity.ipAddress,
      entity.isRevoked,
      entity.revokedAt,
      entity.replacedByToken,
      entity.createdAt,
    );
  }

  private toEntity(refreshToken: RefreshToken): RefreshTokenOrmEntity {
    const entity = new RefreshTokenOrmEntity();
    if (refreshToken.id !== 0) {
      entity.id = refreshToken.id.toString();
    }
    entity.userId = refreshToken.userId.toString();
    entity.token = refreshToken.token;
    entity.expiresAt = refreshToken.expiresAt;
    entity.deviceInfo = refreshToken.deviceInfo;
    entity.ipAddress = refreshToken.ipAddress;
    entity.isRevoked = refreshToken.isRevoked;
    entity.revokedAt = refreshToken.revokedAt;
    entity.replacedByToken = refreshToken.replacedByToken;
    entity.createdAt = refreshToken.createdAt;
    return entity;
  }
}
