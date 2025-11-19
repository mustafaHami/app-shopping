import { IsEmail, IsEnum } from 'class-validator';

export class CreateInvitationDto {
  @IsEmail()
  inviteeEmail: string;

  @IsEnum(['READER', 'WRITER'])
  role: 'READER' | 'WRITER';
}
