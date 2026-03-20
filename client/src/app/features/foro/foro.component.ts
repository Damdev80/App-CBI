import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ForumService, ForumPost, CreateForumPostDto } from '@app/core/services/forum.service';
import { GroupsService } from '@app/core/services/groups.service';

@Component({
  selector: 'app-foro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './foro.component.html',
})
export class ForoComponent implements OnInit {
  private forumService = inject(ForumService);
  private groupsService = inject(GroupsService);
  private fb = inject(FormBuilder);

  posts = signal<ForumPost[]>([]);
  groups = signal<{ id: string; name: string }[]>([]);
  selectedGroupId = signal<string | null>(null);
  isLoading = signal(true);
  showModal = signal(false);
  saving = signal(false);
  errorMsg = signal('');
  successMsg = signal('');

  form = this.fb.group({
    groupId: ['', Validators.required],
    title: ['', [Validators.required, Validators.maxLength(255)]],
    content: ['', Validators.required],
    authorName: [''],
  });

  ngOnInit() {
    this.loadGroups();
    this.loadPosts();
  }

  loadGroups() {
    this.groupsService.getAllGroups().subscribe({
      next: (list) =>
        this.groups.set(
          (list || []).map((g: any) => ({ id: g.id, name: g.name || g.id }))
        ),
      error: () => {},
    });
  }

  loadPosts() {
    this.isLoading.set(true);
    const groupId = this.selectedGroupId();
    this.forumService.getPosts(groupId || undefined).subscribe({
      next: (list) => {
        this.posts.set(list || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  onFilterChange(value: string) {
    this.selectedGroupId.set(value === '' ? null : value);
    this.loadPosts();
  }

  openModal() {
    this.form.reset();
    this.errorMsg.set('');
    this.successMsg.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const data: CreateForumPostDto = {
      groupId: v.groupId!,
      title: v.title!,
      content: v.content!,
    };
    if (v.authorName?.trim()) data.authorName = v.authorName.trim();
    this.saving.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');
    this.forumService.createPost(data).subscribe({
      next: () => {
        this.successMsg.set('Publicación creada.');
        this.loadPosts();
        this.saving.set(false);
        setTimeout(() => {
          this.closeModal();
        }, 800);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Error al crear la publicación.');
        this.saving.set(false);
      },
    });
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
