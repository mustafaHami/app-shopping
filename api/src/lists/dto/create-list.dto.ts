import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateListDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
