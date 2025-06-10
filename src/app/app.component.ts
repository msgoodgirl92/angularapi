import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ClickOutsideModule } from 'ng-click-outside';
import { AddUserDialogComponent } from './add-user-dialog/add-user-dialog.component';
import Swal from 'sweetalert2';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { Observable, map, startWith } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { UserService, Employee, RejectionReason } from './user.service';
import { MatIconModule } from '@angular/material/icon';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


interface Translations {
  [key: string]: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    MatButtonModule,
    MatInputModule,
    MatDatepickerModule,
    ClickOutsideModule,
    MatNativeDateModule,
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatIconModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
   loading = false;
  isFilterSelected = false;
  showAddUserButton = false;

 highlightedDates: Date[] = []; // Popuni sa datumima iz baze
dateClass = (d: Date): string => {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate()); // resetuj na ponoć lokalno

  console.log('Date from picker:', date.getTime());

  let isHighlighted = false;

  this.highlightedDates.forEach(h => {
    const normalizedH = new Date(h.getFullYear(), h.getMonth(), h.getDate());
    const equal = normalizedH.getTime() === date.getTime();
    console.log('Date from highlighted:', normalizedH.getTime(), 'Equal:', equal);
    if (equal) isHighlighted = true;
  });

  return isHighlighted ? 'highlighted-date' : '';
};

  id: string = '';
  serialNumber = '';
  selectedDate: Date | null = null;
  searchQuery = '';
  dataLoaded = false;

  // Employee autocomplete
  employeeList: Employee[] = [];
  employeeControl = new FormControl<Employee | string | null>(null);
  filteredEmployees!: Observable<Employee[]>;

  // Rejection reason autocomplete
  rejectionReasons: RejectionReason[] = [];
  rejectionControl = new FormControl<RejectionReason | string | null>(null);
  filteredRejectionReasons!: Observable<RejectionReason[]>;

  // Autocomplete za pretragu imena u tabeli
  searchControl = new FormControl('');
  filteredSearchOptions!: Observable<string[]>;

idControl = new FormControl('');

  boeData: any[] = [];
  filteredBoeData: any[] = [];

  currentLang: 'sr' | 'en' = 'sr';

  translations: { [lang: string]: Translations } = {
    sr: {
      title: 'Odbijene menice',
      filterMessage: 'Molimo izaberite jedan od filtera i kliknite na dugme "Filtiraj podatke" da biste videli podatke.',
      idLabel: 'ID',
      idPlaceholder: 'Unesite ID broj od 1-10',
      rejectionLabel: 'Razlog odbijanja',
      dateLabel: 'Datum prijema',
      employeeLabel: 'Zaposleni',
      Refresh: 'Osveži formu',
      filterButton: 'Filtiraj podatke',
      showAllButton: 'Prikaži sve podatke',
      addUserButton: 'Dodaj novog korisnika',
      deleteConfirmTitle: 'Da li ste sigurni?',
      deleteConfirmText: 'Ovaj zapis će biti trajno izbrisan!',
      deleteConfirmYes: 'Da, izbriši!',
      deleteConfirmCancel: 'Otkaži',
      deleteSuccess: 'Zapis je uspešno izbrisan.',
      pdfDownloadLabel: 'Skini PDF',
      actionDeleteAria: 'Izbriši',
      actionDownloadAria: 'Preuzmi PDF',
      signatureClient: 'Potpis klijenta',
      signatureBank: 'Potpis ovlascenog lica banke',
      noDataMessage: 'Nema podataka za prikaz.',
      serialNumberLabel: 'Serijski broj',
      Creditor: 'Poverilac',
      Debtor: 'Dužnik',
      issueDateLabel: 'Datum izdavanja',
      actionLabel: 'Akcija',
      deleteSuccessTitle: 'Izbrisano!',
       errorTitle: 'Greška',
       deleteError: 'Došlo je do greške prilikom brisanja zapisa.',
    'Nedovoljno sredstava': 'Nedovoljno sredstava',
    'Korisnik blokiran': 'Korisnik blokiran',
    'Kasnjenje s uplatom': 'Kasnjenje sa uplatom'


    },
    en: {
      title: 'Rejected Bills of Exchange',
      issueDateLabel: 'Issue Date',
      actionLabel: 'Action',
      filterMessage: 'Please select at least one filter and click "Filter Data" to view results.',
      idLabel: 'ID',
      idPlaceholder: 'Enter ID number between 1-10',
      rejectionLabel: 'Rejection Reason',
      dateLabel: 'Date Received',
      employeeLabel: 'Employee',
      refreshButton: 'Reset Form',
      filterButton: 'Filter Data',
      showAllButton: 'Show All Data',
      addUserButton: 'Add New User',
      deleteConfirmTitle: 'Are you sure?',
      deleteConfirmText: 'This record will be permanently deleted!',
      deleteConfirmYes: 'Yes, delete it!',
      deleteConfirmCancel: 'Cancel',
      deleteSuccess: 'Record successfully deleted.',
      pdfDownloadLabel: 'Download PDF',
      actionDeleteAria: 'Delete',
      actionDownloadAria: 'Download PDF',
      signatureClient: 'Client Signature',
      signatureBank: 'Authorized Bank Representative Signature',
      noDataMessage: 'No data to display.',
      serialNumberLabel: 'Serial Number',
      deleteSuccessTitle: 'Deleted!',
     errorTitle: 'Error',
     deleteError: 'An error occurred while deleting the record.',
  'Nedovoljno sredstava': 'Insufficient funds',
    'Korisnik blokiran': 'User blocked',
    'Kasnjenje s uplatom': 'Payment delay'
  }
  };

