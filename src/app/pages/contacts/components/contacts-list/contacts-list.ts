import { Component, inject, computed } from '@angular/core';
import { SingleContact } from '../../../../interfaces/single-contact';
import { CommonModule } from '@angular/common';
import { ContactsService } from '../../../../services/contacts-service'; // Service importieren

/**
 * Komponente zur Anzeige einer Liste von Kontakten, gruppiert nach Anfangsbuchstaben.
 * Implementiert AfterContentInit, um die Gruppierung nach Initialisierung vorzunehmen.
 */
@Component({
  selector: 'app-contacts-list',
  imports: [CommonModule],
  templateUrl: './contacts-list.html',
  styleUrl: './contacts-list.scss',
})
export class ContactsList {

  contactsService = inject(ContactsService); // Service injizieren

  /** Computed signal for contacts */
  contactList = computed(() => this.contactsService.contacts());


  /**
   * Gruppiert die Kontakte nach ihrem Anfangsbuchstaben.
   */
  contactGroup = computed(() => {
    const groups: string[] = [];
    for (const contact of this.contactList()) {
      const initial = contact.name.charAt(0).toUpperCase();
      if (!groups.includes(initial)) {
        groups.push(initial);
      }
    }
    return groups.sort((a, b) => a.localeCompare(b, 'de'));
  });

  /** Get initials from name (e.g., "Anna Müller" -> "AM") */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

    /** Get CSS class for contact icon color */
  getIconColorClass(contact: SingleContact): string {
    if (contact.color) {
      return contact.color;
    }
    const lettersArray = 'ABCDEFGHJKLMNOPQRSTUVW'.split('');
    const nameParts = contact.name.split(' ');
    const letter = (nameParts[1]?.charAt(0) || nameParts[0].charAt(0)).toUpperCase();
    const index = lettersArray.indexOf(letter);
    const colorId = index !== -1 ? (index % 15) + 1 : 1;
    return `icon-${colorId}`;
  }
}
