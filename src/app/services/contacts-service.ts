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
  // Zentrale Quelle für Kontaktlisten und Gruppen
  contacts: SingleContact[] = [];
  contactGroups: string[] = [];
  activContact: SingleContact | null = null;
  isEditMode = false;
  contactsDB: Firestore = inject(Firestore);
  unsubContacts;

  // Erstellt ein BehaviorSubject mit Startwert 'false' (Modal ist geschlossen)
  private openDialogSubject = new BehaviorSubject<boolean>(false);
  // Gibt das Subject als Observable nach außen, damit Komponenten abonnieren können
  // Das $ am Ende von 'openDialog$' ist eine Konvention, um zu kennzeichnen, dass es sich um ein Observable handelt.
  // So erkennt man direkt, dass man dieses Property abonnieren kann und nicht direkt verändert.
  // Die Methode asObservable() wandelt das BehaviorSubject in ein Observable um.
  // Dadurch können andere Komponenten den Wert abonnieren, aber nicht direkt verändern.
  openDialog$: Observable<boolean> = this.openDialogSubject.asObservable();

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

  /**
   * Abonniert die Kontaktliste in Firebase mit Echtzeit-Updates.
   * Bei jeder Änderung (Add, Edit, Delete) wird die lokale Liste aktualisiert.
   * Nutzt onSnapshot für reaktive Datenbindung.
   */
  subContactsList() {
    return onSnapshot(this.getNotesRef(), (list) => {
      // Liste leeren und neu aufbauen
      this.contacts = [];
      list.forEach((element) => {
        this.contacts.push(this.setContactObject(element.data(), element.id));
      });
      // Gruppen (A, B, C...) neu berechnen
      this.updateContactGroups();
      // Aktiven Kontakt mit neuen Daten synchronisieren
      this.refreshActivContact();
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
   * Synchronisiert activContact mit den neuesten Daten aus Firebase.
   * Wird nach jedem onSnapshot-Update aufgerufen.
   * Sucht den Kontakt mit der gleichen ID in der aktualisierten Liste
   * und ersetzt activContact mit den neuen Daten.
   * Falls der Kontakt gelöscht wurde, wird activContact auf null gesetzt.
   */
  private refreshActivContact(): void {
    // Nur ausführen, wenn ein Kontakt ausgewählt ist
    if (!this.activContact || !this.activContact.id) {
      return;
    }
    // Kontakt mit gleicher ID in der aktualisierten Liste suchen
    const updatedContact = this.contacts.find((contact) => contact.id === this.activContact!.id);
    // Gefunden? → activContact aktualisieren. Nicht gefunden? → null setzen.
    this.activContact = updatedContact || null;
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
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  // Helper: Icon-Farbe zentral berechnen
  // wenn es keine Zahl ist, ist der Wert immer 1
  getIconColorClass(contact: SingleContact): string {
    const lettersArray = 'ABCDEFGHJKLMNOPQRSTUVW'.split('');
    const nameParts = contact.name.split(' ');
    const letter = (nameParts[1]?.charAt(0) || nameParts[0].charAt(0)).toUpperCase();
    const index = lettersArray.indexOf(letter);
    // Falls der Buchstabe nicht im Array gefunden wird (index === -1), wird als Fallback immer die Farbe mit der ID 1 verwendet.
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
  async updateContact(contactId: string, updatedData: Partial<SingleContact>): Promise<void> {
    const contactRef = this.getSingleContactRef(contactId);
    await updateDoc(contactRef, updatedData);
  }

  // Adding a new contact to the Contacts(DB)

  async addNewSingleContactToDB(addNewSingleContact: SingleContact) {
    await addDoc(collection(this.contactsDB, 'contacts'), addNewSingleContact);
  }

  /* ============================================================
   * Öffnen des Dialoges
   * Siehe auch oben
   * ============================================================ */

  // Öffnet das Modal, indem der Wert des Subjects auf 'true' gesetzt wird
  // Mit next(true) wird allen Abonnenten signalisiert, dass das Modal geöffnet werden soll.
  openAddContactDialog() {
    this.openDialogSubject.next(true);
  }

  /**<
   * Öffnet den Dialog im Edit-Modus.
   * Setzt isEditMode auf true, damit der Dialog weiß:
   * „Ich soll einen bestehenden Kontakt bearbeiten, nicht neu anlegen."
   * Nutzt das gleiche BehaviorSubject wie openAddContactDialog().
   */
  openEditContactDialog(): void {
    this.isEditMode = true;
    this.openDialogSubject.next(true);
  }

  // Schließt das Modal, indem der Wert des Subjects auf 'false' gesetzt wird
  // Mit next(false) wird allen Abonnenten signalisiert, dass das Modal geschlossen werden soll.
  /**
   * Schließt den Dialog und setzt den Edit-Modus zurück.
   * Egal ob Add oder Edit – nach dem Schließen ist isEditMode immer false.
   * So startet der nächste Dialog-Aufruf sauber im Add-Modus.
   */
  closeAddContactDialog(): void {
    this.isEditMode = false;
    this.openDialogSubject.next(false);
  }
}
