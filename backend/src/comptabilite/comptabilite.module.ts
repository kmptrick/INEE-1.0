import { Module } from '@nestjs/common';
import { ComptabiliteController } from './comptabilite.controller';
import { ComptabiliteService } from './comptabilite.service';

@Module({
  controllers: [ComptabiliteController],
  providers: [ComptabiliteService],
  exports: [ComptabiliteService],
})
export class ComptabiliteModule {}
