export interface SingleTask {
  id?: string;
  status: 'To do' | 'In progress' | 'Await feedback' | 'Done';
  title: string;
  description?: string;
  dueDate: string;
  priority: 'Urgent' | 'Medium' | 'Low';
  assigned?: string[];
  category: 'User Story' | 'Technical Task';
  subtasks?: { id: string; title: string; completed: boolean }[];
  order?: number;
}
