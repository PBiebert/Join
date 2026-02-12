import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { SingleTaskCard } from './single-task-card/single-task-card';
import { Header } from '../../shared/components/header/header';
import { Nav } from '../../shared/components/nav/nav';
import { TasksService } from '../../services/tasks-service';
import { SingleTask } from '../../interfaces/single-task';
import { AddTaskDialog } from './add-task-dialog/add-task-dialog';

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
  imports: [
    CommonModule,
    SingleTaskCard,
    Header,
    Nav,
    AddTaskDialog,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
  ],
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
  getTasksByStatus(status: string): SingleTask[] {
    return this.tasksService.tasks.filter((task) => {
      const matchesStatus = task.status === status;
      if (!this.searchTerm) return matchesStatus;
      const matchesSearch = task.title.toLowerCase().includes(this.searchTerm);
      return matchesStatus && matchesSearch;
    });
  }

  /** Gibt alle Tasks mit Status 'To do' zurück. */
  get todoTasks(): SingleTask[] {
    return this.getTasksByStatus('To do');
  }

  /** Gibt alle Tasks mit Status 'In progress' zurück. */
  get inProgressTasks(): SingleTask[] {
    return this.getTasksByStatus('In progress');
  }

  /** Gibt alle Tasks mit Status 'Await feedback' zurück. */
  get awaitFeedbackTasks(): SingleTask[] {
    return this.getTasksByStatus('Await feedback');
  }

  /** Gibt alle Tasks mit Status 'Done' zurück. */
  get doneTasks(): SingleTask[] {
    return this.getTasksByStatus('Done');
  }

  /**
   * Wird aufgerufen, wenn eine Task per Drag & Drop losgelassen wird.
   * Liest die Task-Daten und den Ziel-Status aus dem CDK-Event.
   * Aktualisiert den Status in Firebase – onSnapshot aktualisiert die UI.
   * @param event - Das CDK Drop-Event mit den Task-Listen der Quell- und Ziel-Spalte
   */
  onTaskDrop(event: CdkDragDrop<SingleTask[]>): void {
    const task = event.item.data as SingleTask;
    const newStatus = event.container.id;
    if (!task.id || task.status === newStatus) return;
    this.tasksService.updateTaskStatus(task.id, newStatus);
  }

  /**
   * Öffnet den Task-Detail-Dialog.
   * @param taskId - Die ID der angeklickten Task
   */
  openTaskDialog(taskId: string): void {
    // TODO: Task Detail Dialog öffnen
  }

  /** Öffnet den Dialog zum Erstellen einer neuen Task. */
  //! PB wird über Service geregelt
  // openAddTaskDialog(): void {
  //? TODO: Add Task Dialog öffnen
  // }

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
