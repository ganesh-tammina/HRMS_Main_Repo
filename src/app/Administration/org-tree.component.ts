
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { EmployeeService } from '../services/employee.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-org-tree',
  templateUrl: './org-tree.component.html',
  styleUrls: ['./org-tree.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OrgTreeComponent implements OnInit {
  orgTree: any = null;
  loading = false;
  error: string | null = null;

  constructor(private employeeService: EmployeeService) { }

  ngOnInit() {
    this.loading = true;
    this.employeeService.getMyProfile().subscribe({
      next: (emp) => {
        if (!emp || !emp.id) {
          this.error = 'Could not load employee profile.';
          this.loading = false;
          return;
        }
        this.buildHierarchy(emp).then(tree => {
          this.orgTree = tree;
          this.loading = false;
        }).catch(err => {
          this.error = 'Failed to build org tree.';
          this.loading = false;
        });
      },
      error: () => {
        this.error = 'Could not load employee profile.';
        this.loading = false;
      }
    });
  }

  // Recursively build the reporting hierarchy
  async buildHierarchy(employee: any): Promise<any> {
    const directReports = await this.employeeService.getReportingEmployees(employee.id).toPromise();
    employee.directReports = Array.isArray(directReports) ? directReports : [];
    await Promise.all(employee.directReports.map((e: any) => this.buildHierarchy(e)));
    return employee;
  }
}
