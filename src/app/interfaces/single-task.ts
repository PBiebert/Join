export interface SingleTask {
  id?: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'Urgent' | 'Medium' | 'Low';
  assigned?: string[];
  category: 'User Story' | 'Technical Task';
  subtasks?: string[];
}
