import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-contact-details',
  templateUrl: './contact-details.html',
  styleUrl: './contact-details.scss',
})
export class ContactDetails {
  /* ============================================================
   *  PLATZHALTER – Wird ersetzt durch:
   *    - Contact-Interface (src/app/interfaces/)
   *    - ContactService (src/app/services/contacts-service.ts)
   *    - Echte Daten aus Firebase
   * ============================================================ */

  /** Simulierter Kontakt – später kommt der echte aus dem Service */
  protected contact = signal<any | null>({
    name: 'Anton Mayer',
    email: 'antom@gmail.com',
    phone: '+49 1111 111 11 1',
    color: '#FF7A00',
  });

  protected getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  /* ============================================================
   *  Momentan nutze ich PLATZHALTER-METHODEN
   * ============================================================ */

  /** Öffnet das Bearbeiten-Overlay (noch nicht implementiert) */
  protected onEdit(): void {
    console.log('PLATZHALTER: Edit-Overlay öffnen');
  }

  /** Löscht den Kontakt (noch nicht implementiert) */
  protected onDelete(): void {
    console.log('PLATZHALTER: Kontakt löschen');
  }

  /** Navigiert zurück zur Kontaktliste – nur für Mobile */
  protected onBack(): void {
    console.log('PLATZHALTER: Zurück zur Kontaktliste');
  }
}
