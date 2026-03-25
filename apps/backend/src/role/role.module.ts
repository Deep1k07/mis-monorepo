import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRole, UserRoleSchema } from './schema/role.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserRole.name, schema: UserRoleSchema },
    ]),
  ],
  providers: [RoleService],
  controllers: [RoleController]
})
export class RoleModule { }
