import { IsEmail, IsString } from "class-validator";

export class UserSignUpDto{

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

    @IsString()
    phone_number: string;

}