translateRejectionReason(reason: string): string {
  return this.t(reason) || reason;
}
constructor(private http: HttpClient, private dialog: MatDialog, private userService: UserService) {}

  ngOnInit(): void {
    this.loadEmployeeList();
    this.loadRejectionReasons();

  this.loadAllBoeData();
  this.updateHighlightedDates();


    this.idControl.valueChanges.subscribe(() => {
    this.applyFilters();
  });

    this.filteredEmployees = this.employeeControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterEmployees(typeof value === 'string' ? value : this.displayEmployee(value)))
    );

    this.filteredRejectionReasons = this.rejectionControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterRejections(typeof value === 'string' ? value : this.displayRejection(value)))
    );

    // Autocomplete za pretragu po imenu u tabeli
    this.filteredSearchOptions = this.searchControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterSearchOptions(value || ''))
    );

    // Kad se menja vrednost pretrage po imenu, filtriraj tabelu
    this.searchControl.valueChanges.subscribe(value => {
      this.searchQuery = value || '';
      this.applyFilters();
    });
  }

  formatDateForComparison(input: any): string {
  let dateObj: Date;

  if (typeof input === 'string') {
    if (input.includes('.')) {
      // Format: DD.MM.YYYY
      const parts = input.split('.');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        dateObj = new Date(year, month, day);
      } else {
        return '';
      }
    } else {
      dateObj = new Date(input);
    }
  } else if (input instanceof Date) {
    dateObj = input;
  } else {
    return '';
  }

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  // Vraćamo kao ISO bez vremena: YYYY-MM-DD
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}


    changeLanguage(lang: 'sr' | 'en'): void {
    this.currentLang = lang;
  }
    t(key: string): string {
    return this.translations[this.currentLang][key] || key;
  }
showAllData(): void {
  this.loading = true;
  this.userService.getBOERecords().subscribe({
    next: (data) => {
      this.boeData = data;
      this.filteredBoeData = data;
      this.updateHighlightedDates(); // IZMENA: Dodato
      this.loading = false;
      this.isFilterSelected = true;
      this.showAddUserButton = true;
      this.applyFilters();
      console.log('Data received:', this.boeData);
      console.log('Dates for highlighting:', this.boeData.map(item => item.datumPrijema));
    },
    error: (err) => {
      this.loading = false;
      this.showAddUserButton = true;
      Swal.fire({
        icon: 'error',
        title: 'Greška',
        text: 'Greška pri dohvatanju svih podataka: ' + (err.message || err),
        confirmButtonText: 'OK',
      });
    },
  });
}
loadAllBoeData(): void {
  this.userService.getBOERecords().subscribe({
    next: (data) => {
      this.boeData = data;
      this.filteredBoeData = data;  // ako hoćeš da se odmah i tabela popuni
      this.updateHighlightedDates();  // ažuriraj istaknute datume
      this.dataLoaded = true;
      this.loading = false;
    },
    error: (err) => {
      this.boeData = [];
      this.filteredBoeData = [];
      this.dataLoaded = false;
      this.loading = false;
      Swal.fire('Greška', 'Greška pri učitavanju podataka: ' + (err.message || err), 'error');
    }
  });
}

