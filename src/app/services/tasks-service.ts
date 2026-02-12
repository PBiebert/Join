import { inject, Injectable, OnDestroy } from '@angular/core';
import { collection, doc, Firestore, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { SingleTask } from '../interfaces/single-task';

@Injectable({
  providedIn: 'root',
})
export class TasksService implements OnDestroy {
  tasksDB: Firestore = inject(Firestore);
  tasks: SingleTask[] = [];
  unsubTasks;

  constructor() {
    this.unsubTasks = this.subTasksArr();
  }

  setTaskObject(obj: any, id: string): SingleTask {
    return {
      id: id,
      status: obj.status || 'To do',
      title: obj.title,
      description: obj.description || '',
      dueDate: obj.dueDate,
      priority: obj.priority || 'Medium',
      assigned: obj.assigned || [],
      category: obj.category || 'User Story',
      subtasks: obj.subtasks || [],
      order: obj.order ?? 0,
    };
  }

  subTasksArr() {
    return onSnapshot(this.getTasksRef(), (arr) => {
      this.tasks = [];
      arr.forEach((element) => {
        this.tasks.push(this.setTaskObject(element.data(), element.id));
      });
    });
  }

  getTasksRef() {
    return collection(this.tasksDB, 'tasks');
  }

  /**
   * Gibt die Referenz zu einem einzelnen Task-Dokument zurück.
   * Wird intern genutzt, um gezielt ein Dokument zu lesen oder zu ändern.
   * @param taskId - Die eindeutige Firebase-ID der Task
   * @returns Die Dokument-Referenz für diese Task
   */
  private getSingleTaskRef(taskId: string) {
    return doc(this.tasksDB, 'tasks', taskId);
  }

  /**
   * Aktualisiert den Status einer Task in Firebase.
   * Wird nach Drag & Drop aufgerufen, um den neuen Spaltenstatus zu speichern.
   * @param taskId - Die eindeutige Firebase-ID der Task
   * @param newStatus - Der neue Status ('To do', 'In progress', etc.)
   */
  async updateTaskStatus(taskId: string, newStatus: string): Promise<void> {
    const taskRef = this.getSingleTaskRef(taskId);
    await updateDoc(taskRef, { status: newStatus });
  }

  /**
   * Aktualisiert Status und Position mehrerer Tasks gleichzeitig.
   * Wird nach Drag & Drop aufgerufen, um die neue Reihenfolge zu speichern.
   * Jeder Task bekommt seinen Index als order-Wert (0, 1, 2, ...).
   * @param tasks - Die Tasks in ihrer neuen Reihenfolge
   * @param newStatus - Der Spalten-Status für alle Tasks in dieser Liste
   */
  async updateTaskPositions(tasks: SingleTask[], newStatus: string): Promise<void> {
    const updates = tasks.map((task, index) => this.updateSinglePosition(task, index, newStatus));
    await Promise.all(updates);
  }

  /**
   * Aktualisiert Status und Position einer einzelnen Task.
   * Wird intern von updateTaskPositions() aufgerufen.
   * @param task - Die zu aktualisierende Task
   * @param index - Die neue Position (0 = ganz oben)
   * @param newStatus - Der Spalten-Status
   */
  private async updateSinglePosition(
    task: SingleTask,
    index: number,
    newStatus: string,
  ): Promise<void> {
    if (!task.id) return;
    const taskRef = this.getSingleTaskRef(task.id);
    await updateDoc(taskRef, { status: newStatus, order: index });
  }

  ngOnDestroy() {
    if (this.unsubTasks) this.unsubTasks();
  }
}
