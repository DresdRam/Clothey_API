import { Module } from '@nestjs/common';
import { UserAddressService } from './user_address.service';
import { UserAddressController } from './user_address.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAddress } from './entity/userAddress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserAddress])],
  providers: [UserAddressService],
  controllers: [UserAddressController]
})
export class UserAddressModule {}