debugDateFormats(): void {
  if (this.boeData && this.boeData.length > 0) {
    console.log('=== DEBUG DATE FORMATS ===');
    this.boeData.slice(0, 5).forEach((item, index) => {
      console.log(`Item ${index}:`);
      console.log('  Original datumPrijema:', item.datumPrijema);
      console.log('  Formatted:', this.formatDateForComparison(item.datumPrijema));
      console.log('  Type:', typeof item.datumPrijema);
    });

    if (this.selectedDate) {
      console.log('Selected date:', this.selectedDate);
      console.log('Formatted selected:', this.formatDateForComparison(this.selectedDate));
    }
    console.log('=== END DEBUG ===');
  }
}
 fetchData(): void {
  const hasFilter =
    (this.idControl.value && this.idControl.value !== '') ||
    (this.employeeControl.value && this.employeeControl.value !== '') ||
    (this.rejectionControl.value && this.rejectionControl.value !== '') ||
    (this.selectedDate !== null) ||
    (this.serialNumber && this.serialNumber !== '');

  if (!hasFilter) {
    this.isFilterSelected = false;
    this.dataLoaded = false;
    this.boeData = [];
    this.filteredBoeData = [];
    return;
  }

  this.isFilterSelected = true;
  this.loading = true;

  // IZMENA: Koristi novu formatiranje metodu
  const formattedDate = this.selectedDate ? this.formatDateForComparison(this.selectedDate) : '';

  const filters = {
    id: this.idControl.value || '',
    serialNumber: this.serialNumber || '',
    rejectionReason: this.rejectionControl.value
      ? typeof this.rejectionControl.value === 'string'
        ? this.rejectionControl.value
        : this.rejectionControl.value.reason
      : '',
    selectedDate: formattedDate,
    createdBy: this.employeeControl.value
      ? typeof this.employeeControl.value === 'string'
        ? this.employeeControl.value
        : `${this.employeeControl.value.firstName} ${this.employeeControl.value.lastName}`
      : '',
  };

  if (filters.id) {
    console.log('Searching by ID:', filters.id);

    this.userService.getBOERecords().subscribe({
      next: (allData) => {
        const foundRecord = allData.find(item =>
          item.ID.toString() === filters.id.toString()
        );

        if (foundRecord) {
          this.boeData = [foundRecord];
          this.filteredBoeData = [foundRecord];
        } else {
          this.boeData = [];
          this.filteredBoeData = [];
        }

        this.updateHighlightedDates(); // DODANO
        this.dataLoaded = true;
        this.loading = false;
        this.showAddUserButton = true;

        if (!foundRecord) {
          Swal.fire('Info', 'Nema podataka za dati ID.', 'info');
        }
      },
      error: (err) => {
        this.boeData = [];
        this.filteredBoeData = [];
        this.dataLoaded = false;
        this.loading = false;
        Swal.fire('Greška', 'Greška pri pretrazi po ID-u: ' + (err.message || err), 'error');
      }
    });
    return;
  }

  console.log('fetchData called with filters:', filters);

  this.userService.getBOERecords().subscribe({
    next: (data: any[]) => {
      this.boeData = data;
      this.updateHighlightedDates(); // DODANO
      this.applyFiltersWithCustomData(filters);
      this.dataLoaded = true;
      this.loading = false;
      this.showAddUserButton = true;
    },
    error: (err) => {
      this.loading = false;
      this.showAddUserButton = true;
      Swal.fire({
        icon: 'error',
        title: 'Greška',
        text: 'Greška pri dohvatanju podataka: ' + (err.message || err),
        confirmButtonText: 'OK'
      });
    },
  });
}
applyFiltersWithCustomData(filters: any): void {
  if (!this.boeData) {
    this.filteredBoeData = [];
    return;
  }

  this.filteredBoeData = this.boeData.filter(item => {
    const matchID = filters.id ?
      item.ID.toString().toLowerCase().includes(filters.id.toLowerCase()) : true;

    const matchRejection = filters.rejectionReason ?
      (item.rejectionReason || '').toLowerCase().includes(filters.rejectionReason.toLowerCase()) : true;

    // IZMENA: Koristi novu formatiranje metodu
    let matchDate = true;
    if (filters.selectedDate) {
      const itemDateFormatted = this.formatDateForComparison(item.datumPrijema);
      matchDate = itemDateFormatted === filters.selectedDate;
      console.log('Date comparison:', itemDateFormatted, 'vs', filters.selectedDate, '=', matchDate);
    }

    const matchCreatedBy = filters.createdBy ?
      (item.createdBy || '').toLowerCase().includes(filters.createdBy.toLowerCase()) : true;

    const matchSerial = filters.serialNumber ?
      (item.serijskibroj || '').toLowerCase().includes(filters.serialNumber.toLowerCase()) : true;

    return matchID && matchRejection && matchDate && matchCreatedBy && matchSerial;
  });
}

