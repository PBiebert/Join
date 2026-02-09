import { Routes } from '@angular/router';
import { Contacts } from './pages/contacts/contacts';
import { Imprint } from './pages/imprint/imprint';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';
import { Help } from './pages/help/help';
import { AddTask } from './pages/add-task/add-task';
import { Board } from './pages/board/board';

export const routes: Routes = [
  { path: '', redirectTo: 'contacts', pathMatch: 'full' },  // Empty path → Contacts Startseite / Zukünftig SUMMARY
  { path: 'summary', component: Contacts },
  { path: 'add-task', component: AddTask },
  { path: 'board', component: Board },
  { path: 'contacts', component: Contacts },
  { path: 'imprint', component: Imprint },
  { path: 'privacy-policy', component: PrivacyPolicy },
  { path: 'help', component: Help },
  { path: '**', redirectTo: 'contacts' }  // Wildcard: Alle ungültigen URLs → contacts / Zukünftig SUMMARY
];
