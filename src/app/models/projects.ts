export interface Project {
    id?: string;
    name: string;
    status: 'Backlog' | 'InProgress' | 'Review' | 'Done';
    userId: string;
    dueDate: Date;
  }