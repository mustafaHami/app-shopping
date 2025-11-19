import { IsEnum } from 'class-validator';

export class UpdateInvitationDto {
  @IsEnum(['ACCEPTED', 'DECLINED'])
  status: 'ACCEPTED' | 'DECLINED';
}
