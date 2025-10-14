import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CandidateService } from './services/pre-onboarding.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const candidateService = inject(CandidateService);
  const router = inject(Router);

  return candidateService.currentCandidate$.pipe(
    map(user => {
      if (user?.jobDetailsForm?.Department === 'QA') {
        console.log('✅ Allowed: HR department');
        return true;
      } else {
        console.log('❌ Blocked: Not HR, redirecting...');
        router.navigate(['/unauthorized']);
        return false;
      }
    }),
    catchError(err => {
      console.error('⚠️ Error in guard:', err);
      router.navigate(['/unauthorized']);
      return of(false);
    })
  );
};
