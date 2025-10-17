import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth-guard.guard';

export const adminRoutes: Routes = [
    {
        path: 'admin',
        loadComponent: () =>
            import('./admin/admin.component').then(
                m => m.AdminComponent
            ),
        canActivate: [AuthGuard],  // <-- corrected
        data: { role: 'admin' }
    },
    {
        path: 'organisation_info',
        loadComponent: () =>
            import('./organisation-info/organisation-info.component').then(
                m => m.OrganisationInfoComponent
            ),
        canActivate: [AuthGuard],  // <-- corrected
    }
];
