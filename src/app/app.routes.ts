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
import { adminFunctionalityComponent } from './Administration/admin-functionality/admin-functionality.component';
import { WorkTrackComponent } from './Today_@_Work/work-track/work-track.component';
import { ClientWorkTrackComponent } from './Today_@_Work/client-work-track/client-work-track.component';
import { PayslipsComponent } from './My_Finance/payslips/payslips.component';
import { LeaveRequestsComponent } from './leave-requests/leave-requests.component';
import { LeavesAdminDashboardComponent } from './Administration/leaves-admin-dashboard/leaves-admin-dashboard.component';
import { LeavetypesComponent } from './Administration/leaves-admin-dashboard/leavetypes/leavetypes.component';
import { LeaveplansComponent } from './Administration/leaves-admin-dashboard/leaveplans/leaveplans.component';
import { LeavesAllocationComponent } from './Administration/leaves-admin-dashboard/leaves-allocation/leaves-allocation.component';
import { EmployeeLeaveAllocationComponent } from './Administration/leaves-admin-dashboard/employee-leave-allocation/employee-leave-allocation.component';
import { MasterAdminSetupComponent } from './Administration/master-admin-setup/master-admin-setup.component';
import { PreonboardSubItemsComponent } from './onboarding/preonboard-sub-items/preonboard-sub-items.component';
import { CreateProjectComponent } from './Administration/organisation-info/create-project/create-project.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'Home',
    component: HomePage,
  },
  {
    path: 'Me',
    component: MePage,
  },
  {
    path: 'MyTeam',
    component: MyTeamPage,
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
    component: CandidateOfferLetterComponent
  },
  {
    path: 'profile-page',
    component: ProfilePageComponent,
  },
  {
    path: 'workTrack',
    component: WorkTrackComponent,
  },
  {
    path: 'ClientWorkTrack',
    component: ClientWorkTrackComponent,
  },

  {
    path: 'admin',
    component: AdminComponent,
  },
  {
    path: 'organisation_info',
    component: OrganisationInfoComponent,
    canActivate: [AuthGuard, roleHandlerGuard],
    data: { role: ['HR', 'USER', 'ADMIN'] },
  },
  {
    path: 'admin-department',
    component: adminFunctionalityComponent,
  },
  {
    path: 'payslip',
    component: PayslipsComponent
  },
  {
    path: 'approve-reject-leave',
    component: LeaveRequestsComponent
  },
  {
    path: 'admin-leaves',
    component: LeavesAdminDashboardComponent
  },
  {
    path: 'leave-types',
    component: LeavetypesComponent
  },
  {
    path: 'leave-plans',
    component: LeaveplansComponent
  },
  {
    path: 'leaves_allocation',
    component: LeavesAllocationComponent
  },
  {
    path: 'employee_lEAVE_allocation',
    component: EmployeeLeaveAllocationComponent
  },
  {
    path: 'admin-setup',
    component: MasterAdminSetupComponent
  },
  {
    path: 'preonboarding-setup',
    component: PreonboardSubItemsComponent
  },
  {
    path: 'CreateProject',
    component: CreateProjectComponent
  }

];
