import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * SingleTaskCard – Zeigt eine einzelne Task als Karte im Board an.
 *
 * Diese Komponente ist eine reine Anzeige-Komponente ("presentational component").
 * Sie empfängt Task-Daten per @Input und gibt Klick-Events per @Output weiter.
 * Die Drag & Drop-Logik liegt beim Board (cdkDrag wird dort auf die Komponente gesetzt).
 */
@Component({
  selector: 'app-single-task-card',
  imports: [CommonModule],
  templateUrl: './single-task-card.html',
  styleUrl: './single-task-card.scss',
})
export class SingleTaskCard {
  /**
   * Die Task-Daten, die von der Board-Komponente übergeben werden.
   * Enthält Felder wie title, description, category, priority, subtasks etc.
   */
  @Input() task: any;

  /**
   * Event, das beim Klick auf die Karte ausgelöst wird.
   * Gibt die Task-ID an die Board-Komponente weiter,
   * damit dort der Detail-Dialog geöffnet werden kann.
   */
  @Output() taskClicked = new EventEmitter<string>();

  /**
   * Gibt die CSS-Klasse für das Kategorie-Badge zurück.
   * 'User Story' → blaues Badge, 'Technical Task' → grünes Badge.
   * Die Farben kommen aus den globalen CSS-Variablen in styles.scss.
   */
  get badgeClass(): string {
    return this.task.category === 'User Story' ? 'badge-user-story' : 'badge-technical-task';
  }

  /**
   * Berechnet den Fortschritt der Subtasks in Prozent.
   * Wird für die Breite der Progress-Bar im Template genutzt.
   * @returns Prozentwert zwischen 0 und 100
   */
  get progressPercentage(): number {
    if (!this.task.subtasks || this.task.subtasks.length === 0) {
      return 0;
    }
    const completed = this.task.subtasks.filter((st: any) => st.completed).length;
    // const percentage = (completed / this.task.subtasks.length) * 100;
    // return percentage;
    return (completed / this.task.subtasks.length) * 100;
  }

  /**
   * Zählt die erledigten Subtasks.
   * Wird im Template als "2/5 Subtasks" angezeigt.
   * @returns Anzahl der abgeschlossenen Subtasks
   */
  get completedSubtasks(): number {
    if (!this.task.subtasks) return 0;
    return this.task.subtasks.filter((st: any) => st.completed).length;
  }

  /**
   * Gibt den Pfad zum passenden Priority-Icon zurück.
   * Die Schlüssel entsprechen den Werten aus dem SingleTask-Interface:
   * 'Urgent', 'Medium', 'Low' (mit Großbuchstabe am Anfang).
   * @returns Pfad zum SVG-Icon
   */
  get priorityIcon(): string {
    const icons: { [key: string]: string } = {
      Urgent: 'assets/icons/prio-urgent.svg',
      Medium: 'assets/icons/prio-medium.svg',
      Low: 'assets/icons/prio-low.svg',
    };
    return icons[this.task.priority] || icons['Medium'];
  }

  /**
   * Gibt die ersten 3 zugewiesenen User zurück für die Anzeige.
   * Bei mehr als 3 Usern werden nur die ersten 3 angezeigt.
   * @returns Array der ersten 3 User
   */
  get displayedUsers(): any[] {
    // if (!this.task.assignedTo || this.task.assignedTo.length === 0) {
    //   return [];
    // }
    // return this.task.assignedTo.slice(0, 3);
    const users = this.task.assigned || this.task.assignedTo || [];
    
    if (users.length === 0) {
      return [];
  }

  // Falls string array (nur IDs), konvertiere zu User-Objekten
    if (typeof users[0] === 'string') {
      return users.slice(0, 3).map((userId: string, index: number) => ({
        id: userId,
        name: `User ${index + 1}`,
        initials: `U${index + 1}`,
        color: `icon-${(index % 15) + 1}`
      }));
    }
    
    // Falls User-Objekte, direkt verwenden
    return users.slice(0, 3);
  }



  /**
   * Zählt die zusätzlichen User (mehr als 3).
   * Wird für das "+X" Badge verwendet.
   * @returns Anzahl der User über 3 hinaus
   */
  get remainingUsersCount(): number {
    const users = this.task.assigned || this.task.assignedTo || [];
    if (users.length <= 3) {
      return 0;
    }
    return users.length - 3;
  }

  /**
   * Gibt die Namen aller zugewiesenen User als Tooltip zurück.
   * @returns Komma-getrennte Liste aller User-Namen
   */
  get allUsersTooltip(): string {
    const users = this.task.assigned || this.task.assignedTo || [];
    if (users.length === 0) return '';
    
    // Falls string array (IDs), zeige IDs
    if (typeof users[0] === 'string') {
      return users.join(', ');
    }
    
    // Falls User-Objekte, zeige Namen
    return users.map((u: any) => u.name).join(', ');
  }

  /**
   * Wird beim Klick auf die Karte aufgerufen.
   * Gibt die Task-ID per Event an das Board weiter.
   */
  onCardClick(): void {
    this.taskClicked.emit(this.task.id);
  }
}
