import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdatePaymentDto{

    @IsNumber()
    payment_id: number;

    @IsNumber()
    payment_type_id: number;

    @IsString()
    provider: string;

    @IsNumber()
    account_number: number;

    @IsDateString({ strict: false, strictSeparator: false })
    expiry_date: string;

    @IsBoolean()
    @IsOptional()
    is_default: boolean = false;

}