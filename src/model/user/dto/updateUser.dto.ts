import { IsEmail, IsNumber, IsPhoneNumber, IsString } from "class-validator";

export class UpdateUserDto{

    @IsNumber()
    user_id: number;

    @IsEmail()
    email: string;

    @IsString()
    username: string;

    @IsString()
    password: string;

    @IsString()
    first_name: string;

    @IsString()
    last_name: string;

    @IsPhoneNumber('EG')
    phone_number: string;

}