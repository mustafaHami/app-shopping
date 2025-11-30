import { IsNumber, Min } from 'class-validator';

export class UpdateItemQuantityDto {
  @IsNumber()
  @Min(0)
  quantity: number;
}
