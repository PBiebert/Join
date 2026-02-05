import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ContactsService } from '../../../../services/contacts-service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-dialog',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-dialog.html',
  styleUrl: './contact-dialog.scss',
})
export class ContactDialog implements AfterViewInit {
  contactsService = inject(ContactsService);
  @ViewChild('dialogRef') dialogRef!: ElementRef;
  private dialogSub!: Subscription;
  isClosing = false;

  showSnackbar = false;
  snackbarMessage = '';

  addNewSingleContact = {
    name: '',
    email: '',
    phone: '',
  };

  // This function checks if the name has at least 2 characters besides spaces
  isNameValid(): boolean {
    return this.addNewSingleContact.name.trim().length >= 2;
  }

  async createNewContact() {
    if (!this.isNameValid()) return;

    await this.contactsService.addNewSingleContactToDB({
      name: this.addNewSingleContact.name.trim(),
      email: this.addNewSingleContact.email,
      phone: this.addNewSingleContact.phone,
    });
    this.showSuccessSnackbar();
    this.clearInputFields();
    this.contactsService.closeAddContactDialog();
  }

  showSuccessSnackbar() {
    this.snackbarMessage = 'Account successfully created!';
    this.showSnackbar = true;
    
    setTimeout(() => {
      this.showSnackbar = false;
    }, 3000);
  }

  clearInputFields() {
    this.addNewSingleContact.name = '';
    this.addNewSingleContact.email = '';
    this.addNewSingleContact.phone = '';
  }

  openDialogWithAnimation() {
    this.isClosing = false;
    this.dialogRef.nativeElement.classList.remove('slide-out');
    this.dialogRef.nativeElement.classList.add('slide-in');
    this.dialogRef.nativeElement.showModal();
  }

  closeDialogWithAnimation() {
    this.isClosing = true;
    this.dialogRef.nativeElement.classList.remove('slide-in');
    this.dialogRef.nativeElement.classList.add('slide-out');
    setTimeout(() => {
      this.dialogRef.nativeElement.close();
      this.isClosing = false;
      this.dialogRef.nativeElement.classList.remove('slide-out');
    }, 500); // Dauer muss mit CSS übereinstimmen
  }

  /**
   * Lifecycle-Hook, der nach der Initialisierung der View aufgerufen wird.
   * Hier wird das Dialog-Observable abonniert, um auf Änderungen des Dialog-Status zu reagieren.
   * Das ist notwendig, weil das Dialog-Element erst nach dem Rendern der View verfügbar ist.
   */
  ngAfterViewInit() {
    // Wir speichern die Subscription, um sie später wieder aufheben zu können (Speicherlecks vermeiden).
    this.dialogSub = this.contactsService.openDialog$.subscribe((dialogOpen) => {
      // Überprüft, ob das Dialog geöffnet werden soll (true).
      if (dialogOpen) {
        // Öffnet das native HTML-Dialog-Element per showModal().
        // Dadurch wird das Dialog-Fenster angezeigt.
        this.openDialogWithAnimation();
      } else {
        this.closeDialogWithAnimation();
      }
      // Falls dialogOpen false ist, passiert hier nichts (Dialog bleibt geschlossen).
    });
  }

  /**
   * Lifecycle-Hook, der aufgerufen wird, wenn die Komponente zerstört wird.
   * Hier wird die Subscription wieder aufgehoben, um Speicherlecks zu vermeiden.
   * Das ist wichtig, weil sonst das Observable weiterläuft, auch wenn die Komponente nicht mehr existiert.
   */
  ngOnDestroy() {
    // Überprüft, ob eine Subscription existiert, und beendet sie.
    this.dialogSub?.unsubscribe();
  }
}