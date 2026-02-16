import { AfterViewInit, Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { TasksService } from '../../../services/tasks-service';
import { AddTask } from '../../add-task/add-task';
import { SetDialogAnimation } from '../../../shared/directives/set-dialog-animation';

@Component({
  selector: 'app-add-task-dialog',
  imports: [AddTask, SetDialogAnimation],
  templateUrl: './add-task-dialog.html',
  styleUrl: './add-task-dialog.scss',
})
export class AddTaskDialog implements AfterViewInit, OnDestroy {
  tasksService = inject(TasksService);
  private taskSub!: Subscription;
  @ViewChild(SetDialogAnimation) dialogAnimationDirective!: SetDialogAnimation;

  ngAfterViewInit(): void {
    this.taskSub = this.tasksService.openAddTaskDialog$.subscribe((open) => {
      if (open && !this.tasksService.smallView) {
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
    this.dialogAnimationDirective?.openDialogWithAnimation();
  }

  closeDialog() {
    this.dialogAnimationDirective?.closeDialogWithAnimation();
  }
}
