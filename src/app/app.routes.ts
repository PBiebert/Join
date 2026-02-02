import { Routes } from '@angular/router';
import { Contacts } from './pages/contacts/contacts';
import { Imprint } from './pages/imprint/imprint';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';
import { Help } from './pages/help/help';

export const routes: Routes = [
  { path: '', component: Contacts }, // Startseite
  { path: 'summary', component: Contacts },
  { path: 'add-task', component: Contacts },
  { path: 'board', component: Contacts },
  { path: 'contacts', component: Contacts },
  { path: 'imprint', component: Imprint },
  { path: 'privacy-policy', component: PrivacyPolicy },
  { path: 'help', component: Help },
];
