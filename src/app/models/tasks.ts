export interface TaskItem {
    id?: string;
    title: string;
    description: string;
    createdAt?: Date;
    dueDate: Date;
    status: 'Backlog' | 'InProgress' | 'Review' | 'Done';
    projectId: string;
    userId?: string;
    tagIds?: string[];
  }