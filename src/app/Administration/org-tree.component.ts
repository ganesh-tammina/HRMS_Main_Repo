
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
    orgTree: any[] = [];
    loading = false;
    error: string | null = null;

    expanded: { [id: string]: boolean } = {};

    constructor(private employeeService: EmployeeService) { }

    ngOnInit() {
        this.loading = true;
        this.employeeService.getAllEmployees().subscribe({
            next: (employees) => {
                if (!Array.isArray(employees) || employees.length === 0) {
                    this.error = 'No employees found.';
                    this.loading = false;
                    return;
                }
                this.orgTree = this.buildOrgTree(employees);
                // Expand all root nodes by default
                this.orgTree.forEach(root => {
                    if (root && root.id) {
                        this.expanded[root.id] = true;
                    }
                });
                this.loading = false;
            },
            error: () => {
                this.error = 'Could not load employees.';
                this.loading = false;
            }
        });
    }

    // Build the full org tree from a flat employee list
    buildOrgTree(employees: any[]): any[] {
        const map: { [id: string]: any } = {};
        const roots: any[] = [];

        // Prepare map and clear directReports
        employees.forEach(emp => {
            map[emp.id] = { ...emp, directReports: [] };
        });

        employees.forEach(emp => {
            const managerId = emp.reporting_manager_id || emp.manager_id || emp.reportingTo || emp.reporting_to;
            if (managerId && map[managerId]) {
                map[managerId].directReports.push(map[emp.id]);
            } else {
                roots.push(map[emp.id]);
            }
        });
        return roots;
    }
}
