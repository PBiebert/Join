import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactsService } from '../../../services/contacts-service';

/**
 * SingleTaskCard – Zeigt eine einzelne Task als Karte im Board an.
 *
 * Reine Anzeige-Komponente ("presentational component").
 * Empfängt Task-Daten per @Input, gibt Klick-Events per @Output weiter.
 * Nutzt den ContactsService, um aus Contact-IDs echte Initialen und Farben aufzulösen.
 */
@Component({
  selector: 'app-single-task-card',
  imports: [CommonModule],
  templateUrl: './single-task-card.html',
  styleUrl: './single-task-card.scss',
})
export class SingleTaskCard {
  /** Zugriff auf den ContactsService für Initialen und Farben. */
  contactsService = inject(ContactsService);

  /** Die Task-Daten von der Board-Komponente. */
  @Input() task: any;

  /** Event beim Klick auf die Karte – gibt die Task-ID weiter. */
  @Output() taskClicked = new EventEmitter<string>();

  /**
   * CSS-Klasse für das Kategorie-Badge.
   * 'User Story' → blau, 'Technical Task' → grün.
   */
  get badgeClass(): string {
    return this.task.category === 'User Story' ? 'badge-user-story' : 'badge-technical-task';
  }

  /**
   * Berechnet den Fortschritt der Subtasks in Prozent.
   * @returns Prozentwert zwischen 0 und 100
   */
  get progressPercentage(): number {
    if (!this.task.subtasks || this.task.subtasks.length === 0) return 0;
    const completed = this.task.subtasks.filter((st: any) => st.completed).length;
    return (completed / this.task.subtasks.length) * 100;
  }

  /** Zählt die erledigten Subtasks für die Anzeige "2/5 Subtasks". */
  get completedSubtasks(): number {
    if (!this.task.subtasks) return 0;
    return this.task.subtasks.filter((st: any) => st.completed).length;
  }

  /** Pfad zum passenden Priority-Icon (Urgent/Medium/Low). */
  get priorityIcon(): string {
    const icons: { [key: string]: string } = {
      Urgent: 'assets/icons/prio-urgent.svg',
      Medium: 'assets/icons/prio-medium.svg',
      Low: 'assets/icons/prio-low.svg',
    };
    return icons[this.task.priority] || icons['Medium'];
  }

  /**
   * Löst Contact-IDs zu echten Kontaktdaten auf.
   * Nutzt ContactsService.getInitials() und getIconColorClass().
   * Gibt maximal 3 User-Objekte zurück.
   */
  get displayedUsers(): { id: string; initials: string; color: string; name: string }[] {
    const ids: string[] = this.task.assigned || [];
    if (ids.length === 0) return [];
    return ids.slice(0, 3).map((id) => this.resolveContact(id));
  }

  /** Anzahl der User über 3 hinaus – wird als "+X" Badge angezeigt. */
  get remainingUsersCount(): number {
    const ids: string[] = this.task.assigned || [];
    return ids.length > 3 ? ids.length - 3 : 0;
  }

  /** Tooltip mit allen zugewiesenen Kontaktnamen (kommagetrennt). */
  get allUsersTooltip(): string {
    const ids: string[] = this.task.assigned || [];
    return ids.map((id) => this.resolveContact(id).name).join(', ');
  }

  /**
   * Sucht einen Kontakt anhand seiner ID im ContactsService.
   * Falls der Kontakt nicht gefunden wird, wird ein Fallback erzeugt.
   * @param contactId - Die Firebase-ID des Kontakts
   * @returns Objekt mit id, name, initials und color
   */
  private resolveContact(contactId: string) {
    const contact = this.contactsService.contacts.find((c) => c.id === contactId);
    if (contact) {
      return {
        id: contact.id || contactId,
        name: contact.name,
        initials: this.contactsService.getInitials(contact.name),
        color: this.contactsService.getIconColorClass(contact),
      };
    }
    return { id: contactId, name: 'Unknown', initials: '??', color: 'icon-1' };
  }

  /** Gibt die Task-ID per Event an das Board weiter. */
  onCardClick(): void {
    this.taskClicked.emit(this.task.id);
  }
}
