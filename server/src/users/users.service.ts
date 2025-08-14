import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getUsers(): string[] {
    return ['User1', 'User2', 'User3'];
  }
}
