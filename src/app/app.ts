import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TasksService } from './services/tasks-service';
import { AddTaskSuccess } from './pages/board/add-task-success/add-task-success';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AddTaskSuccess],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('join');
  tasksService = inject(TasksService);
}
