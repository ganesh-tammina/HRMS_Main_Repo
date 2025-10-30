import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { MePage } from '../app/Attendance/me/me.page';
import { MyTeamPage } from './my-team/my-team.page';
import { logIn } from 'ionicons/icons';
import { LoginPage } from './login/login.page';
import { OnboardingPage } from './post-onboarding/post-onboarding.page';
import { PostPage } from './onboarding/pre.page';
import { PreonboardingComponent } from './onboarding/preonboarding/preonboarding.component';
import { NewJoinerComponent } from './onboarding/new-joiner/new-joiner.component';
import { PastOffersComponent } from './onboarding/past-offers/past-offers.component';
import { OnboardingTasksComponent } from './onboarding/onboarding-tasks/onboarding-tasks.component';
import { CandiateCreateComponent } from './onboarding/candiate-create/candiate-create.component';
import { StartOnboardingComponent } from './onboarding/start-onboarding/start-onboarding.component';
import { CreateOfferComponent } from './onboarding/create-offer/create-offer.component';
import { LeavesComponent } from '../app/Attendance/me/leaves/leaves.component';
import { authGuard } from './authgurd.guard';
import { AuthGuard } from './Administration/services/auth-guard.guard';
import { adminRoutes } from './Administration/admin.routes';

export const routes: Routes = [
  ...adminRoutes,

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  // canActivate: [AuthGuard], data: { role: 'employee' } 
  { path: 'Home', component: HomePage, },
  // { path: 'Me', component: MePage },
  { path: 'MyTeam', component: MyTeamPage },
  { path: 'login', component: LoginPage },
  { path: 'settings', component: PostPage },
  { path: 'preOnboarding', component: PreonboardingComponent },
  { path: 'NewJoiner', component: NewJoinerComponent },
  { path: 'pastOffers', component: PastOffersComponent },
  { path: 'onboarding_Tasks', component: OnboardingTasksComponent },
  { path: 'CandiateCreate', component: CandiateCreateComponent },
  { path: 'Startonboardingitem', component: StartOnboardingComponent },
  { path: 'CreateOffer/:id', component: CreateOfferComponent },
  { path: 'leaves', component: LeavesComponent },

  {
    path: 'pre-onboarding-cards',
    loadComponent: () => import('./onboarding/pre-onboarding-cards/pre-onboarding-cards.component').then(m => m.PreOnboardingCardsComponent),
  },
  {
    path: 'pre_onboarding',
    loadComponent: () => import('./onboarding/pre.page').then(m => m.PostPage),
  },
  {
    path: 'post-onboarding',
    loadComponent: () => import('./post-onboarding/post-onboarding.page').then(m => m.OnboardingPage),
    canActivate: [authGuard]
  },

  {
    path: 'Task_Template', loadComponent: () => import('./onboarding/task-templates/task-templates.component').then(m => m.TaskTemplatesComponent)
  },
  {
    path: 'Me', loadComponent: () => import('../app/Attendance/me/me.page').then(m => m.MePage)
  },
  {
    path: 'setup', loadComponent: () => import('./onboarding/setup/setup.component').then(m => m.SetupComponent)
  },
  {
    path: 'Compensation/:id/:', loadComponent: () => import('./onboarding/compensation/compensation.component').then(m => m.CompensationComponent)
  },
  {
    path: 'salaryStaructure/:id/:FirstName',
    loadComponent: () =>
      import('./salary-staructure/salary-staructure.component').then(
        m => m.salaryStaructureComponent
      ),
  },

  {
    path: 'OfferDetailsComponent/:id/:FirstName',
    loadComponent: () =>
      import('./onboarding/offer-details/offer-details.component').then(
        m => m.OfferDetailsComponent
      ),
  },

  {
    path: 'preview_send/:id/:FirstName',
    loadComponent: () =>
      import('./onboarding/preview-send/preview-send.component').then(
        m => m.PreviewSendComponent
      ),
  },
  {
    path: 'candidate_status/:id',
    loadComponent: () =>
      import('./candidate-status/candidate-status.component').then(
        m => m.CandidateStatusComponent
      ),
  },
  {
    path: 'candidate-offer-letter/:id',
    loadComponent: () =>
      import('./candidate-offer-letter/candidate-offer-letter.component').then(
        m => m.CandidateOfferLetterComponent
      ),
  },
  {
    path: 'profile-page',
    loadComponent: () =>
      import('./profile-page/profile-page.component').then(
        m => m.ProfilePageComponent
      ),
  }


];
