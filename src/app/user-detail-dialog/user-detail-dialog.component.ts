import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Inject } from '@angular/core';
import { UserService } from '../user.service'; // ✅ make sure this import is there
import { EventEmitter, Output } from '@angular/core'; // ✅ Add import
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    HttpClientModule,
    MatButtonModule,
    MatInputModule
  ],
  templateUrl: './user-detail-dialog.component.html',
  styleUrls: ['./user-detail-dialog.component.css']
})
export class UserDetailDialogComponent implements OnInit {

  @Output() userUpdated = new EventEmitter<void>(); // ✅ This will notify parent


  constructor(
    private userService: UserService ,
    private http: HttpClient,
    private dialogRef: MatDialogRef<UserDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.id = data.id;
  }

  // 👇 This fixes the error
  ngOnInit(): void {
    this.searchUserById();
    this.loadRejectionReasons();

  }
  id: string = '';
  rejectionReason: string[] = [];        // ✅ This holds the API data
  showRejectionList: boolean = false;     // ✅ This controls dropdown visibility

  userData = {
    id: '',
    name: '',
    email: '',
    phone: '',
    rejectionReason: ''
  };

  error: string = '';

  searchUserById(): void {
    this.error = '';

    if (!this.userData.id) {
      this.error = 'Unesite ID korisnika za pretragu.';
      return;
    }
this.userService.getUserById(this.userData.id).subscribe({
  next: (data) => {
    this.userData = { ...data, rejectionReason: this.userData.rejectionReason || '' };
  },
  error: () => {
    this.error = 'Korisnik nije pronađen.';
    this.userData = { id: '', name: '', email: '', phone: '', rejectionReason: '' };
    Swal.fire('Greška', 'Korisnik sa tim ID-em ne postoji.', 'error');
  }
});
  }

  saveUser(): void {


    if (!this.userData.id) {
      this.error = 'ID korisnika nije unet.';
      return;
    }

    this.userService.updateUser(this.userData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Uspešno sačuvano!',
          text: 'Podaci su uspešno sačuvani.',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'U redu'
        });
        this.dialogRef.close('updated'); // ✅ Close dialog and return 'updated'
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Greška!',
          text: 'Podaci nisu sačuvani.',
          confirmButtonColor: '#d33',
          confirmButtonText: 'Razumem'
        });
      }
    });
  }


  private createPayload(): any {
    return {
      id: this.userData.id,
      name: this.userData.name,
      email: this.userData.email,
      phone: this.userData.phone,
      rejectionReason: this.userData.rejectionReason
    };
  }

  onRejectionFocus(): void {
    this.showRejectionList = true;
  }
  closeRejectionList(): void {
    this.showRejectionList = false;
  }

  loadRejectionReasons(): void {
    this.http.get<string[]>('https://run.mocky.io/v3/3c60c667-5feb-41a5-b2b9-0ef456d57b44')
      .subscribe({
        next: (data) => this.rejectionReason = data,
        error: () => {
          console.error('Failed to load rejection reasons');
          Swal.fire({
            icon: 'error',
            title: 'Greška!',
            text: 'Došlo je do problema pri komunikaciji sa serverom.',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Razumem'
          });
        }
      });
  }
  selectRejectionReason(reason: string): void {
    this.userData.rejectionReason = reason;
    this.showRejectionList = false;
  }

  hideRejectionListWithDelay() {
    setTimeout(() => {
      this.showRejectionList = false;
    }, 200);
  }

}
