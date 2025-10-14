import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface EmployeeDB extends DBSchema {
  employees: {
    key: string;
    value: any[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class IndexeddbEmployeesService {
  private dbPromise: Promise<IDBPDatabase<EmployeeDB>>;

  constructor() {
    this.dbPromise = openDB<EmployeeDB>('AdminDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('employees')) {
          db.createObjectStore('employees');
        }
      },
    });
  }

  async saveEmployees(data: any[]): Promise<void> {
    const db = await this.dbPromise;
    await db.put('employees', data, 'currentEmployees');
  }

  async getEmployees(): Promise<any[] | null> {
    const db = await this.dbPromise;
    return (await db.get('employees', 'currentEmployees')) || null;
  }

  async clearEmployees(): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('employees', 'currentEmployees');
  }
}