applyFilters(): void {
  if (
  !this.idControl.value &&
  !this.employeeControl.value &&
  !this.rejectionControl.value &&
  !this.selectedDate &&
  !this.searchQuery
) {
  console.log('All filters are empty, skipping filtering.');
  this.filteredBoeData = this.boeData;
  return;
}

  if (!this.boeData) {
    this.filteredBoeData = [];
    return;
  }

  const idFilter = this.idControl.value ? this.idControl.value.toString().toLowerCase() : '';

  const rejectionFilter = this.rejectionControl.value
    ? (typeof this.rejectionControl.value === 'string'
        ? this.rejectionControl.value.toLowerCase()
        : this.rejectionControl.value.reason.toLowerCase())
    : '';

  const dateFilter = this.selectedDate ? this.formatDateForComparison(this.selectedDate) : '';

  const createdByFilter = this.employeeControl.value
    ? (typeof this.employeeControl.value === 'string'
        ? this.employeeControl.value.toLowerCase()
        : `${this.employeeControl.value.firstName} ${this.employeeControl.value.lastName}`.toLowerCase())
    : '';

  const searchFilter = this.searchQuery.toLowerCase();

  this.filteredBoeData = this.boeData.filter(item => {
    const matchID = idFilter ? item.ID.toString().toLowerCase().includes(idFilter) : true;

    const matchRejection = rejectionFilter
      ? (item.rejectionReason || '').toLowerCase().includes(rejectionFilter)
      : true;

    const matchDate = dateFilter
      ? this.formatDateForComparison(item.datumPrijema) === dateFilter
      : true;

    const matchCreatedBy = createdByFilter
      ? (item.createdBy || '').toLowerCase().includes(createdByFilter)
      : true;

    const matchSearch = searchFilter
      ? (item.createdBy || '').toLowerCase().includes(searchFilter)
      : true;

    return matchID && matchRejection && matchDate && matchCreatedBy && matchSearch;
  });
}


updateHighlightedDates(): void {
  this.highlightedDates = this.boeData
    .map((item) => {
      let dateObj: Date;

      if (typeof item.datumPrijema === 'string') {
        if (item.datumPrijema.includes('.')) {
          // Format: DD.MM.YYYY
          const parts = item.datumPrijema.split('.');
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // meseci su 0-indeksirani
            const year = parseInt(parts[2], 10);
            dateObj = new Date(year, month, day);
          } else {
            return null; // Nevažeći format
          }
        } else {
          dateObj = new Date(item.datumPrijema); // ISO string
        }
      } else {
        dateObj = new Date(item.datumPrijema); // već Date objekat
      }

      // Provera validnosti datuma
      if (isNaN(dateObj.getTime())) {
        return null;
      }

      // Normalizuj na ponoć (bez vremenske komponente)
      return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    })
    .filter((date): date is Date => date !== null); // Ukloni null vrednosti

  console.log('Highlighted dates updated:', this.highlightedDates);
}




  addNewUser(): void {
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      width: '650px',
    });
    dialogRef.afterClosed().subscribe(result => {
    if (result === 'created') {
      this.showAllData(); // ponovo učitaj podatke
      this.loadEmployeeList();
      Swal.fire('Uspeh', 'Korisnik je uspešno dodat!', 'success');
    }
    });
  }

  loadEmployeeList(): void {
    this.userService.getEmployees().subscribe({
      next: (data) => {
        this.employeeList = data;
        this.employeeControl.setValue(this.employeeControl.value); // osveži filter
      },
      error: (err) => console.error('Greška pri učitavanju zaposlenih:', err)
    });
  }

  loadRejectionReasons(): void {
    this.userService.getRejectionReasons().subscribe({
      next: (data) => {
        this.rejectionReasons = data;
        this.rejectionControl.setValue(this.rejectionControl.value); // osveži filter
      },
      error: (err) => console.error('Greška pri učitavanju razloga odbijanja:', err)
    });
  }

  filterEmployees(value: string): Employee[] {
    const filterValue = value.toLowerCase();
    return this.employeeList.filter(emp =>
      (`${emp.firstName} ${emp.lastName}`).toLowerCase().includes(filterValue)
    );
  }

  displayEmployee(emp: Employee | null): string {
    return emp ? `${emp.firstName} ${emp.lastName}` : '';
  }

  filterRejections(value: string): RejectionReason[] {
    const filterValue = value.toLowerCase();
    return this.rejectionReasons.filter(reason =>
      reason.reason.toLowerCase().includes(filterValue)
    );
  }

  displayRejection(reason: RejectionReason | null): string {
    return reason ? reason.reason : '';
  }

  private _filterSearchOptions(value: string): string[] {
    const filterValue = value.toLowerCase();

    const allOptions = this.boeData.map(item => item.createdBy || '');

    const uniqueOptions = Array.from(new Set(allOptions));

    return uniqueOptions.filter(option =>
      option.toLowerCase().includes(filterValue)
    );
  }

