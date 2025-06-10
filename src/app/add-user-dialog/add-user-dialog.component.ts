import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormControl, AsyncValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { UserService, RejectionReason } from '../user.service';
import { Observable, of, timer } from 'rxjs';
import { switchMap, map, startWith } from 'rxjs/operators';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-add-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatIconModule,
  ],
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.css'],
})
export class AddUserDialogComponent implements OnInit {
  @ViewChild('rejectionAutoTrigger') rejectionAutoTrigger!: MatAutocompleteTrigger;
  @ViewChild('employeeAutoTrigger') employeeAutoTrigger!: MatAutocompleteTrigger;

  userForm: FormGroup;
  loading = false;

  rejectionReasons: RejectionReason[] = [];
  filteredRejectionReasons!: Observable<RejectionReason[]>;

  employees: string[] = []; // niz stringova "Ime Prezime"
  filteredEmployees!: Observable<string[]>;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddUserDialogComponent>,
    private userService: UserService
  ) {
    this.userForm = this.fb.group({
    serijskibroj: ['SB-', {
        validators: [Validators.required],
        asyncValidators: [this.serijskiBrojExistsValidator()],
        updateOn: 'blur'
      }],
      poverilac: ['', Validators.required],
      duznik: ['', Validators.required],
      datumPrijema: ['', Validators.required],
      datumIzdavanja: ['', Validators.required],
      createdBy: ['', Validators.required],  // ime zaposlenog (string)
      action: [''],
      rejectionReason: ['', Validators.required], // razlog odbijanja
    });
  }

  ngOnInit(): void {
    this.loadRejectionReasons();
    this.loadEmployees();

    this.filteredRejectionReasons = this.rejectionReasonControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterRejectionReasons(typeof value === 'string' ? value : (value?.reason || '')))
    );

    this.filteredEmployees = this.createdByControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterEmployees(typeof value === 'string' ? value : value))
    );
  }

  // Getteri za FormControls
  get rejectionReasonControl(): FormControl {
    return this.userForm.get('rejectionReason') as FormControl;
  }

  get createdByControl(): FormControl {
    return this.userForm.get('createdBy') as FormControl;
  }

  loadRejectionReasons(): void {
    this.userService.getRejectionReasons().subscribe({
      next: data => {
        this.rejectionReasons = data;
        this.filteredRejectionReasons = of(this.rejectionReasons);
      },
      error: err => console.error('Greška pri učitavanju razloga odbijanja:', err)
    });
  }

  loadEmployees(): void {
    this.userService.getEmployees().subscribe({
      next: data => {
        // Pretvori zaposlene u niz stringova "Ime Prezime"
        this.employees = data.map(emp => `${emp.firstName} ${emp.lastName}`);
        this.filteredEmployees = of(this.employees);
      },
      error: err => console.error('Greška pri učitavanju zaposlenih:', err)
    });
  }

  private _filterRejectionReasons(value: string): RejectionReason[] {
    const filterValue = value.toLowerCase();
    return this.rejectionReasons.filter(reason =>
      reason.reason.toLowerCase().includes(filterValue)
    );
  }

  private _filterEmployees(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.employees.filter(empName =>
      empName.toLowerCase().includes(filterValue)
    );
  }

  serijskiBrojExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }
      return timer(500).pipe(
        switchMap(() => this.userService.checkSerialNumberExists(control.value)),
        map(exists => (exists ? { serialExists: true } : null))
      );
    };
  }

  onSave(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    // Uzmi vrednosti iz forme:
    const formValue = { ...this.userForm.value };

    // Ako je rejectionReason objekat, uzmi samo reason string
    if (typeof formValue.rejectionReason === 'object' && formValue.rejectionReason !== null) {
      formValue.rejectionReason = formValue.rejectionReason.reason;
    }

    // createdBy je string, ostaje kako jeste

    this.userService.createBoeRecord(formValue).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close('created');
      },
      error: () => {
        this.loading = false;
        alert('Greška pri dodavanju zapisa.');
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  displayRejection(reason: RejectionReason): string {
    return reason ? reason.reason : '';
  }

  displayEmployee(empName: string): string {
    return empName || '';
  }

  openRejectionAutocomplete(): void {
    this.rejectionAutoTrigger.openPanel();
  }

  openEmployeeAutocomplete(): void {
    this.employeeAutoTrigger.openPanel();
  }
}
