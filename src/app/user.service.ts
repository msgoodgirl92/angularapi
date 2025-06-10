import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface EmployeeRaw {
  id: number;
  radnik: string;
  position: string;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
}

export interface RejectionReason {
  id: number;
  reason: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = environment.apiUrl; 
  private employeeUrl = `${this.baseUrl}HBSharedAPI/BillOfExchangeRecordsAPI/GetDD?type=0`;
  private rejectionUrl = `${this.baseUrl}HBSharedAPI/BillOfExchangeRecordsAPI/GetDD?type=1`;
  private boeUrl = `${this.baseUrl}HBSharedAPI/BillOfExchangeRecordsAPI/boeData`;

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.http.get<EmployeeRaw[]>(this.employeeUrl).pipe(
      map(rawList => rawList.map(raw => {
        const [firstName, ...lastNameParts] = raw.radnik.split(' ');
        return {
          id: raw.id,
          firstName,
          lastName: lastNameParts.join(' ')
        };
      }))
    );
  }

  getRejectionReasons(): Observable<RejectionReason[]> {
    return this.http.get<RejectionReason[]>(this.rejectionUrl);
  }

  getBOERecords(): Observable<any[]> {
    return this.http.get<any[]>(this.boeUrl);
  }

  updateUser(updatedRecord: any): Observable<any> {
    return this.http.put(`${this.boeUrl}/${updatedRecord.ID || updatedRecord.id}`, updatedRecord);
  }

getUserById(id: string): Observable<any> {
  // Koristite BOE endpoint umesto /users endpoint
  return this.http.get<any>(`${this.boeUrl}/${id}`);
}
getUserByIdFromBOE(id: string): Observable<any[]> {
  return this.getBOERecords().pipe(
    map(records => records.filter(record => record.ID.toString() === id.toString()))
  );
}
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users`);
  }

  createBoeRecord(newRecord: any): Observable<any> {
    return this.http.post<any>(this.boeUrl, newRecord);
  }

  createUser(newRecord: any): Observable<any> {
    // Ako backend za korisnike koristi isti endpoint kao boeData
    return this.createBoeRecord(newRecord);
  }

  checkSerialNumberExists(serial: string): Observable<boolean> {
    const url = `${this.boeUrl}?serijskibroj=${encodeURIComponent(serial)}`;
    return this.http.get<any[]>(url).pipe(
      map(records => records.length > 0)
    );
  }

  deleteBoeRecord(id: number): Observable<any> {
    return this.http.delete(`${this.boeUrl}/${id}`);
  }

  deleteColumn(tableName: string, columnName: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/deleteColumn`, { tableName, columnName });
  }
  // Dodajte ovu metodu u UserService
getFilteredBOERecords(filters: any): Observable<any[]> {
  let queryParams = new URLSearchParams();

  if (filters.id) queryParams.append('id', filters.id);
  if (filters.serialNumber) queryParams.append('serialNumber', filters.serialNumber);
  if (filters.rejectionReason) queryParams.append('rejectionReason', filters.rejectionReason);
  if (filters.selectedDate) queryParams.append('selectedDate', filters.selectedDate);
  if (filters.createdBy) queryParams.append('createdBy', filters.createdBy);

  const url = queryParams.toString() ?
    `${this.boeUrl}?${queryParams.toString()}` :
    this.boeUrl;

  return this.http.get<any[]>(url);
}

// Alternativno, možete koristiti HttpParams:
getFilteredBOERecordsWithHttpParams(filters: any): Observable<any[]> {
  let params = new HttpParams();

  if (filters.id) params = params.set('id', filters.id);
  if (filters.serialNumber) params = params.set('serialNumber', filters.serialNumber);
  if (filters.rejectionReason) params = params.set('rejectionReason', filters.rejectionReason);
  if (filters.selectedDate) params = params.set('selectedDate', filters.selectedDate);
  if (filters.createdBy) params = params.set('createdBy', filters.createdBy);

  return this.http.get<any[]>(this.boeUrl, { params });
}

}
