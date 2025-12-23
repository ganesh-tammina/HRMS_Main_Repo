import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from 'src/app/services/admin-functionality/admin.service.service';

@Component({
  selector: 'app-admin-functionality',
  templateUrl: '/admin-functionality.component.html',
  styleUrls: ['/admin-functionality.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class adminFunctionalityComponent implements OnInit {

  activeTab = 'locations';

  locations: any[] = []; departments: any[] = [];
  designations: any[] = []; businessUnits: any[] = [];
  legalEntities: any[] = []; costCenters: any[] = [];

  showLocationForm = false; showDepartmentForm = false;
  showDesignationForm = false; showBusinessUnitForm = false;

  locationName = ''; departmentName = '';
  designationName = ''; businessUnitName = '';

  editingLocationId: any = null; editingDepartmentId: any = null;
  editingDesignationId: any = null; editingBusinessUnitId: any = null;

  constructor(private service: AdminService) { }

  ngOnInit() { this.loadLocations(); }

  setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'locations') this.loadLocations();
    if (tab === 'departments') this.loadDepartments();
    if (tab === 'designations') this.loadDesignations();
    if (tab === 'businessUnits') this.loadBusinessUnits();
  }

  loadLocations() { this.service.getLocations().subscribe(r => this.locations = r); }
  loadDepartments() { this.service.getDepartments().subscribe(r => this.departments = r); }
  loadDesignations() { this.service.getDesignations().subscribe(r => this.designations = r); }
  loadBusinessUnits() { this.service.getBusinessUnits().subscribe(r => this.businessUnits = r); }

  openAddLocation() { this.showLocationForm = true; this.editingLocationId = null; this.locationName = ''; }
  saveLocation() { this.service.createLocation({ name: this.locationName }).subscribe(() => { this.loadLocations(); this.cancelLocation(); }); }
  editLocation(i: any) { this.showLocationForm = true; this.locationName = i.name; this.editingLocationId = i.id; }
  updateLocation() { this.service.updateLocation(this.editingLocationId, { name: this.locationName }).subscribe(() => { this.loadLocations(); this.cancelLocation(); }); }
  deleteLocation(id: number) { this.service.deleteLocation(id).subscribe(() => this.loadLocations()); }
  cancelLocation() { this.showLocationForm = false; }

  openAddDepartment() { this.showDepartmentForm = true; this.editingDepartmentId = null; this.departmentName = ''; }
  saveDepartment() { this.service.createDepartment({ name: this.departmentName }).subscribe(() => { this.loadDepartments(); this.cancelDepartment(); }); }
  editDepartment(i: any) { this.showDepartmentForm = true; this.departmentName = i.name; this.editingDepartmentId = i.id; }
  updateDepartment() { this.service.updateDepartment(this.editingDepartmentId, { name: this.departmentName }).subscribe(() => { this.loadDepartments(); this.cancelDepartment(); }); }
  deleteDepartment(id: number) { this.service.deleteDepartment(id).subscribe(() => this.loadDepartments()); }
  cancelDepartment() { this.showDepartmentForm = false; }

  openAddDesignation() { this.showDesignationForm = true; this.editingDesignationId = null; this.designationName = ''; }
  saveDesignation() { this.service.createDesignation({ name: this.designationName }).subscribe(() => { this.loadDesignations(); this.cancelDesignation(); }); }
  editDesignation(i: any) { this.showDesignationForm = true; this.designationName = i.name; this.editingDesignationId = i.id; }
  updateDesignation() { this.service.updateDesignation(this.editingDesignationId, { name: this.designationName }).subscribe(() => { this.loadDesignations(); this.cancelDesignation(); }); }
  deleteDesignation(id: number) { this.service.deleteDesignation(id).subscribe(() => this.loadDesignations()); }
  cancelDesignation() { this.showDesignationForm = false; }

  openAddBusinessUnit() { this.showBusinessUnitForm = true; this.editingBusinessUnitId = null; this.businessUnitName = ''; }
  saveBusinessUnit() { this.service.createBusinessUnit({ name: this.businessUnitName }).subscribe(() => { this.loadBusinessUnits(); this.cancelBusinessUnit(); }); }
  editBusinessUnit(i: any) { this.showBusinessUnitForm = true; this.businessUnitName = i.name; this.editingBusinessUnitId = i.id; }
  updateBusinessUnit() { this.service.updateBusinessUnit(this.editingBusinessUnitId, { name: this.businessUnitName }).subscribe(() => { this.loadBusinessUnits(); this.cancelBusinessUnit(); }); }
  deleteBusinessUnit(id: number) { this.service.deleteBusinessUnit(id).subscribe(() => this.loadBusinessUnits()); }
  cancelBusinessUnit() { this.showBusinessUnitForm = false; }
}
