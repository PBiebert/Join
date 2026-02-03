import { inject, Injectable, OnDestroy } from '@angular/core';
import {
  collection,
  Firestore,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { SingleContact } from '../interfaces/single-contact';

@Injectable({
  providedIn: 'root',
})
export class ContactsService implements OnDestroy {
  // Zentrale Quelle für Kontaktlisten und Gruppen
  contacts: SingleContact[] = [];
  contactGroups: string[] = [];
  activContact: SingleContact | null = null;
  contactsDB: Firestore = inject(Firestore);
  unsubContacts;

  constructor() {
    this.unsubContacts = this.subContactsList();
  }

  setContactObject(obj: any, id: string): SingleContact {
    return {
      id: id,
      name: obj.name || '',
      email: obj.email || '',
      phone: obj.phone || '',
    };
  }

  getNotesRef() {
    return collection(this.contactsDB, 'contacts');
  }

  subContactsList() {
    return onSnapshot(this.getNotesRef(), (list) => {
      this.contacts = [];
      list.forEach((element) => {
        this.contacts.push(this.setContactObject(element.data(), element.id));
      });
      // Nach Datenupdate Gruppen neu berechnen
      this.updateContactGroups();
    });
  }

  ngOnDestroy(): void {
    if (this.unsubContacts) this.unsubContacts();
  }

  // Gibt die zentrale Kontaktliste aus
  getContacts(): SingleContact[] {
    return this.contacts;
  }

  // Gibt die zentral berechneten Gruppen aus
  getContactGroups(): string[] {
    return this.contactGroups;
  }

  // Berechnet Gruppen einmal zentral für alle Components
  updateContactGroups(): void {
    this.contactGroups = [];
    for (let position = 0; position < this.contacts.length; position++) {
      const initialLetter = this.contacts[position].name.charAt(0);
      if (!this.contactGroups.includes(initialLetter)) {
        this.contactGroups.push(initialLetter);
      }
    }
  }

  /**
   * Setzt den angeklickten Kontakt als aktuell aktiven Kontakt.
   * @param clickedContact - Der ausgewählte Kontakt, wird in this.activContact gespeichert.
   */
  getActivContact(clickedContact: SingleContact) {
    this.activContact = clickedContact;
    console.log(this.activContact);
  }

  // Helper: Initialen zentral bereitstellen
  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('');
  }

  // Helper: Icon-Farbe zentral berechnen
  getIconColorClass(contact: SingleContact): string {
    const lettersArray = 'ABCDEFGHJKLMNOPQRSTUVW'.split('');
    const nameParts = contact.name.split(' ');
    const letter = (nameParts[1]?.charAt(0) || nameParts[0].charAt(0)).toUpperCase();
    const index = lettersArray.indexOf(letter);
    const colorId = index !== -1 ? (index % 15) + 1 : 1;
    return `icon-${colorId}`;
  }

  /* ============================================================
   * CRUD-OPERATIONEN (Edit & Delete)
   * Hinzugefügt von: Akin
   * ============================================================ */

  /**
   * Gibt die Referenz zu einem einzelnen Kontakt-Dokument zurück.
   * @param contactId - Die ID des Kontakts in Firebase
   */
  private getSingleContactRef(contactId: string) {
    return doc(this.contactsDB, 'contacts', contactId);
  }

  /**
   * Löscht einen Kontakt aus Firebase.
   * @param contactId - Die ID des zu löschenden Kontakts
   */
  async deleteContact(contactId: string): Promise<void> {
    const contactRef = this.getSingleContactRef(contactId);
    await deleteDoc(contactRef);
    this.activContact = null;
  }

  /**
   * Aktualisiert einen bestehenden Kontakt in Firebase.
   * @param contactId - Die ID des Kontakts
   * @param updatedData - Die neuen Daten (name, email, phone)
   */
  async updateContact(
    contactId: string,
    updatedData: Partial<SingleContact>
  ): Promise<void> {
    const contactRef = this.getSingleContactRef(contactId);
    await updateDoc(contactRef, updatedData);
  }
}
