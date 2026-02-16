import { Component, inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { TasksService } from '../../../services/tasks-service';
import { AddTask } from '../../add-task/add-task';

/**
 * SingleTaskDialog - Zeigt alle Details einer Task in einem großen Dialog.
 *
 * Nutzt TasksService.activeTask für reaktive Daten-Anzeige.
 * Alle Änderungen (Subtask-Toggle, Delete) werden über den Service durchgeführt.
 */
@Component({
  selector: 'app-single-task-dialog',
  imports: [CommonModule, AddTask, NgClass],
  templateUrl: './single-task-dialog.html',
  styleUrl: './single-task-dialog.scss',
})
export class SingleTaskDialog {
  tasksService = inject(TasksService);

  /** Steuert die Slide-Out-Animation beim Schließen. */
  isClosing = false;

  /**
   * Gibt die aktive Task aus dem Service zurück.
   * Wird reaktiv aktualisiert durch onSnapshot.
   */
  get task() {
    return this.tasksService.activeTask;
  }

  /**
   * Gibt die CSS-Klasse für das Kategorie-Badge zurück.
   */
  get badgeClass(): string {
    return this.task?.category === 'User Story' ? 'badge-user-story' : 'badge-technical-task';
  }

  /**
   * Gibt den Pfad zum Priority-Icon zurück.
   */
  get priorityIcon(): string {
    const icons: { [key: string]: string } = {
      Urgent: 'assets/icons/prio-urgent.svg',
      Medium: 'assets/icons/prio-medium.svg',
      Low: 'assets/icons/prio-low.svg',
    };
    return icons[this.task?.priority || 'Medium'] || icons['Medium'];
  }

  /**
   * Formatiert das Due-Date für Anzeige.
   * Format: "DD/MM/YYYY"
   */
  get formattedDueDate(): string {
    if (!this.task?.dueDate) return '';
    const date = new Date(this.task.dueDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Gibt die User-Liste zurück (assigned field).
   */
  get assignedUsers(): any[] {
    const users = this.task?.assigned || [];

    if (users.length === 0) return [];

    // Falls string array (nur IDs), konvertiere zu User-Objekten
    if (typeof users[0] === 'string') {
      return users.map((userId: string, index: number) => ({
        id: userId,
        name: `User ${index + 1}`,
        initials: `U${index + 1}`,
        color: `icon-${(index % 15) + 1}`,
      }));
    }

    return users;
  }

  /**
   * Schließt den Dialog mit Slide-Out-Animation.
   * Setzt isClosing auf true → CSS wechselt zu slide-out.
   * Nach 500ms (Animationsdauer) wird activeTask auf null gesetzt.
   */
  closeDialog(): void {
    this.isClosing = true;
    setTimeout(() => {
      this.isClosing = false;
      this.tasksService.closeTaskDialog();
    }, 500);
  }

  /**
   * Löscht die aktuelle Task aus Firebase.
   */
  async onDeleteTask(): Promise<void> {
    if (!this.task || !this.task.id) return;

    await this.tasksService.deleteTask(this.task.id);
    this.closeDialog();
  }

  /**
   * Toggled den completed-Status eines Subtasks.
   */
  async onSubtaskToggle(subtaskId: string, currentStatus: boolean): Promise<void> {
    if (!this.task || !this.task.id) return;

    await this.tasksService.updateSubtaskStatus(this.task.id, subtaskId, !currentStatus);
  }

  /**
   * Verhindert Event-Propagation beim Klick auf Dialog-Content.
   * Damit schließt sich der Dialog nicht, wenn man ins Innere klickt.
   */
  onDialogContentClick(event: Event): void {
    event.stopPropagation();
  }

  startEditMode() {
    this.tasksService.editMode = true;
    console.log('offen');
  }
}
