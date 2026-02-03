import { inject, Injectable, OnDestroy } from '@angular/core';
import { collection, Firestore, onSnapshot } from '@angular/fire/firestore';
import { SingleContact } from '../interfaces/single-contact';

@Injectable({
  providedIn: 'root',
})
export class ContactsService implements OnDestroy {
  contacts: SingleContact[] = [];
  contactsDB: Firestore = inject(Firestore);
  unsubContacts;

  constructor() {
    this.unsubContacts = this.subContactsList();
  }

    /** Sort contacts alphabetically by name */
  private sortContacts(contacts: SingleContact[]): SingleContact[] {
    return contacts.sort((a, b) => a.name.localeCompare(b.name, 'de'));
  }


  setContactObject(obj: any, id: string): SingleContact {
    return {
      id: id,
      name: obj.name || '',
      email: obj.email || '',
      phone: obj.phone || '',
      color: obj.color || '',
    };
  }

  getContactsRef() {
    return collection(this.contactsDB, 'contacts');
  }


  subContactsList() {
    return onSnapshot(this.getContactsRef(), (list) => {
      const firebaseContacts: SingleContact[] = [];
      list.forEach((element) => {
        firebaseContacts.push(this.setContactObject(element.data(), element.id));
      });
        this.contacts= this.sortContacts(firebaseContacts);
      });
  }

  ngOnDestroy(): void {
    if (this.unsubContacts) this.unsubContacts();
  }
}
