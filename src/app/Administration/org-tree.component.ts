
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
    // expanded: { [key: number]: boolean } = {};
    expanded: { [id: number]: boolean } = {};
    avatarColors = [
        'linear-gradient(135deg, #6366F1, #4F46E5)', // Indigo
        'linear-gradient(135deg, #3B82F6, #2563EB)', // Blue
        'linear-gradient(135deg, #10B981, #059669)', // Green
        'linear-gradient(135deg, #F59E0B, #D97706)', // Amber
        'linear-gradient(135deg, #EF4444, #DC2626)', // Red
        'linear-gradient(135deg, #8B5CF6, #7C3AED)', // Violet
        'linear-gradient(135deg, #EC4899, #DB2777)'  // Pink
      ];

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
                    // Expand the root manager/team by default
                    if (tree && tree.id) {
                        this.expanded[tree.id] = true;
                    }
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
    toggle(emp: any, parent?: any) {
        if (!emp.directReports?.length) return;
      
        // If parent exists, close all siblings
        if (parent?.directReports) {
          parent.directReports.forEach((sibling: any) => {
            if (sibling.id !== emp.id) {
              this.expanded[sibling.id] = false;
            }
          });
        }
      
        // Toggle selected node
        this.expanded[emp.id] = !this.expanded[emp.id];
      }
      getAvatarColor(emp: any): string {
        const key = emp.id || emp.email || emp.name;
        let hash = 0;
      
        for (let i = 0; i < String(key).length; i++) {
          hash = String(key).charCodeAt(i) + ((hash << 5) - hash);
        }
      
        const index = Math.abs(hash) % this.avatarColors.length;
        return this.avatarColors[index];
      }
      
}
