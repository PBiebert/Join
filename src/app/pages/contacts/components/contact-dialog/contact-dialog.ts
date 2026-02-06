import { AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild, HostListener } from '@angular/core';
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
export class ContactDialog implements AfterViewInit, OnDestroy {
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

  // This flag tracks if the submit button was clicked
  submitted = false;

  // This function checks if the name has at least 2 characters besides spaces
  isNameValid(): boolean {
    return this.addNewSingleContact.name.trim().length >= 2;
  }

  // This function checks if the email is valid
  isEmailValid(): boolean {
    const email = this.addNewSingleContact.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isPhoneValid(): boolean {
    const phone = this.addNewSingleContact.phone.trim();
    if (!phone) return true;
    const phoneRegex = /^\+?\d+$/;
    return phoneRegex.test(phone);
  }

  // This function checks if the whole form is valid
  isFormValid(): boolean {
    return this.isNameValid() && this.isEmailValid() && this.isPhoneValid();
  }

  @HostListener('input', ['$event'])
  onPhoneInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target?.name === 'phone') {
      target.value = target.value.replace(/[^+\d]/g, '');
      this.addNewSingleContact.phone = target.value;
    }
  }

  /**
   * Speichert den Kontakt – unterscheidet zwischen Add und Edit.
   * Edit-Modus: Aktualisiert den bestehenden Kontakt in Firebase.
   * Add-Modus: Legt einen neuen Kontakt in Firebase an.
   * Schließt den Dialog erst NACH erfolgreichem Speichern.
   */
  async saveContact(): Promise<void> {
    if (!this.isFormValid()) return;
    // Formulardaten zusammenstellen
    const contactData = this.buildContactData();
    // Je nach Modus: Update oder Neu anlegen
    if (this.contactsService.isEditMode) {
      await this.updateExistingContact(contactData);
    } else {
      await this.contactsService.addNewSingleContactToDB(contactData);
    }
    this.handleSuccessfulSave();
  }

  /**
   * Erstellt das Datenobjekt aus den Formularfeldern.
   * Trimmt den Namen, um führende/folgende Leerzeichen zu entfernen.
   * @returns Objekt mit name, email und phone
   */
  private buildContactData(): { name: string; email: string; phone: string } {
    return {
      name: this.addNewSingleContact.name.trim(),
      email: this.addNewSingleContact.email.trim(),
      phone: this.addNewSingleContact.phone.trim(),
    };
  }

  /**
   * Aktualisiert den aktiven Kontakt in Firebase.
   * Holt die ID aus activContact und ruft updateContact() im Service auf.
   * @param data - Die aktualisierten Kontaktdaten
   */
  private async updateExistingContact(data: {
    name: string;
    email: string;
    phone: string;
  }): Promise<void> {
    const contactId = this.contactsService.activContact?.id;
    if (contactId) {
      await this.contactsService.updateContact(contactId, data);
    }
  }

  /**
   * Wird nach erfolgreichem Speichern aufgerufen.
   * Zeigt die Erfolgs-Snackbar, leert das Formular und schließt den Dialog.
   */
  private handleSuccessfulSave(): void {
    this.submitted = false; // reset flag nach erfolgreichem Speichern
    this.showSuccessSnackbar();
    this.clearInputFields();
    this.contactsService.closeAddContactDialog();
  }

  /**
   * Zeigt eine Erfolgs-Snackbar mit passender Nachricht.
   * Edit-Modus: "Contact successfully updated!"
   * Add-Modus: "Contact successfully created!"
   * Die Snackbar verschwindet automatisch nach 3 Sekunden.
   */
  showSuccessSnackbar(): void {
    // Nachricht je nach Modus setzen
    this.snackbarMessage = this.contactsService.isEditMode
      ? 'Contact successfully updated!'
      : 'Contact successfully created!';
    this.showSnackbar = true;
    // Nach 3 Sekunden automatisch ausblenden
    setTimeout(() => {
      this.showSnackbar = false;
    }, 3000);
  }

  clearInputFields() {
    this.addNewSingleContact.name = '';
    this.addNewSingleContact.email = '';
    this.addNewSingleContact.phone = '';
  }

  resetForm() {
    this.submitted = false;
  }

  closeDialog() {
    this.resetForm();
    this.contactsService.closeAddContactDialog();
  }

  cancelDialog() {
    this.resetForm();
    this.contactsService.closeAddContactDialog();
  }

  /**
   * Befüllt das Formular je nach Modus.
   * Edit-Modus: Lädt die Daten des aktiven Kontakts in die Formularfelder.
   * Add-Modus: Leert alle Felder für einen neuen Kontakt.
   * Wird aufgerufen, bevor der Dialog sichtbar wird.
   */
  private loadFormData(): void {
    const contact = this.contactsService.activContact;
    // Prüft: Sind wir im Edit-Modus UND gibt es einen aktiven Kontakt?
    if (this.contactsService.isEditMode && contact) {
      // Ja → Formular mit bestehenden Daten füllen
      this.addNewSingleContact.name = contact.name;
      this.addNewSingleContact.email = contact.email;
      this.addNewSingleContact.phone = contact.phone;
    } else {
      // Nein → Formular leeren (Add-Modus)
      this.clearInputFields();
    }
    this.resetForm();
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
   * Lifecycle-Hook: Wird aufgerufen, nachdem die View initialisiert wurde.
   * Hier abonnieren wir das Dialog-Observable aus dem Service.
   * Bei jeder Änderung (true/false) reagiert der Dialog entsprechend.
   * Das ist das BehaviorSubject-Pattern aus der Dokumentation von Philipp.
   */
  ngAfterViewInit(): void {
    // Subscription speichern, um sie in ngOnDestroy aufheben zu können
    this.dialogSub = this.contactsService.openDialog$.subscribe((dialogOpen) => {
      if (dialogOpen) {
        // Erst Formulardaten laden (Edit: befüllen, Add: leeren)
        this.loadFormData();
        // Dann Dialog mit Animation öffnen
        this.openDialogWithAnimation();
      } else {
        // Dialog mit Animation schließen
        this.closeDialogWithAnimation();
      }
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

  // Neue Methode zum kontrollierten Submit mit Fehlermeldungen anzeigen
  onSubmit(): void {
    this.submitted = true;
    if (!this.isFormValid()) return;
    this.saveContact();
  }
}