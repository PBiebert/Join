import { inject, Injectable, OnDestroy } from '@angular/core';
import {
  collection,
  Firestore,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
} from '@angular/fire/firestore';
import { SingleContact } from '../interfaces/single-contact';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContactsService implements OnDestroy {
  /** Zentrale Quelle für Kontaktlisten. */
  contacts: SingleContact[] = [];
  /** Zentrale Quelle für Kontaktgruppen. */
  contactGroups: string[] = [];
  /** Aktiver Kontakt. */
  activContact: SingleContact | null = null;
  /** Status des Editiermodus. */
  isEditMode = false;
  /** Firestore-Instanz. */
  contactsDB: Firestore = inject(Firestore);
  /** Unsubscribe-Funktion für Kontakte. */
  unsubContacts;

  /**
   * Steuert das Öffnen/Schließen des Dialogs.
   */
  private openDialogSubject = new BehaviorSubject<boolean>(false);

  /**
   * Observable für den Dialog-Status.
   */
  openDialog$: Observable<boolean> = this.openDialogSubject.asObservable();

  constructor() {
    this.unsubContacts = this.subContactsList();
  }

  /**
   * Erstellt ein Kontaktobjekt aus Daten und einer ID.
   * @param obj Quelldaten
   * @param id Kontakt-ID
   * @returns Das erzeugte Kontaktobjekt
   */
  setContactObject(obj: any, id: string): SingleContact {
    return {
      id: id,
      name: obj.name || '',
      email: obj.email || '',
      phone: obj.phone || '',
    };
  }

  /**
   * Gibt die Referenz auf die Kontaktsammlung zurück.
   * @returns Die Collection-Referenz für Kontakte
   */
  getNotesRef() {
    return collection(this.contactsDB, 'contacts');
  }

  /**
   * Abonniert die Kontaktliste in Firebase mit Echtzeit-Updates.
   * @returns Die Unsubscribe-Funktion für das Abonnement
   */
  subContactsList() {
    return onSnapshot(this.getNotesRef(), (list) => {
      this.contacts = [];
      list.forEach((element) => {
        this.contacts.push(this.setContactObject(element.data(), element.id));
      });
      this.updateContactGroups();
      this.refreshActivContact();
    });
  }

  /**
   * Beendet das Abonnement der Kontakte.
   * @returns void
   */
  ngOnDestroy(): void {
    if (this.unsubContacts) this.unsubContacts();
  }

  /**
   * Gibt die aktuelle Kontaktliste zurück.
   * @returns Die Kontaktliste
   */
  getContacts(): SingleContact[] {
    return this.contacts;
  }

  /**
   * Gibt die Kontaktgruppen zurück.
   * @returns Die Kontaktgruppen
   */
  getContactGroups(): string[] {
    return this.contactGroups;
  }

  /**
   * Berechnet die Kontaktgruppen.
   * @returns void
   */
  updateContactGroups(): void {
    this.contactGroups = [];
    for (let position = 0; position < this.contacts.length; position++) {
      const initialLetter = this.contacts[position].name.charAt(0);
      if (!this.contactGroups.includes(initialLetter)) {
        this.contactGroups.push(initialLetter);
      }
    }
    this.contactGroups = this.contactGroups.sort();
  }

  /**
   * Synchronisiert den aktiven Kontakt mit den aktuellen Daten aus der Kontaktliste.
   * @private
   * @returns void
   */
  private refreshActivContact(): void {
    if (!this.activContact || !this.activContact.id) {
      return;
    }
    const updatedContact = this.contacts.find((contact) => contact.id === this.activContact!.id);
    this.activContact = updatedContact || null;
  }

  /**
   * Setzt den angeklickten Kontakt als aktiv.
   * @param clickedContact Der ausgewählte Kontakt
   * @returns void
   */
  getActivContact(clickedContact: SingleContact): void {
    this.activContact = clickedContact;
    console.log(this.activContact);
  }

  /**
   * Gibt die Initialen eines Namens zurück.
   * @param name Name des Kontakts
   * @returns Die Initialen (maximal 2 Buchstaben)
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  /**
   * Berechnet die Icon-Farbe für einen Kontakt.
   * @param contact Kontaktobjekt
   * @returns CSS-Klassenname für die Icon-Farbe
   */
  getIconColorClass(contact: SingleContact): string {
    const lettersArray = 'ABCDEFGHJKLMNOPQRSTUVW'.split('');
    const nameParts = contact.name.split(' ');
    const letter = (nameParts[1]?.charAt(0) || nameParts[0].charAt(0)).toUpperCase();
    const index = lettersArray.indexOf(letter);
    const colorId = index !== -1 ? (index % 15) + 1 : 1;
    return `icon-${colorId}`;
  }

  /**
   * Gibt die Referenz zu einem einzelnen Kontakt-Dokument zurück.
   * @param contactId Die ID des Kontakts
   * @returns Die Dokument-Referenz
   * @private
   */
  private getSingleContactRef(contactId: string) {
    return doc(this.contactsDB, 'contacts', contactId);
  }

  /**
   * Löscht einen Kontakt aus Firebase.
   * @param contactId Die ID des zu löschenden Kontakts
   * @returns Promise, das abgeschlossen wird, wenn der Kontakt gelöscht wurde
   */
  async deleteContact(contactId: string): Promise<void> {
    const contactRef = this.getSingleContactRef(contactId);
    await deleteDoc(contactRef);
    this.activContact = null;
  }

  /**
   * Aktualisiert einen bestehenden Kontakt in Firebase.
   * @param contactId Die ID des Kontakts
   * @param updatedData Neue Daten (name, email, phone)
   * @returns Promise, das abgeschlossen wird, wenn der Kontakt aktualisiert wurde
   */
  async updateContact(contactId: string, updatedData: Partial<SingleContact>): Promise<void> {
    const contactRef = this.getSingleContactRef(contactId);
    await updateDoc(contactRef, updatedData);
  }

  /**
   * Fügt einen neuen Kontakt zur Datenbank hinzu.
   * @param addNewSingleContact Das Kontaktobjekt
   * @returns Promise, das abgeschlossen wird, wenn der Kontakt hinzugefügt wurde
   */
  async addNewSingleContactToDB(addNewSingleContact: SingleContact): Promise<void> {
    await addDoc(collection(this.contactsDB, 'contacts'), addNewSingleContact);
  }

  /**
   * Öffnet das Modal zum Hinzufügen eines Kontakts.
   * @returns void
   */
  openAddContactDialog(): void {
    this.openDialogSubject.next(true);
  }

  /**
   * Öffnet den Dialog im Edit-Modus.
   * @returns void
   */
  openEditContactDialog(): void {
    this.isEditMode = true;
    this.openDialogSubject.next(true);
  }

  /**
   * Schließt den Dialog und setzt den Edit-Modus zurück.
   * @returns void
   */
  closeAddContactDialog(): void {
    this.openDialogSubject.next(false);
  }
}
