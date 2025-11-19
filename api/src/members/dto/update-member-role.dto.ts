import { IsEnum } from 'class-validator';

export class UpdateMemberRoleDto {
  @IsEnum(['READER', 'WRITER'])
  role: 'READER' | 'WRITER';
}
