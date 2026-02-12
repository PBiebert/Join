import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { SingleTaskCard } from './single-task-card/single-task-card';
import { Header } from '../../shared/components/header/header';
import { Nav } from '../../shared/components/nav/nav';
import { TasksService } from '../../services/tasks-service';
import { SingleTask } from '../../interfaces/single-task';

/**
 * Board – Kanban-Board mit 4 Spalten und Drag & Drop.
 *
 * Bezieht alle Tasks aus dem TasksService (Firebase Echtzeit-Daten).
 * Drag & Drop nutzt Angular CDK: cdkDropListGroup verbindet die Spalten,
 * cdkDropList definiert jede Spalte als Drop-Zone,
 * cdkDrag macht jede Task-Karte verschiebbar.
 */
@Component({
  selector: 'app-board',
  imports: [CommonModule, SingleTaskCard, Header, Nav, CdkDropListGroup, CdkDropList, CdkDrag],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  /** Zugriff auf den zentralen TasksService (Firebase-Daten). */
  tasksService = inject(TasksService);

  /** Suchbegriff für die Task-Filterung. */
  searchTerm = '';

  /**
   * Filtert Tasks nach Status und optionalem Suchbegriff.
   * Wird intern von den Gettern aufgerufen.
   * @param status - Der Spalten-Status ('To do', 'In progress', etc.)
   * @returns Gefilterte Tasks für diese Spalte
   */
  /**
   * Filtert Tasks nach Status, sortiert nach order-Feld.
   * Wendet optional den Suchbegriff an.
   * @param status - Der Spalten-Status ('To do', 'In progress', etc.)
   * @returns Sortierte und gefilterte Tasks für diese Spalte
   */
  getTasksByStatus(status: string): SingleTask[] {
    return this.tasksService.tasks
      .filter((task) => {
        const matchesStatus = task.status === status;
        if (!this.searchTerm) return matchesStatus;
        const matchesSearch = task.title.toLowerCase().includes(this.searchTerm);
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  /** Gibt alle Tasks mit Status 'To do' zurück, sortiert nach Position. */
  get todoTasks(): SingleTask[] {
    return this.getTasksByStatus('To do');
  }

  /** Gibt alle Tasks mit Status 'In progress' zurück, sortiert nach Position. */
  get inProgressTasks(): SingleTask[] {
    return this.getTasksByStatus('In progress');
  }

  /** Gibt alle Tasks mit Status 'Await feedback' zurück, sortiert nach Position. */
  get awaitFeedbackTasks(): SingleTask[] {
    return this.getTasksByStatus('Await feedback');
  }

  /** Gibt alle Tasks mit Status 'Done' zurück, sortiert nach Position. */
  get doneTasks(): SingleTask[] {
    return this.getTasksByStatus('Done');
  }

  /**
   * Wird aufgerufen, wenn eine Task per Drag & Drop losgelassen wird.
   * Liest die Task-Daten und den Ziel-Status aus dem CDK-Event.
   * Aktualisiert den Status in Firebase – onSnapshot aktualisiert die UI.
   * @param event - Das CDK Drop-Event mit den Task-Listen der Quell- und Ziel-Spalte
   */
  /**
   * Verarbeitet das Drop-Event nach Drag & Drop.
   * Unterscheidet: gleiche Spalte (umsortieren) vs. andere Spalte (verschieben).
   * Nutzt CDK-Hilfsfunktionen für Array-Manipulation,
   * dann werden die neuen Positionen in Firebase gespeichert.
   * @param event - Das CDK Drop-Event
   */
  onTaskDrop(event: CdkDragDrop<SingleTask[]>): void {
    if (event.previousContainer === event.container) {
      this.handleSameColumnDrop(event);
    } else {
      this.handleCrossColumnDrop(event);
    }
  }

  /**
   * Sortiert eine Karte innerhalb derselben Spalte um.
   * Verschiebt das Element im Array und speichert die neue Reihenfolge.
   * @param event - Das CDK Drop-Event
   */
  private handleSameColumnDrop(event: CdkDragDrop<SingleTask[]>): void {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    const status = event.container.id;
    this.tasksService.updateTaskPositions(event.container.data, status);
  }

  /**
   * Verschiebt eine Karte von einer Spalte in eine andere.
   * Entfernt die Karte aus der Quell-Spalte, fügt sie an der Zielposition ein.
   * Speichert beide Spalten mit neuen Positionen.
   * @param event - Das CDK Drop-Event
   */
  private handleCrossColumnDrop(event: CdkDragDrop<SingleTask[]>): void {
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );
    const oldStatus = event.previousContainer.id;
    const newStatus = event.container.id;
    this.tasksService.updateTaskPositions(event.previousContainer.data, oldStatus);
    this.tasksService.updateTaskPositions(event.container.data, newStatus);
  }

  /**
   * Öffnet den Task-Detail-Dialog.
   * @param taskId - Die ID der angeklickten Task
   */
  openTaskDialog(taskId: string): void {
    // TODO: Task Detail Dialog öffnen
  }

  /** Öffnet den Dialog zum Erstellen einer neuen Task. */
  openAddTaskDialog(): void {
    // TODO: Add Task Dialog öffnen
  }

  /**
   * Liest den Suchbegriff aus dem Input-Feld.
   * Die Getter filtern automatisch bei jeder Eingabe neu.
   * @param event - Das native Input-Event
   */
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase();
  }
}
