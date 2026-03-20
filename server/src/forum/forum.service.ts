import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ForumPost, Prisma } from '@prisma/client';

export type CreateForumPostDto = {
  groupId: string;
  title: string;
  content: string;
  authorId?: string;
  authorName?: string;
};

@Injectable()
export class ForumService {
  constructor(private prisma: PrismaService) {}

  async findMany(groupId?: string) {
    return this.prisma.forumPost.findMany({
      where: groupId ? { groupId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        group: { select: { id: true, name: true } },
      },
    });
  }

  async create(data: CreateForumPostDto): Promise<ForumPost> {
    return this.prisma.forumPost.create({
      data: {
        groupId: data.groupId,
        title: data.title,
        content: data.content,
        authorId: data.authorId ?? null,
        authorName: data.authorName ?? null,
      },
      include: {
        group: { select: { id: true, name: true } },
      },
    });
  }
}
