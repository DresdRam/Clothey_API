import { IsDecimal, IsNumber, IsPositive, IsString, Matches } from "class-validator";

export class PlaceOrderDto {

    @IsNumber()
    @IsPositive()
    user_id: number;

    @IsNumber()
    @IsPositive()
    payment_method_id: number;
    
    @IsNumber()
    @IsPositive()
    shipping_address_id: number;
  
    @IsNumber()
    @IsPositive()
    shipping_method_id: number;

}