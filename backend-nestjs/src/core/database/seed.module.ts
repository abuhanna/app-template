import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { UserOrmEntity } from '../../modules/user-management/infrastructure/persistence/user.orm-entity';
import { DepartmentOrmEntity } from '../../modules/department-management/infrastructure/persistence/department.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity, DepartmentOrmEntity]),
  ],
  providers: [SeedService],
})
export class SeederModule {}
