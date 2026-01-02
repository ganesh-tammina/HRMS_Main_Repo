import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService, ShiftPolicyPayload } from 'src/app/services/admin-functionality/admin.service.service';

@Component({
  selector: 'app-admin-functionality',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-functionality.component.html',
  styleUrls: ['./admin-functionality.component.scss']
})
export class adminFunctionalityComponent implements OnInit {

  activeTab = 'locations';

  locations: any[] = [];
  departments: any[] = [];
  shiftPolicies: any[] = [];
  announcements: any[] = [];

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

  constructor(private service: AdminService) { }

  ngOnInit() {
    this.loadLocations();
  }

  setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'locations') this.loadLocations();
    if (tab === 'departments') this.loadDepartments();
    if (tab === 'shifts') this.loadShiftPolicies();
    if (tab === 'announcements') this.loadAnnouncements();
  }

  /* LOCATIONS */
  loadLocations() { this.service.getLocations().subscribe(r => this.locations = r); }
  openAddLocation() { this.showLocationForm = true; this.editingLocationId = null; this.locationName = ''; }
  saveLocation() { this.service.createLocation({ name: this.locationName }).subscribe(() => { this.loadLocations(); this.cancelLocation(); }); }
  editLocation(i: any) { this.showLocationForm = true; this.locationName = i.name; this.editingLocationId = i.id; }
  updateLocation() { this.service.updateLocation(this.editingLocationId!, { name: this.locationName }).subscribe(() => { this.loadLocations(); this.cancelLocation(); }); }
  deleteLocation(id: number) { this.service.deleteLocation(id).subscribe(() => this.loadLocations()); }
  cancelLocation() { this.showLocationForm = false; }

  /* DEPARTMENTS */
  loadDepartments() { this.service.getDepartments().subscribe(r => this.departments = r); }
  openAddDepartment() { this.showDepartmentForm = true; this.editingDepartmentId = null; this.departmentName = ''; }
  saveDepartment() { this.service.createDepartment({ name: this.departmentName }).subscribe(() => { this.loadDepartments(); this.cancelDepartment(); }); }
  editDepartment(i: any) { this.showDepartmentForm = true; this.departmentName = i.name; this.editingDepartmentId = i.id; }
  updateDepartment() { this.service.updateDepartment(this.editingDepartmentId!, { name: this.departmentName }).subscribe(() => { this.loadDepartments(); this.cancelDepartment(); }); }
  deleteDepartment(id: number) { this.service.deleteDepartment(id).subscribe(() => this.loadDepartments()); }
  cancelDepartment() { this.showDepartmentForm = false; }

  /* SHIFTS */
  loadShiftPolicies() { this.service.getShiftPolicies().subscribe(r => this.shiftPolicies = r); }
  openAddShift() { this.showShiftForm = true; this.editingShiftId = null; }
  saveShift() { this.service.createShiftPolicy(this.shiftForm).subscribe(() => { this.loadShiftPolicies(); this.cancelShift(); }); }
  editShift(item: any) { this.showShiftForm = true; this.editingShiftId = item.id; this.shiftForm = { ...item }; }
  updateShift() { this.service.updateShiftPolicy(this.editingShiftId!, this.shiftForm).subscribe(() => { this.loadShiftPolicies(); this.cancelShift(); }); }
  cancelShift() { this.showShiftForm = false; }

  /* ANNOUNCEMENTS */
  loadAnnouncements() { this.service.getAnnouncements().subscribe(r => this.announcements = r); }
  openAddAnnouncement() { this.showAnnouncementForm = true; this.editingAnnouncementId = null; this.announcementForm = { title: '', body: '', starts_at: '', ends_at: '' }; }
  saveAnnouncement() { this.service.createAnnouncement(this.announcementForm).subscribe(() => { this.loadAnnouncements(); this.cancelAnnouncement(); }); }
  editAnnouncement(i: any) { this.showAnnouncementForm = true; this.editingAnnouncementId = i.id; this.announcementForm = { ...i }; }
  updateAnnouncement() { this.service.updateAnnouncement(this.editingAnnouncementId!, this.announcementForm).subscribe(() => { this.loadAnnouncements(); this.cancelAnnouncement(); }); }
  deleteAnnouncement(id: number) { this.service.deleteAnnouncement(id).subscribe(() => this.loadAnnouncements()); }
  cancelAnnouncement() { this.showAnnouncementForm = false; }
}