deleteItem(id: number): void {
  Swal.fire({
    title: this.t('deleteConfirmTitle'),
    text: this.t('deleteConfirmText'),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: this.t('deleteConfirmYes'),
    cancelButtonText: this.t('deleteConfirmCancel')
  }).then((result) => {
    if (result.isConfirmed) {
      this.loading = true;
      this.userService.deleteBoeRecord(id).subscribe({
        next: () => {
          this.filteredBoeData = this.filteredBoeData.filter(item => item.ID !== id);
          this.boeData = this.boeData.filter(item => item.ID !== id);
          this.loading = false;
          Swal.fire(this.t('deleteSuccessTitle') || 'Deleted!', this.t('deleteSuccess'), 'success');
        },
        error: () => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: this.t('errorTitle') || 'Error',
            text: this.t('deleteError') || 'An error occurred while deleting the record.'
          });
        }
      });
    }
  });
}



resetForm(): void {
  this.idControl.setValue('');
  this.employeeControl.setValue(null);
  this.rejectionControl.setValue(null);
  this.selectedDate = null;
  this.searchControl.setValue('');
  this.serialNumber = '';

  // Sakrij tabelu i izbriši podatke
  this.isFilterSelected = false;
  this.boeData = [];
  this.filteredBoeData = [];
}

downloadAsPDF(item: any): void {
  const doc = new jsPDF();

  doc.text('Detalji menice', 14, 15);

  autoTable(doc, {
    startY: 25,
    head: [['Naziv', 'Vrednost']],
    body: [
      ['ID', item.ID],
      ['Serijski broj', item.serijskibroj],
      ['Poverilac', item.poverilac],
      ['Dužnik', item.duznik],
      ['Datum prijema', item.datumPrijema],
      ['Datum izdavanja', item.datumIzdavanja],
      ['Zaposleni', item.createdBy],
      ['Razlog odbijanja', item.rejectionReason || '-'],
    ],
  });

  const finalY = (doc as any).lastAutoTable.finalY || 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  const lineY = finalY + 30; // y pozicija linija
  const textOffsetY = 7;     // koliko ispod linije se stavlja tekst
  const lineLength = (pageWidth - 2 * margin) / 2 - 20; // duzina svake linije (sa malo razmaka)

  // LEVA linija
  const leftLineStartX = margin;
  const leftLineEndX = leftLineStartX + lineLength;
  doc.line(leftLineStartX, lineY, leftLineEndX, lineY);

  // TEKST ispod LEVE linije (centar linije)
  const leftText = 'Potpis klijenta';
  const leftTextWidth = doc.getTextWidth(leftText);
  const leftTextX = leftLineStartX + (lineLength / 2) - (leftTextWidth / 2);
  const leftTextY = lineY + textOffsetY;
  doc.setFontSize(10);
  doc.text(leftText, leftTextX, leftTextY);

  // DESNA linija
  const rightLineEndX = pageWidth - margin;
  const rightLineStartX = rightLineEndX - lineLength;
  doc.line(rightLineStartX, lineY, rightLineEndX, lineY);

  const rightText = 'Potpis ovlascenog lica banke';
  const rightTextWidth = doc.getTextWidth(rightText);
  const rightTextX = rightLineStartX + (lineLength / 2) - (rightTextWidth / 2);
  const rightTextY = lineY + textOffsetY;
  doc.setFontSize(10);
doc.text(rightText, rightTextX, rightTextY);

  doc.save(`menica_${item.ID}.pdf`);
}


}
