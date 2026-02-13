import { Component, inject } from '@angular/core';
import { Nav } from '../../shared/components/nav/nav';
import { Header } from '../../shared/components/header/header';
import { CommonModule, NgClass } from '@angular/common';
import { TasksService } from '../../services/tasks-service';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [Nav, Header, CommonModule, NgClass],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTask {
  tasksService = inject(TasksService);
  // Date only for today and future
  minDate: string = new Date().toISOString().split('T')[0];

  // ------------------- ASSIGN DROPDOWN -------------------

  isOpen = false;
  selectedOption: string = 'Select contacts to assign';

  options: string[] = ['Option_1', 'Option_2', 'Option_3'];

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectOption(option: string) {
    this.selectedOption = option;
    this.isOpen = false;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  // ------------------- CATEGORY DROPDOWN -------------------

  isCategoryOpen = false;
  selectedCategory: string = 'Select category';

  categoryOptions: string[] = ['Task', 'Subtask'];

  toggleCategoryDropdown() {
    this.isCategoryOpen = !this.isCategoryOpen;
  }

  selectCategory(option: string) {
    this.selectedCategory = option;
    this.isCategoryOpen = false;
  }

  closeCategoryDropdown() {
    this.isCategoryOpen = false;
  }
}
