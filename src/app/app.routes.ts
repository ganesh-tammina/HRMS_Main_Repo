import { Routes } from '@angular/router';
import { AdminComponent } from './Administration/admin/admin.component';
import { OrganisationInfoComponent } from './Administration/organisation-info/organisation-info.component';
import { LeavesComponent } from './Attendance/me/leaves/leaves.component';
import { MePage } from './Attendance/me/me.page';
import { CandidateOfferLetterComponent } from './candidate-offer-letter/candidate-offer-letter.component';
import { CandidateStatusComponent } from './candidate-status/candidate-status.component';
import { HomePage } from './home/home.page';
import { LoginPage } from './login/login.page';
import { MyTeamPage } from './my-team/my-team.page';
import { CandiateCreateComponent } from './onboarding/candiate-create/candiate-create.component';
import { CompensationComponent } from './onboarding/compensation/compensation.component';
import { CreateOfferComponent } from './onboarding/create-offer/create-offer.component';
import { NewJoinerComponent } from './onboarding/new-joiner/new-joiner.component';
import { OfferDetailsComponent } from './onboarding/offer-details/offer-details.component';
import { OnboardingTasksComponent } from './onboarding/onboarding-tasks/onboarding-tasks.component';
import { PastOffersComponent } from './onboarding/past-offers/past-offers.component';
import { PreOnboardingCardsComponent } from './onboarding/pre-onboarding-cards/pre-onboarding-cards.component';
import { PostPage } from './onboarding/pre.page';
import { PreonboardingComponent } from './onboarding/preonboarding/preonboarding.component';
import { PreviewSendComponent } from './onboarding/preview-send/preview-send.component';
import { SetupComponent } from './onboarding/setup/setup.component';
import { StartOnboardingComponent } from './onboarding/start-onboarding/start-onboarding.component';
import { TaskTemplatesComponent } from './onboarding/task-templates/task-templates.component';
import { OnboardingPage } from './post-onboarding/post-onboarding.page';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { salaryStaructureComponent } from './salary-staructure/salary-staructure.component';
import { AuthGuard } from './services/route-guard/auth/single-guard.guard';
import { roleHandlerGuard } from './services/route-guard/role-handler.ts/role-handler.guard';
import { AdminFunctionalityComponent } from './Administration/admin-functionality/admin-functionality.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'Home',
    component: HomePage,
    canActivate: [AuthGuard, roleHandlerGuard],
    data: { role: 'HR' },
  },
  {
    path: 'Me',
    component: MePage,
    canActivate: [AuthGuard, roleHandlerGuard],
    data: { role: 'user' },
  },
  {
    path: 'MyTeam',
    component: MyTeamPage,
    canActivate: [AuthGuard, roleHandlerGuard],
    data: { role: 'user' },
  },
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
  { path: 'pre-onboarding-cards', component: PreOnboardingCardsComponent },
  { path: 'pre_onboarding', component: PostPage },
  { path: 'post-onboarding', component: OnboardingPage },
  { path: 'Task_Template', component: TaskTemplatesComponent },
  { path: 'setup', component: SetupComponent },
  { path: 'Compensation/:id/:', component: CompensationComponent },
  {
    path: 'salaryStaructure/:id/:FirstName',
    component: salaryStaructureComponent,
  },
  {
    path: 'OfferDetailsComponent/:id/:FirstName',
    component: OfferDetailsComponent,
  },
  { path: 'preview_send/:id/:FirstName', component: PreviewSendComponent },
  { path: 'candidate_status/:id', component: CandidateStatusComponent },
  {
    path: 'candidate-offer-letter/:id',
    component: CandidateOfferLetterComponent,
  },
  {
    path: 'profile-page',
    component: ProfilePageComponent,
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard, roleHandlerGuard],
    data: { role: 'HR' },
  },
  { path: 'organisation_info', component: OrganisationInfoComponent },
  {
    path: 'admin-department',
    component: AdminFunctionalityComponent,
  },
];
