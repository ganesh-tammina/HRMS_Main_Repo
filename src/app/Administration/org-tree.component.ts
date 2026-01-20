
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
    private myEmployeeId: number | null = null;

    constructor(private employeeService: EmployeeService) { }

    ngOnInit() {
        this.loading = true;
        // Get logged-in employee profile first
        this.employeeService.getMyProfile().subscribe({
            next: (me) => {
                if (!me || !me.id) {
                    this.error = 'Could not load employee profile.';
                    this.loading = false;
                    return;
                }
                this.myEmployeeId = me.id;
                // Now get all employees
                this.employeeService.getAllEmployees().subscribe({
                    next: (employees) => {
                        if (!Array.isArray(employees) || employees.length === 0) {
                            this.error = 'No employees found.';
                            this.loading = false;
                            return;
                        }
                        this.orgTree = this.buildOrgTree(employees);
                        // Expand only the logged-in user's team, collapse others
                        this.setInitialExpansion(this.orgTree, this.myEmployeeId);
                        this.loading = false;
                    },
                    error: () => {
                        this.error = 'Could not load employees.';
                        this.loading = false;
                    }
                });
            },
            error: () => {
                this.error = 'Could not load employee profile.';
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

    // Expand only the logged-in user's team, collapse others
    setInitialExpansion(nodes: any[], myId: number | null) {
        if (!myId) return;
        // Find the node for the logged-in user and expand its path
        const expandPath = (node: any): boolean => {
            if (node.id === myId) {
                this.expanded[node.id] = true;
                return true;
            }
            if (node.directReports && node.directReports.length > 0) {
                for (const dr of node.directReports) {
                    if (expandPath(dr)) {
                        this.expanded[node.id] = true;
                        return true;
                    }
                }
            }
            this.expanded[node.id] = false;
            return false;
        };
        nodes.forEach(root => expandPath(root));
    }
}
