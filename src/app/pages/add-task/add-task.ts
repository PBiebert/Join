import { Component, inject, ViewChild } from '@angular/core';
import { Nav } from '../../shared/components/nav/nav';
import { Header } from '../../shared/components/header/header';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TasksService } from '../../services/tasks-service';
import { SingleTask } from '../../interfaces/single-task';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [Nav, Header, CommonModule, FormsModule],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTask {
  @ViewChild('taskForm') taskForm!: NgForm; // Referenz zum Formular hinzugefügt

  tasksService = inject(TasksService);

  // Date only for today and future
  minDate: string = new Date().toISOString().split('T')[0];
  statusCondition: string = 'To Do';

  // ------------------- ORIGINAL CODE (DEIN BESTEHENDER) -------------------
  // Assign Dropdown
  isOpen = false;
  selectedOption: string = 'Select contacts to assign';
  options: string[] = ['Option_1', 'Option_2', 'Option_3'];

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  // Category Dropdown
  isCategoryOpen = false;
  selectedCategory: string = 'Select category';
  categoryOptions: string[] = ['Technical Task', 'User Story'];

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

  // ------------------- NEUER CODE (VON MIR HINZUGEFÜGT) -------------------

  // Task Data Object
  taskData: Partial<SingleTask> = {
    status: this.statusCondition,
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    assigned: [],
    category: 'User Story',
    subtasks: [],
    order: 0,
  };

  // Validation flags
  categoryError: boolean = false;

  // Subtask handling
  newSubtaskTitle: string = '';

  // Updated to handle multiple selections
  toggleAssigned(option: string) {
    if (!this.taskData.assigned) {
      this.taskData.assigned = [];
    }

    const index = this.taskData.assigned.indexOf(option);
    if (index === -1) {
      this.taskData.assigned.push(option);
    } else {
      this.taskData.assigned.splice(index, 1);
    }

    // Update the displayed text
    this.updateSelectedOptionText();
  }

  // Check if contact is assigned
  isAssigned(option: string): boolean {
    return this.taskData.assigned?.includes(option) || false;
  }

  // Update the dropdown button text based on selections
  private updateSelectedOptionText() {
    if (!this.taskData.assigned || this.taskData.assigned.length === 0) {
      this.selectedOption = 'Select contacts to assign';
    } else if (this.taskData.assigned.length === 1) {
      this.selectedOption = this.taskData.assigned[0];
    } else {
      this.selectedOption = `${this.taskData.assigned.length} contacts selected`;
    }
  }

  // Priority Handling
  setPriority(priority: 'Urgent' | 'Medium' | 'Low') {
    this.taskData.priority = priority;
  }

  // Subtask Handling
  addSubtask() {
    if (this.newSubtaskTitle && this.newSubtaskTitle.trim()) {
      if (!this.taskData.subtasks) {
        this.taskData.subtasks = [];
      }

      this.taskData.subtasks.push({
        id: this.generateId(),
        title: this.newSubtaskTitle.trim(),
        completed: false,
      });

      this.newSubtaskTitle = '';
    }
  }

  removeSubtask(index: number) {
    if (this.taskData.subtasks) {
      this.taskData.subtasks.splice(index, 1);
    }
  }

  clearSubtaskInput() {
    this.newSubtaskTitle = '';
  }

  // Helper to generate unique IDs for subtasks
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  // Form Handling
  isFormValid(): boolean {
    // Check category separately since it's not in the ngForm
    if (this.selectedCategory === 'Select category') {
      this.categoryError = true;
      return false;
    }

    return !!(this.taskData.title && this.taskData.title.trim() && this.taskData.dueDate);
  }

  async onSubmit() {
    if (!this.isFormValid()) {
      return;
    }

    try {
      await this.tasksService.addTask(this.taskData as SingleTask);
      this.clearForm();
      // Optional: Navigate to board or show success message
      console.log('Task added successfully!');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  clearForm() {
    this.taskData = {
      status: 'To Do',
      title: '',
      description: '',
      dueDate: '',
      priority: 'Medium',
      assigned: [],
      category: 'User Story',
      subtasks: [],
      order: 0,
    };

    // Reset dropdowns und UI-Zustände
    this.selectedOption = 'Select contacts to assign';
    this.selectedCategory = 'Select category';
    this.newSubtaskTitle = '';
    this.categoryError = false;

    // Reset form validation states
    if (this.taskForm) {
      this.taskForm.resetForm();
    }

    // Schließe alle offenen Dropdowns
    this.isOpen = false;
    this.isCategoryOpen = false;

    console.log('Form cleared - all inputs reset');
  }
}