import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactsService } from '../../../../services/contacts-service';

/**
 * ContactDetails – Zeigt die Detailansicht des ausgewählten Kontakts.
 *
 * Bezieht alle Daten aus contactsService.activContact.
 * Edit und Delete nutzen die Service-Methoden für Firebase.
 */
@Component({
  selector: 'app-contact-details',
  imports: [CommonModule],
  templateUrl: './contact-details.html',
  styleUrl: './contact-details.scss',
})
export class ContactDetails {
  /**
   * Zugriff auf den zentralen ContactsService.
   * Public, damit das Template darauf zugreifen kann.
   */
  contactsService = inject(ContactsService);

  /**
   * Öffnet den Bearbeiten-Dialog.
   * 🔲 PLATZHALTER: Dialog-Komponente kommt von Teammitglied.
   */
  protected onEdit(): void {
    const contact = this.contactsService.activContact;
    if (contact) {
      console.log('Edit-Dialog öffnen für:', contact.name);
      // TODO: Dialog öffnen, wenn Komponente fertig ist
    }
  }

  /**
   * Löscht den aktuellen Kontakt aus Firebase.
   * Nutzt deleteContact() aus dem ContactsService.
   */
  protected async onDelete(): Promise<void> {
    const contact = this.contactsService.activContact;
    if (contact && contact.id) {
      await this.contactsService.deleteContact(contact.id);
    }
  }
}