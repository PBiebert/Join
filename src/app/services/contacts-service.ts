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
    });
  }

  ngOnDestroy(): void {
    if (this.unsubContacts) this.unsubContacts();
  }
}
