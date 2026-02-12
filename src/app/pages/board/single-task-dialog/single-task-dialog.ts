import { Component, inject } from '@angular/core';
import { TasksService } from '../../../services/tasks-service';

@Component({
  selector: 'app-single-task-dialog',
  imports: [],
  templateUrl: './single-task-dialog.html',
  styleUrl: './single-task-dialog.scss',
})
export class SingleTaskDialog {
  tasksService = inject(TasksService);
}
