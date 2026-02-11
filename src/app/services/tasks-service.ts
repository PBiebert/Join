import { inject, Injectable, OnDestroy } from '@angular/core';
import { collection, Firestore, onSnapshot } from '@angular/fire/firestore';
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
    };
  }

  subTasksArr() {
    return onSnapshot(this.getTasksRef(), (arr) => {
      this.tasks = [];
      arr.forEach((element) => {
        this.tasks.push(this.setTaskObject(element.data(), element.id));
        console.log(element);
      });
    });
  }

  getTasksRef() {
    return collection(this.tasksDB, 'tasks');
  }

  ngOnDestroy() {
    if (this.unsubTasks) this.unsubTasks();
  }
}
