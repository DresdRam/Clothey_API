import { IsEmail, IsNumber, IsOptional, IsPhoneNumber, IsPositive, IsString } from "class-validator";

export class PatchUpdateUserDto{

    // @IsNumber()
    // @IsPositive()
    // user_id: number;

    @IsEmail()
    @IsOptional()
    email: string;

    @IsString()
    @IsOptional()
    password: string;

    @IsString()
    @IsOptional()
    first_name: string;

    @IsString()
    @IsOptional()
    last_name: string;

    @IsPhoneNumber('EG')
    @IsOptional()
    phone_number: string;

}