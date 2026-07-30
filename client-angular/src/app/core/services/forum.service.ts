import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ForumPost {
  id: string;
  groupId: string;
  title: string;
  content: string;
  authorId: string | null;
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
  group: { id: string; name: string };
}

export interface CreateForumPostDto {
  groupId: string;
  title: string;
  content: string;
  authorName?: string;
}

@Injectable({ providedIn: 'root' })
export class ForumService {
  private apiUrl = environment.apiUrl + '/forum';

  constructor(private http: HttpClient) {}

  getPosts(groupId?: string): Observable<ForumPost[]> {
    let params = new HttpParams();
    if (groupId) params = params.set('groupId', groupId);
    return this.http.get<ForumPost[]>(`${this.apiUrl}/posts`, { params });
  }

  createPost(data: CreateForumPostDto): Observable<ForumPost> {
    return this.http.post<ForumPost>(`${this.apiUrl}/posts`, data);
  }
}
