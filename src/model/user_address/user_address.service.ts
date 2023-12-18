import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAddress } from './entity/userAddress.entity';
import { Repository } from 'typeorm';
import { CreateAddressDto } from './dto/createAddress.dto';
import { User } from '../user/entity/user.entity';
import { Governorate } from '../governorate/entity/governorate.entity';
import { UpdateAddressDto } from './dto/updateAddress.dto';

@Injectable()
export class UserAddressService {

    constructor(@InjectRepository(UserAddress) private readonly userAddressRepo: Repository<UserAddress>) { }


    async findAllUserAddresses(user_id: number) {
        return await  this.userAddressRepo.createQueryBuilder()
        .select()
        .where('user_id = :user_id', { user_id: user_id })
        .getMany();
    }

    async createAddress(insertAddress: CreateAddressDto) {

        const user = new User()
        user.id = insertAddress.user_id

        const governorate = new Governorate()
        governorate.id = insertAddress.governorate_id

        const results = await this.userAddressRepo.createQueryBuilder()
        .insert()
        .into(UserAddress)
        .values([
            { user: user, governorate: governorate, address_line1: insertAddress.address_line1, address_line2: insertAddress.address_line2, postal_code: insertAddress.postal_code }
        ])
        .execute()

        if(!results) {
            throw new HttpException("Could not create address!", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return {
            statusCode: HttpStatus.CREATED,
            message: "Created Address Successfuly."
        }

    }

    async updateUserAddress(updateAddress: UpdateAddressDto) {

        const governorate = new Governorate()
        governorate.id = updateAddress.governorate_id

        const results = await this.userAddressRepo.createQueryBuilder()
        .update(UserAddress)
        .set({
            governorate: governorate,
            address_line1: updateAddress.address_line1,
            address_line2: updateAddress.address_line2,
            postal_code: updateAddress.postal_code
        })
        .where('id = :address_id', { address_id: updateAddress.address_id })
        .execute()

        if(!results) {
            throw new HttpException("Could not update address!", HttpStatus.INTERNAL_SERVER_ERROR)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Address updated successfuly."
        }
    }

}
