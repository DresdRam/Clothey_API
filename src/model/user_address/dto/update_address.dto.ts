import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateAddressDto{
    
    @IsNumber()
    address_id: number;

    @IsNumber()
    governorate_id: number;

    @IsString()
    address_line1: string;

    @IsString()
    @IsOptional()
    address_line2: string;

    @IsString()
    postal_code: string;

}