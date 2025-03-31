import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Project } from '../../models/projects';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import { CdkDropList, CdkDrag, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { TaskItem } from '../../models/tasks';
import { ActivatedRoute, Router } from '@angular/router';
declare var bootstrap: any;

@Component({
  selector: 'app-project-tasks',
  imports: [CommonModule, ReactiveFormsModule, CdkDropList, CdkDrag],
  templateUrl: './project-tasks.component.html',
  styleUrl: './project-tasks.component.scss'
})
export class ProjectTasksComponent implements OnInit {

  projects: Project[] = [];
  selectedProject!: Project;
  tasks: TaskItem[] = [];
  backlog: TaskItem[] = [];
  inProgress: TaskItem[] = [];
  review: TaskItem[] = [];
  done: TaskItem[] = [];

  selectedTaskToDelete: string | null = null;

  constructor(
    private taskService:TaskService,
    private projectService:ProjectService, 
    private fb:FormBuilder, 
    private router:Router,
    private route:ActivatedRoute
  ){}

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');

    if (projectId) {
      this.projectService.getProjectsById(projectId).subscribe((response:any) => {
        this.selectedProject = response.project;
        this.loadTasks(projectId);
      });

    this.taskService.taskCreated$.subscribe(() => {
      this.loadTasks(projectId); // recarrega a lista completa
    });
    }

    this.projectService.getProjects().subscribe((projects) => {
      this.projects = projects;
    });
  }  

  loadTasks(projectId:string) {
    this.backlog = [];
    this.inProgress = [];
    this.review = [];
    this.done = [];

    this.taskService.getTasksByProjectId(projectId).subscribe(tasks => {
      this.tasks = tasks;

      tasks.forEach((task: TaskItem) => {
        this.addToStatusArray(task);
      });
    });
  }

  drop(event: CdkDragDrop<TaskItem[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const previousList = event.previousContainer.data;
      const currentList = event.container.data;

      // Obtem a task original
      const movedTask = previousList[event.previousIndex];

      // Calcula o novo status com base no destino
      const newStatus = this.getStatusByContainerId(event.container.id);

      // ✅ 1. Atualiza o status ANTES da renderização
      movedTask.status = newStatus;

      // ✅ 2. Remove da lista antiga
      previousList.splice(event.previousIndex, 1);

      // ✅ 3. Adiciona à nova lista
      currentList.splice(event.currentIndex, 0, movedTask);

      // ✅ 4. Atualiza no backend
      this.taskService.updateTask(movedTask.id!, { status: newStatus }).subscribe();
    }
  }

  getStatusByContainerId(id: string): TaskItem['status'] {
    if (id.includes('backlog')) return 'Backlog';
    if (id.includes('inProgress')) return 'InProgress';
    if (id.includes('review')) return 'Review';
    return 'Done';
  }  

  GoToTask(taskId?:string){
    this.router.navigate([`/tasks/${taskId}`]); 
  }

  changeStatus(task: TaskItem, newStatus: TaskItem['status']) {
    if (task.status === newStatus) return;

    // Remove da lista atual e atualiza o status
    this.removeFromStatusArray(task);
    task.status = newStatus;
    this.addToStatusArray(task);

    // Atualiza no backend
    this.updateTaskStatus(task, newStatus);
  }

  removeFromStatusArray(task:TaskItem) {
    [this.backlog, this.inProgress, this.review, this.done].forEach(list => {
      const index = list.findIndex(t => t.id === task.id);
      if (index > -1) list.splice(index, 1);
    });
  }

  addToStatusArray(task: TaskItem) {
    switch (task.status) {
      case 'Backlog': this.backlog.push(task); break;
      case 'InProgress': this.inProgress.push(task); break;
      case 'Review': this.review.push(task); break;
      case 'Done': this.done.push(task); break;
    }
  }

  updateTaskStatus(task: TaskItem, newStatus: TaskItem['status']) {
    this.taskService.updateTask(task.id!, { status: newStatus }).subscribe({
      next: () => console.log(`Task "${task.title}" status updated to ${newStatus}`),
      error: () => console.error('Error updating status')
    });
  }

  openDeleteModal(taskId: string) {
    this.selectedTaskToDelete = taskId;
    const modal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    modal.show();
  }

  confirmDelete() {
    if (!this.selectedTaskToDelete) return;
  
    this.taskService.deleteTask(this.selectedTaskToDelete).subscribe({
      next: () => {
        console.log('Task deleted');
        this.taskService.emitTaskCreated();
  
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
        modal?.hide();
      },
      error: () => console.error('Error deleting task')
    });
  
    this.selectedTaskToDelete = null;
  }

}
