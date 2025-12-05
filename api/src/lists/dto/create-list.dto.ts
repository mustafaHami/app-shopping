import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class InvitationItem {
  @IsString()
  inviteePseudonym: string;

  @IsEnum(['READER', 'WRITER'])
  role: 'READER' | 'WRITER';
}

export class CreateListDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvitationItem)
  invitations?: InvitationItem[];
}
