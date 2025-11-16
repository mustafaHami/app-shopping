import { IsOptional, IsString, ValidateIf } from 'class-validator';

export class UpdateListDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @ValidateIf(o => o.description !== undefined && o.description !== '')
  @IsString()
  description?: string;
}
