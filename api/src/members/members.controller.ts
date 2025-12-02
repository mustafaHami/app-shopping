import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';

@Controller('members')
@UseGuards(AuthGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  // Get members and invitations for a list
  @Get('lists/:listId')
  getListMembers(@Param('listId') listId: string, @CurrentUser() user: CurrentUserData) {
    return this.membersService.getListMembers(listId, user.id);
  }

  // Search user by pseudonym
  @Get('search')
  searchUser(@Query('pseudonym') pseudonym: string) {
    return this.membersService.searchUserByPseudonym(pseudonym);
  }

  // Send invitation
  @Post('lists/:listId/invitations')
  sendInvitation(
    @Param('listId') listId: string,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateInvitationDto,
  ) {
    return this.membersService.sendInvitation(listId, user.id, dto);
  }

  // Update member role
  @Patch('lists/:listId/members/:memberId')
  updateMemberRole(
    @Param('listId') listId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.membersService.updateMemberRole(listId, memberId, user.id, dto);
  }

  // Remove member
  @Delete('lists/:listId/members/:memberId')
  removeMember(
    @Param('listId') listId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.membersService.removeMember(listId, memberId, user.id);
  }

  // Get my invitations
  @Get('invitations')
  getMyInvitations(@CurrentUser() user: CurrentUserData) {
    return this.membersService.getMyInvitations(user.id);
  }

  // Accept or decline invitation
  @Patch('invitations/:invitationId')
  updateInvitation(
    @Param('invitationId') invitationId: string,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdateInvitationDto,
  ) {
    return this.membersService.updateInvitation(invitationId, user.id, dto);
  }

  // Cancel invitation
  @Delete('lists/:listId/invitations/:invitationId')
  cancelInvitation(
    @Param('listId') listId: string,
    @Param('invitationId') invitationId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.membersService.cancelInvitation(listId, invitationId, user.id);
  }
}
