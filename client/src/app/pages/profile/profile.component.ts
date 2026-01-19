
import { inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from "@angular/forms";
import { Signal, signal } from "@angular/core";
import { profileService, UserProfile, Gender, Dicipules } from "../../core/services/profile.service";
import { HttpClientModule } from "@angular/common/http";
import { MembersService } from '../../core/services/members.service';
import { GroupsService } from '../../core/services/groups.service';

export interface GroupInfo {
  groupId: string;
  groupName: string;
  levelDicipules: string;
}

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule],
    templateUrl: './profile.component.html',
})
export class Profile implements OnInit {
    getGroupLevel(groupId: string): string | null {
        const group = this.groupList().find((g: GroupInfo) => g.groupId === groupId);
        return group ? group.levelDicipules : null;
    }
    private router = inject(Router);
    private fb = inject(FormBuilder);
    private profileService = inject(profileService);
    private membersService = inject(MembersService);
    private groupsService = inject(GroupsService);

    profileForm: FormGroup;
    showGroupsModal = false;
    isLoading = signal(false);
    errorMessage = signal('');
    successMessage = signal('');
    genderOptions = Object.values(Gender);
    dicipulesOptions = Object.values(Dicipules);
    groupList = signal<GroupInfo[]>([]);
    groupLoading = signal(false);
    allGroups = signal<any[]>([]);
    allGroupsLoading = signal(false);

    constructor() {
        this.profileForm = this.fb.group({
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            number: [''],
            address: [''],
            happybirth: [''],
            gender: [''],
            baptized: [false],
            isActive: [true],
            role: [''],
            age: [null],
            hobbies: [''],
            dreams: [''],
            job: [''],
            vulnerable_area: [''],
            levelDicipules: [''],
        });
    }

    ngOnInit() {
        this.isLoading.set(true);
        this.profileService.getProfile().subscribe({
            next: (profile) => {
                if (profile.happybirth) {
                    profile.happybirth = profile.happybirth.split('T')[0];
                }
                this.profileForm.patchValue(profile);
                this.isLoading.set(false);
                // Asegurarse de que el id esté en el form
                if (profile.id) {
                    this.profileForm.addControl('id', this.fb.control(profile.id));
                }
                this.loadGroups();
                this.loadAllGroups();
            },
            error: (err) => {
                this.errorMessage.set('Error al cargar el perfil');
                this.isLoading.set(false);
            }
        });
    }

    loadAllGroups() {
        this.allGroupsLoading.set(true);
        this.groupsService.getAllGroups().subscribe({
            next: (groups) => {
                this.allGroups.set(groups);
                this.allGroupsLoading.set(false);
            },
            error: () => {
                this.allGroups.set([]);
                this.allGroupsLoading.set(false);
            }
        });
    }

    joinGroup(groupId: string) {
        const userId = this.profileForm.get('id')?.value;
        if (!userId) return;
        this.membersService.createMember({ userId, groupId, levelDicipules: 'III' }).subscribe({
            next: () => {
                this.successMessage.set('Te uniste al grupo');
                this.loadGroups();
            },
            error: () => {
                this.errorMessage.set('Error al unirse al grupo');
            }
        });
    }

    loadGroups() {
        this.groupLoading.set(true);
        const userId = this.profileForm.get('id')?.value;
        if (!userId) {
            this.groupList.set([]);
            this.groupLoading.set(false);
            return;
        }
        this.membersService.getGroupsByUserId(userId).subscribe({
            next: (groups: any[]) => {
                this.groupList.set(Array.isArray(groups) ? groups.map(g => ({
                    groupId: g.groupId,
                    groupName: g.group?.name || g.groupId,
                    levelDicipules: g.levelDicipules
                })) : []);
                this.groupLoading.set(false);
            },
            error: () => {
                this.groupList.set([]);
                this.groupLoading.set(false);
            }
        });
    }

    onSubmit() {
        if (this.profileForm.invalid) {
            this.profileForm.markAllAsTouched();
            return;
        }
        this.isLoading.set(true);
        this.errorMessage.set('');
        this.successMessage.set('');
        // Convertir fecha a ISO string si existe
        const formValue = { ...this.profileForm.value };
        if (formValue.happybirth) {
            formValue.happybirth = new Date(formValue.happybirth).toISOString();
        }
        this.profileService.updateProfile(formValue).subscribe({
            next: (profile) => {
                this.successMessage.set('Perfil actualizado correctamente');
                this.isLoading.set(false);
            },
            error: (err) => {
                this.errorMessage.set('Error al actualizar el perfil');
                this.isLoading.set(false);
            }
        });
    }

    updateLevel(userId: string, groupId: string, newLevel: string) {
        this.membersService.updateLevelDicipules(userId, groupId, newLevel).subscribe({
            next: () => {
                this.successMessage.set('Nivel actualizado');
                this.loadGroups();
            },
            error: () => {
                this.errorMessage.set('Error al actualizar nivel');
            }
        });
    }

    leaveGroup(userId: string, groupId: string) {
        this.membersService.leaveGroup(userId, groupId).subscribe({
            next: () => {
                this.successMessage.set('Saliste del grupo');
                this.loadGroups();
            },
            error: () => {
                this.errorMessage.set('Error al salir del grupo');
            }
        });
    }

    navegateTo(path: string) {
        this.router.navigate([path]);
    }

    isMemberOfGroup(groupId: string): boolean {
        const list = this.groupList();
        return Array.isArray(list) && list.some(g => g.groupId === groupId);
    }
}