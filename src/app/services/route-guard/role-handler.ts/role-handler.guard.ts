import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { RouteGuardService } from '../route-service/route-guard.service';

@Injectable({ providedIn: 'root' })
export class roleHandlerGuard implements CanActivate {
  constructor(private auth: RouteGuardService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles: string[] = route.data['role'];
    const userRole = this.auth.userRole;
    if (!userRole || !expectedRoles.includes(userRole)) {
      alert('Access Denied - You do not have permission to access this page');
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
