import { Component } from '@angular/core';
import { Nav } from '../../shared/components/nav/nav';
import { Header } from '../../shared/components/header/header';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [Nav, Header, CommonModule],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTask {

  isOpen = false;
  selectedOption: string = 'Select contacts to assign';
  options: string[] = [
    'Option_1',
    'Option_2',
    'Option_3'
  ];

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

  // -------------------

  isCategoryOpen = false;
  selectedCategory: string = 'Select category';
  categoryOptions: string[] = [
    'Task',
    'Subtask'
  ];

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
