import { Component, inject } from '@angular/core';
import { ContactsService } from '../../../../services/contacts-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact-dialog',
  imports: [FormsModule],
  templateUrl: './contact-dialog.html',
  styleUrl: './contact-dialog.scss',
})
export class ContactDialog {

  contactsService = inject(ContactsService);

  addNewSingleContact = {
    name: '',
    email: '',
    phone: '',
  };

  async createNewContact() {
    await this.contactsService.addNewSingleContactToDB({
      name: this.addNewSingleContact.name,
      email: this.addNewSingleContact.email,
      phone: this.addNewSingleContact.phone,
    });
    this.clearInputFields();
  }

  clearInputFields() {
    this.addNewSingleContact.name = '';
    this.addNewSingleContact.email = '';
    this.addNewSingleContact.phone = '';
  }

}
