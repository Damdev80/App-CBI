import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

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
        return this.http.get<RoleDashboardSummary>(`${this.apiUrl}/dashboard/role-summary`);
    }

}