import { Routes } from '@angular/router';
import { Contacts } from './pages/contacts/contacts';
import { Imprint } from './pages/imprint/imprint';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';
import { Help } from './pages/help/help';

export const routes: Routes = [
  { path: '', component: Contacts }, // Startseite
  { path: 'imprint', component: Imprint },
  { path: 'privacy-policy', component: PrivacyPolicy },
  { path: 'help', component: Help },
];
