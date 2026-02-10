import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactsService } from '../../../../services/contacts-service';

@Component({
  selector: 'app-contacts-list',
  imports: [CommonModule],
  templateUrl: './contacts-list.html',
  styleUrl: './contacts-list.scss',
})
export class ContactsList {
  contactsService = inject(ContactsService);
}
