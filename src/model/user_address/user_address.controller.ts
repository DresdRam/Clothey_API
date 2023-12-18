import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { UserAddressService } from './user_address.service';
import { CreateAddressDto } from './dto/createAddress.dto';
import { UpdateAddressDto } from './dto/updateAddress.dto';

@Controller('addresses')
export class UserAddressController {

    constructor(private readonly userAddressService: UserAddressService) { }

    @Post('create')
    createUserAddress(@Body() body: CreateAddressDto) {
        return this.userAddressService.createAddress(body);
    }

    @Get('get-addresses')
    getUserAddresses(@Query('user_id') user_id: number) {
        return this.userAddressService.findAllUserAddresses(user_id);
    }

    @Put('update')
    updateUserAddress(@Body() body: UpdateAddressDto) {
        return this.userAddressService.updateUserAddress(body);
    }

}
