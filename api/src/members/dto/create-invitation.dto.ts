import { IsString, IsEnum } from 'class-validator';

export class CreateInvitationDto {
  @IsString()
  inviteePseudonym: string;

  @IsEnum(['READER', 'WRITER'])
  role: 'READER' | 'WRITER';
}
