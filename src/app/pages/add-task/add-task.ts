import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Nav } from '../../shared/components/nav/nav';
import { Header } from '../../shared/components/header/header';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TasksService } from '../../services/tasks-service';
import { ContactsService } from '../../services/contacts-service';
import { SingleTask } from '../../interfaces/single-task';
import { SingleContact } from '../../interfaces/single-contact';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [Nav, Header, CommonModule, FormsModule],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTask implements AfterViewInit, OnDestroy {
  @ViewChild('taskForm') taskForm!: NgForm; // Referenz zum Formular hinzugefügt

  tasksService = inject(TasksService);
  private subEditMode!: Subscription;
  contactsService = inject(ContactsService);

  // Contacts als Array für das Template
  contacts: SingleContact[] = [];
  loadingContacts: boolean = false;

  // Subscription für Contacts
  private contactsSubscription?: Subscription;

  // Date only for today and future
  minDate: string = new Date().toISOString().split('T')[0];
  statusCondition: string = this.tasksService.currentStatus;

  // Assign Dropdown
  isOpen = false;
  selectedOption: string = 'Select contacts to assign';
  options: string[] = ['Option_1', 'Option_2', 'Option_3'];

  constructor(private ChangeDetectorRef: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.subEditMode = this.tasksService.taskEditMode$.subscribe((editMode) => {
      if (editMode) {
        this.setCurrentTaskData(this.tasksService.currentTask);
        console.log(this.tasksService.currentTask);
      } else {
        this.clearForm();
      }
    });
  }

  ngOnDestroy(): void {
    this.subEditMode.unsubscribe();
  }

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
    if (option === 'Technical Task' || option === 'User Story') {
      this.selectedCategory = option;
      this.taskData.category = option;
    }
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

  async ngOnInit() {
    await this.loadContacts();
  }

  ngOnDestroy() {
    // Cleanup Subscription
    if (this.contactsSubscription) {
      this.contactsSubscription.unsubscribe();
    }
  }

  async loadContacts() {
    this.loadingContacts = true;

    try {
      // Lade Contacts von Firebase
      await this.contactsService.loadContacts();

      // Abonniere Contacts-Änderungen
      this.contactsSubscription = this.contactsService.contacts$.subscribe(
        (contacts: SingleContact[]) => {
          this.contacts = contacts;
          this.loadingContacts = false;

          // Aktualisiere den selectedOption Text falls nötig
          if (this.taskData.assigned && this.taskData.assigned.length > 0) {
            this.updateSelectedOptionText();
          }
        },
      );
    } catch (error) {
      console.error('Error loading contacts:', error);
      this.loadingContacts = false;
    }
  }

  // Dropdown Toggles
  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

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

  // Assigned Contacts Handling
  toggleAssigned(contact: SingleContact) {
    if (!this.taskData.assigned) {
      this.taskData.assigned = [];
    }

    // Wir speichern die Contact-IDs im assigned Array
    const index = this.taskData.assigned.indexOf(contact.id!);
    if (index === -1) {
      this.taskData.assigned.push(contact.id!);
    } else {
      this.taskData.assigned.splice(index, 1);
    }

    // Update the displayed text
    this.updateSelectedOptionText();
  }

  // Check if contact is assigned (anhand der ID)
  isAssigned(contact: SingleContact): boolean {
    return this.taskData.assigned?.includes(contact.id!) || false;
  }

  // Update the dropdown button text based on selections
  private updateSelectedOptionText() {
    if (!this.taskData.assigned || this.taskData.assigned.length === 0) {
      this.selectedOption = 'Select contacts to assign';
    } else if (this.taskData.assigned.length === 1) {
      // Hole den Namen des einzigen Kontakts
      const contact = this.contacts.find((c) => c.id === this.taskData.assigned![0]);
      this.selectedOption = contact ? contact.name : '1 contact selected';
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

  // Contact Helper Methods (von ContactsService)
  getInitials(name: string): string {
    return this.contactsService.getInitials(name);
  }

  getContactColorClass(contact: SingleContact): string {
    return this.contactsService.getIconColorClass(contact);
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
      // Setze die Kategorie basierend auf der Auswahl
      this.taskData.category = this.selectedCategory as 'User Story' | 'Technical Task';

      await this.tasksService.addTask(this.taskData as SingleTask);
      // ! clearForm: verantwortlich für den error
      this.clearForm();
      // Stößt die manuelle Aktualisierung der Angular-Change-Detection an, um Template-gebundene Werte sofort zu aktualisieren
      this.ChangeDetectorRef.detectChanges();
      // Optional: Navigate to board or show success message
      console.log('Task added successfully!');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  clearForm() {
    this.tasksService.resetStatus();
    this.taskData = {
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

    // Reset dropdowns
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

  setCurrentTaskData(currenTask: SingleTask) {
    this.taskData = {
      id: currenTask.id,
      status: currenTask.status,
      title: currenTask.title,
      description: currenTask.description,
      dueDate: currenTask.dueDate,
      priority: currenTask.priority,
      assigned: currenTask.assigned,
      category: currenTask.category,
      subtasks: currenTask.subtasks,
      order: currenTask.order,
    };
    this.selectedCategory = currenTask.category;
  }

  getFullTask(): SingleTask {
    return {
      id: this.taskData.id ?? '',
      status: this.taskData.status ?? 'To Do',
      title: this.taskData.title ?? '',
      description: this.taskData.description ?? '',
      dueDate: this.taskData.dueDate ?? '',
      priority: this.taskData.priority ?? 'Medium',
      assigned: this.taskData.assigned ?? [],
      category: this.taskData.category ?? 'User Story',
      subtasks: this.taskData.subtasks ?? [],
      order: this.taskData.order ?? 0,
    };
  }
}
