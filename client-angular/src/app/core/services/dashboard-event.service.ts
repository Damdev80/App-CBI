import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { catchError, map, of, throwError, forkJoin } from "rxjs";
import { environment } from "src/environments/environment";
import { AuthService } from "./auth.service";

export interface RoleDashboardSummary {
  role: string;
  scope: 'GLOBAL' | 'GROUP';
  groups: Array<{ id: string; name: string; groupRole: string }>;
  modules: string[];
  kpis: {
    totalUsers?: number;
    totalBaptized?: number;
    totalUnpaidEvents?: number;
    serviceStudents?: number;
    totalCollected?: number;
    pendingServicePayments?: number;
    forumPosts: number;
    groupSessions: number;
  };
}

@Injectable({
    providedIn: "root",
})

export class DashboardEventService {
    private http = inject(HttpClient);
    private auth = inject(AuthService);
    private apiUrl = environment.apiUrl;
    

    getNumberUser(): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/dashboard/numberUser`);
    }

    getNumberBautized(): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/dashboard/bautized`);
    }

    getNumberWomenRegistered(): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/dashboard/womenRegistered`);
    }

    getcountUnpaid(): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/dashboard/countUnpaid`)
    }

    getRoleSummary(): Observable<RoleDashboardSummary> {
                return this.http.get<RoleDashboardSummary>(`${this.apiUrl}/dashboard/role-summary`).pipe(
                    catchError((error) => {
                        // Compatibilidad con backend legado sin endpoint role-summary.
                        if (error?.status === 404) {
                            return this.getRoleSummaryLegacy();
                        }
                        return throwError(() => error);
                    }),
                );
    }

        private getRoleSummaryLegacy(): Observable<RoleDashboardSummary> {
            const role = this.auth.getRole() ?? 'USER';

            return forkJoin({
                totalUsers: this.getNumberUser().pipe(catchError(() => of(0))),
                totalBaptized: this.getNumberBautized().pipe(catchError(() => of(0))),
                totalUnpaidEvents: this.getcountUnpaid().pipe(catchError(() => of(0))),
            }).pipe(
                map(({ totalUsers, totalBaptized, totalUnpaidEvents }) => ({
                    role,
                    scope: 'GLOBAL',
                    groups: [],
                    modules: ['dashboard'],
                    kpis: {
                        totalUsers,
                        totalBaptized,
                        totalUnpaidEvents,
                        forumPosts: 0,
                        groupSessions: 0,
                    },
                })),
            );
        }

}