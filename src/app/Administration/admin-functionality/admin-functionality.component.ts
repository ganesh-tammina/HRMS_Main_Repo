import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService, ShiftPolicyPayload } from 'src/app/services/admin-functionality/admin.service.service';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';


import { RouteGuardService } from 'src/app/services/route-guard/route-service/route-guard.service';

@Component({
  selector: 'app-admin-functionality',
  standalone: true,
  imports: [FormsModule, CommonModule, IonicModule],
  templateUrl: './admin-functionality.component.html',
  styleUrls: ['./admin-functionality.component.scss']
})

export class adminFunctionalityComponent implements OnInit {
  userRole: string | null = null;
  get isAdminOrHR(): boolean {
    return this.userRole === 'admin' || this.userRole === 'hr';
  }
  weeklyOffPolicies: any[] = [];
  weeklyOffPolicyForm: any = {
    policy_code: '',
    name: '',
    description: '',
    effective_date: '',
    is_active: 1,
    sunday_off: 0,
    monday_off: 0,
    tuesday_off: 0,
    wednesday_off: 0,
    thursday_off: 0,
    friday_off: 0,
    saturday_off: 0,
    is_payable: 0,
    holiday_overlap_rule: '',
    sandwich_rule: 0,
    minimum_work_days: 0
  };
  editingWeeklyOffPolicyId: number | null = null;

  activeTab: string = 'locations';
  locations: any[] = [];
  departments: any[] = [];
  shiftPolicies: any[] = [];
  announcements: any[] = [];
  designations: any[] = [];
  businessUnits: any[] = [];
  businessUnitName: string = '';
  editingBusinessUnitId: number | null = null;

  showLocationForm = false;
  showDepartmentForm = false;
  showShiftForm = false;
  showAnnouncementForm = false;

  locationName = '';
  departmentName = '';

  editingLocationId: number | null = null;
  editingDepartmentId: number | null = null;
  editingShiftId: number | null = null;
  editingAnnouncementId: number | null = null;

  shiftForm: ShiftPolicyPayload = {
    name: '',
    shift_type: 'general',
    start_time: '',
    end_time: '',
    break_duration_minutes: 60,
    timezone: 'Asia/Kolkata',
    description: '',
    is_active: 1
  };

  announcementForm = {
    title: '',
    body: '',
    starts_at: '',
    ends_at: ''
  };

  designationName: string = '';
  editingDesignationId: number | null = null;

  constructor(private service: AdminService, private router: Router, private routeGaurdService: RouteGuardService) { }

  ngOnInit() {
    // Try to get userRole from routeGaurdService, fallback to localStorage
    this.userRole = (this.routeGaurdService.userRole?.toLowerCase() || localStorage.getItem('userRole')?.toLowerCase() || null);
    this.loadLocations();
  }
  adminManagement() {
    this.router.navigate(['./admin']);
  }

  setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'locations') this.loadLocations();
    if (tab === 'departments') this.loadDepartments();
    if (tab === 'shifts') this.loadShiftPolicies();
    if (tab === 'weeklyOffPolicies') this.loadWeeklyOffPolicies();
    if (tab === 'announcements') this.loadAnnouncements();
    if (tab === 'designations') {
      this.getDesignations();
    }
    if (tab === 'businessUnits') {
      this.getBusinessUnits();
    }
  }
  /* WEEKLY OFF POLICIES */
  loadWeeklyOffPolicies() { this.service.getWeeklyOffPolicies().subscribe(r => this.weeklyOffPolicies = r); }
  saveWeeklyOffPolicy() { this.service.createWeeklyOffPolicy(this.weeklyOffPolicyForm).subscribe(() => { this.loadWeeklyOffPolicies(); this.cancelWeeklyOffPolicy(); }); }
  editWeeklyOffPolicy(item: any) { this.editingWeeklyOffPolicyId = item.id; this.weeklyOffPolicyForm = { ...item }; }
  updateWeeklyOffPolicy() { this.service.updateWeeklyOffPolicy(this.editingWeeklyOffPolicyId!, this.weeklyOffPolicyForm).subscribe(() => { this.loadWeeklyOffPolicies(); this.cancelWeeklyOffPolicy(); }); }
  deleteWeeklyOffPolicy(id: number) { this.service.deleteWeeklyOffPolicy(id).subscribe(() => this.loadWeeklyOffPolicies()); }
  cancelWeeklyOffPolicy() {
    this.editingWeeklyOffPolicyId = null;
    this.weeklyOffPolicyForm = {
      policy_code: '',
      name: '',
      description: '',
      effective_date: '',
      is_active: 1,
      sunday_off: 0,
      monday_off: 0,
      tuesday_off: 0,
      wednesday_off: 0,
      thursday_off: 0,
      friday_off: 0,
      saturday_off: 0,
      is_payable: 0,
      holiday_overlap_rule: '',
      sandwich_rule: 0,
      minimum_work_days: 0
    };
  }

  /* LOCATIONS */
  loadLocations() { this.service.getLocations().subscribe(r => this.locations = r); }
  openAddLocation() { this.showLocationForm = true; this.editingLocationId = null; this.locationName = ''; }
  saveLocation() { this.service.createLocation({ name: this.locationName }).subscribe(() => { this.loadLocations(); this.locationName = ''; this.cancelLocation(); }); }
  editLocation(i: any) { this.showLocationForm = true; this.locationName = i.name; this.editingLocationId = i.id; }
  updateLocation() { this.service.updateLocation(this.editingLocationId!, { name: this.locationName }).subscribe(() => { this.loadLocations(); this.locationName = ''; this.cancelLocation(); }); }
  deleteLocation(id: number) { this.service.deleteLocation(id).subscribe(() => this.loadLocations()); }
  cancelLocation() { this.locationName = ''; this.editingLocationId = null; }

  /* DEPARTMENTS */
  loadDepartments() { this.service.getDepartments().subscribe(r => this.departments = r); }
  openAddDepartment() { this.showDepartmentForm = true; this.editingDepartmentId = null; this.departmentName = ''; }
  saveDepartment() { this.service.createDepartment({ name: this.departmentName }).subscribe(() => { this.loadDepartments(); this.departmentName = ''; this.cancelDepartment(); }); }
  editDepartment(i: any) { this.showDepartmentForm = true; this.departmentName = i.name; this.editingDepartmentId = i.id; }
  updateDepartment() { this.service.updateDepartment(this.editingDepartmentId!, { name: this.departmentName }).subscribe(() => { this.loadDepartments(); this.departmentName = ''; this.cancelDepartment(); }); }
  deleteDepartment(id: number) { this.service.deleteDepartment(id).subscribe(() => this.loadDepartments()); }
  cancelDepartment() { this.departmentName = ''; this.editingDepartmentId = null; }

  /* SHIFTS */
  loadShiftPolicies() { this.service.getShiftPolicies().subscribe(r => this.shiftPolicies = r); }
  openAddShift() { this.showShiftForm = true; this.editingShiftId = null; }
  saveShift() {
    console.log('Saving new shift:', this.shiftForm);
    this.service.createShiftPolicy(this.shiftForm).subscribe({
      next: () => {
        console.log('Shift saved successfully');
        this.loadShiftPolicies();
        this.resetShiftForm();
      },
      error: (err) => {
        console.error('Error saving shift:', err);
      }
    });
  }
  // Removed duplicate editShift without debug logs
  editShift(item: any) {
    console.log('Editing shift:', item);
    this.editingShiftId = item.id;
    this.shiftForm = { ...item };
    console.log('shiftForm after edit:', this.shiftForm);
  }
  // Removed duplicate updateShift without debug logs
  updateShift() {
    console.log('Updating shift:', this.editingShiftId, this.shiftForm);
    this.service.updateShiftPolicy(this.editingShiftId!, this.shiftForm).subscribe({
      next: () => {
        console.log('Shift updated successfully');
        this.loadShiftPolicies();
        this.resetShiftForm();
      },
      error: (err) => {
        console.error('Error updating shift:', err);
      }
    });
  }
  cancelShift() { this.resetShiftForm(); this.editingShiftId = null; }
  resetShiftForm() {
    this.shiftForm = {
      name: '',
      shift_type: 'general',
      start_time: '',
      end_time: '',
      break_duration_minutes: 60,
      timezone: 'Asia/Kolkata',
      description: '',
      is_active: 1
    };
  }

  /* ANNOUNCEMENTS */
  loadAnnouncements() { this.service.getAnnouncements().subscribe(r => this.announcements = r); }
  openAddAnnouncement() { this.showAnnouncementForm = true; this.editingAnnouncementId = null; this.announcementForm = { title: '', body: '', starts_at: '', ends_at: '' }; }
  saveAnnouncement() { this.service.createAnnouncement(this.announcementForm).subscribe(() => { this.loadAnnouncements(); this.cancelAnnouncement(); }); }
  editAnnouncement(i: any) { this.showAnnouncementForm = true; this.editingAnnouncementId = i.id; this.announcementForm = { ...i }; }
  updateAnnouncement() { this.service.updateAnnouncement(this.editingAnnouncementId!, this.announcementForm).subscribe(() => { this.loadAnnouncements(); this.cancelAnnouncement(); }); }
  deleteAnnouncement(id: number) { this.service.deleteAnnouncement(id).subscribe(() => this.loadAnnouncements()); }
  cancelAnnouncement() { this.showAnnouncementForm = false; }

  /* DESIGNATIONS */
  getDesignations() {
    this.service.getDesignations().subscribe(
      (data) => {
        this.designations = data;
      },
      (error) => {
        console.error('Error fetching designations:', error);
      }
    );
  }

  saveDesignation() {
    const payload = { name: this.designationName };
    this.service.createDesignation(payload).subscribe(
      (response) => {
        console.log('Designation created:', response);
        this.getDesignations();
        this.designationName = '';
      },
      (error) => {
        console.error('Error creating designation:', error);
      }
    );
  }

  editDesignation(item: any) {
    this.designationName = item.name;
    this.editingDesignationId = item.id;
  }

  updateDesignation() {
    const payload = { name: this.designationName };
    if (this.editingDesignationId) {
      this.service.updateDesignation(this.editingDesignationId, payload).subscribe(
        (response) => {
          console.log('Designation updated:', response);
          this.getDesignations();
          this.cancelDesignation();
        },
        (error) => {
          console.error('Error updating designation:', error);
        }
      );
    }
  }

  deleteDesignation(id: number) {
    this.service.deleteDesignation(id).subscribe(
      (response) => {
        console.log('Designation deleted:', response);
        this.getDesignations();
      },
      (error) => {
        console.error('Error deleting designation:', error);
      }
    );
  }

  cancelDesignation() {
    this.designationName = '';
    this.editingDesignationId = null;
  }

  openAddDesignation() {
    this.cancelDesignation();
  }
  /* BUSINESS UNITS */
  loadBusinessUnits() {
    this.service.getBusinessUnits().subscribe(
      (data) => {
        this.businessUnits = data;
      },
      (error) => {
        console.error('Error fetching business units:', error);
      }
    );
  }

  saveBusinessUnit() {
    const payload = { name: this.businessUnitName };
    this.service.createBusinessUnit(payload).subscribe(
      () => {
        this.loadBusinessUnits();
        this.businessUnitName = '';
        this.cancelBusinessUnit();
      },
      (error) => {
        console.error('Error creating business unit:', error);
      }
    );
  }

  editBusinessUnit(item: any) {
    this.businessUnitName = item.name;
    this.editingBusinessUnitId = item.id;
  }

  updateBusinessUnit() {
    const payload = { name: this.businessUnitName };
    if (this.editingBusinessUnitId) {
      this.service.updateBusinessUnit(this.editingBusinessUnitId, payload).subscribe(
        () => {
          this.loadBusinessUnits();
          this.cancelBusinessUnit();
        },
        (error) => {
          console.error('Error updating business unit:', error);
        }
      );
    }
  }

  deleteBusinessUnit(id: number) {
    this.service.deleteBusinessUnit(id).subscribe(
      () => {
        this.loadBusinessUnits();
      },
      (error) => {
        console.error('Error deleting business unit:', error);
      }
    );
  }

  cancelBusinessUnit() {
    this.businessUnitName = '';
    this.editingBusinessUnitId = null;
  }

  openAddBusinessUnit() {
    this.cancelBusinessUnit();
  }
  getBusinessUnits() {
    this.loadBusinessUnits();
  }
}
