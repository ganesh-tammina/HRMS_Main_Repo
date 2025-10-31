import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { RouteGuardService } from '../route-service/route-guard.service';

@Injectable({ providedIn: 'root' })
export class roleHandlerGuard implements CanActivate {
  constructor(private auth: RouteGuardService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['role'];
    const userRole = this.auth.userRole;
    if (userRole !== expectedRole) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
