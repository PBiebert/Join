
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
   * Wird beim Klick auf die Karte aufgerufen.
   * Gibt die Task-ID per Event an das Board weiter.
   */
  onCardClick(): void {
    this.taskClicked.emit(this.task.id);
  }
}