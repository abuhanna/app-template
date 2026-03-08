import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { UserOrmEntity } from '../../modules/user-management/infrastructure/persistence/user.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity]),
  ],
  providers: [SeedService],
})
export class SeederModule {}
