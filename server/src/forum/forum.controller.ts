import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ForumService, CreateForumPostDto } from './forum.service';

@Controller('forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Get('posts')
  async getPosts(@Query('groupId') groupId?: string) {
    return this.forumService.findMany(groupId || undefined);
  }

  @Post('posts')
  async createPost(@Body() body: CreateForumPostDto) {
    return this.forumService.create(body);
  }
}
