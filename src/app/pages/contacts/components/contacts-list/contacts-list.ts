import { AfterContentInit, Component, inject } from '@angular/core';
import { SingleContact } from '../../../../interfaces/single-contact';
import { TestContactService } from '../../../../services/test-contact-service';
import { CommonModule } from '@angular/common';

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
export class ContactsList implements AfterContentInit {
  /**
   * Die Liste aller Kontakte, bereitgestellt vom TestContactService.
   */
  contactList: SingleContact[] = inject(TestContactService).contacts;

  /**
   * Enthält die Anfangsbuchstaben, nach denen die Kontakte gruppiert werden.
   */
  contactGroup: string[] = [];

  /**
   * Gruppiert die Kontakte nach ihrem Anfangsbuchstaben.
   * Wird nach dem Laden des Inhalts aufgerufen.
   */
  ngAfterContentInit(): void {
    this.setContactGroups();
  }

  /**
   * Gruppiert die Kontakte nach ihrem Anfangsbuchstaben.
   */
  setContactGroups() {
    for (let position = 0; position < this.contactList.length; position++) {
      const InitialLetter = this.contactList[position].name.charAt(0);
      if (!this.contactGroup.includes(InitialLetter)) {
        this.contactGroup.push(InitialLetter);
      } else {
        continue;
      }
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('');
  }

  getIconColorClass(contact: SingleContact): string {
    const lettersArray = 'ABCDEFGHJKLMNOPQRSTUVW'.split('');
    const nameParts = contact.name.split(' ');
    const letter = (nameParts[1]?.charAt(0) || nameParts[0].charAt(0)).toUpperCase();
    const index = lettersArray.indexOf(letter);
    const colorId = index !== -1 ? (index % 15) + 1 : 1;
    return `icon-${colorId}`;
  }
}
