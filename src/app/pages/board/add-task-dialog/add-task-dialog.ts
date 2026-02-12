import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { TasksService } from '../../../services/tasks-service';
import { AddTask } from '../../add-task/add-task';

@Component({
  selector: 'app-add-task-dialog',
  imports: [AddTask],
  templateUrl: './add-task-dialog.html',
  styleUrl: './add-task-dialog.scss',
})
export class AddTaskDialog implements AfterViewInit, OnDestroy {
  tasksService = inject(TasksService);
  private taskSub!: Subscription;
  @ViewChild('dialog') addTaskDialog!: ElementRef;

  ngAfterViewInit(): void {
    this.taskSub = this.tasksService.openAddTaskDialog$.subscribe((open) => {
      if (open) {
        this.openDialog();
      } else {
        this.closeDialog();
      }
    });
  }

  ngOnDestroy(): void {
    this.taskSub?.unsubscribe();
  }

  openDialog() {
    this.addTaskDialog.nativeElement.showModal();
  }

  closeDialog() {
    this.addTaskDialog.nativeElement.close();
  }
}
