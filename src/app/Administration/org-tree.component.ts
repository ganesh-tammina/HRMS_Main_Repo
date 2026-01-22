

import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { EmployeeService } from '../services/employee.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-org-tree',
    templateUrl: './org-tree.component.html',
    styleUrls: ['./org-tree.component.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    animations: [
        trigger('expandCollapse', [
            state('expanded', style({
                maxHeight: '1000px',
                opacity: 1,
                overflow: 'visible',
            })),
            state('collapsed', style({
                maxHeight: '0',
                opacity: 0,
                overflow: 'hidden',
            })),
            transition('expanded <=> collapsed', [
                animate('400ms cubic-bezier(0.4,0,0.2,1)')
            ]),
        ])
    ]
})
export class OrgTreeComponent implements OnInit {
    orgTree: any[] = [];
    loading = false;
    error: string | null = null;
    expanded: { [id: string]: boolean } = {};
    private myEmployeeId: number | null = null;
    parentMap: { [childId: string]: number | null } = {};
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

    // Collapse all siblings and expand only the selected node
    exclusiveExpand(nodeId: number) {
        // Build parentMap if not present
        if (!this.parentMap || Object.keys(this.parentMap).length === 0) {
            this.parentMap = {};
            const buildParentMap = (nodes: any[], parentId: number | null) => {
                for (const node of nodes) {
                    this.parentMap[node.id] = parentId;
                    if (node.directReports && node.directReports.length > 0) {
                        buildParentMap(node.directReports, node.id);
                    }
                }
            };
            buildParentMap(this.orgTree, null);
        }
        const parentId = this.parentMap[nodeId];
        let siblings: number[] = [];
        if (parentId === null) {
            siblings = Object.keys(this.parentMap)
                .filter(id => this.parentMap[id] === null)
                .map(id => +id);
        } else {
            siblings = Object.keys(this.parentMap)
                .filter(id => this.parentMap[id] === parentId)
                .map(id => +id);
        }
        siblings.forEach(id => {
            if (id !== nodeId) this.expanded[id] = false;
        });
        this.expanded[nodeId] = !this.expanded[nodeId];
    }

    // Find a node by employee id in the org tree
    findEmployeeNode(nodes: any[], id: number): any | null {
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.directReports && node.directReports.length > 0) {
                const found = this.findEmployeeNode(node.directReports, id);
                if (found) return found;
            }
        }
        return null;
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
                        const orgTree = this.buildOrgTree(employees);
                        // Only proceed if myEmployeeId is not null
                        if (this.myEmployeeId !== null) {
                            const myNode = this.findEmployeeNode(orgTree, this.myEmployeeId);
                            if (myNode) {
                                // Find manager
                                const myManagerId = myNode.reporting_manager_id || myNode.manager_id || myNode.reportingTo || myNode.reporting_to;
                                let coTeam: any[] = [];
                                let managerNode: any = null;
                                let managerTeam: any[] = [];
                                let topManagerNode: any = null;
                                if (myManagerId) {
                                    managerNode = this.findEmployeeNode(orgTree, myManagerId);
                                    if (managerNode && managerNode.directReports) {
                                        coTeam = managerNode.directReports.filter((e: any) => e.id !== this.myEmployeeId);
                                    }
                                    // Find manager's manager (top of the manager)
                                    const managerManagerId = managerNode ? (managerNode.reporting_manager_id || managerNode.manager_id || managerNode.reportingTo || managerNode.reporting_to) : null;
                                    if (managerManagerId) {
                                        topManagerNode = this.findEmployeeNode(orgTree, managerManagerId);
                                        if (topManagerNode && topManagerNode.directReports) {
                                            managerTeam = topManagerNode.directReports.filter((e: any) => e.id !== myManagerId);
                                        }
                                    }
                                }
                                // Compose the focused view: top manager, manager, my node, co-team
                                const focusNode = {
                                    ...myNode,
                                    coTeam: coTeam,
                                    manager: managerNode,
                                    managerTeam: managerTeam,
                                    topManager: topManagerNode
                                };
                                this.orgTree = [focusNode];
                                this.expanded = {};
                                this.expanded[myNode.id] = true;
                                if (myNode.directReports) {
                                    myNode.directReports.forEach((dr: any) => {
                                        this.expanded[dr.id] = false;
                                    });
                                }
                                if (coTeam) {
                                    coTeam.forEach((ct: any) => {
                                        this.expanded[ct.id] = false;
                                    });
                                }
                                if (managerNode) {
                                    this.expanded[managerNode.id] = false;
                                }
                                if (managerTeam) {
                                    managerTeam.forEach((mt: any) => {
                                        this.expanded[mt.id] = false;
                                    });
                                }
                                if (topManagerNode) {
                                    this.expanded[topManagerNode.id] = false;
                                }
                            } else {
                                this.orgTree = [];
                            }
                        } else {
                            this.orgTree = [];
                        }
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
