import { inject, Injectable, OnDestroy } from '@angular/core';
import { collection, doc, Firestore, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { SingleTask } from '../interfaces/single-task';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TasksService implements OnDestroy {
  tasksDB: Firestore = inject(Firestore);
  tasks: SingleTask[] = [];
  unsubTasks;

  private openAddTaskDialogSubject = new BehaviorSubject<boolean>(false);
  openAddTaskDialog$: Observable<boolean> = this.openAddTaskDialogSubject.asObservable();

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

  ngOnDestroy() {
    if (this.unsubTasks) this.unsubTasks();
  }

  openAddTaskDialog() {
    this.openAddTaskDialogSubject.next(true);
    console.log('Dialog offen');
  }

  closeAddTaskDialog() {
    this.openAddTaskDialogSubject.next(false);
    console.log('Dialog geschlossen');
  }
}
