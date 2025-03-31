import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { TaskItem } from '../../models/tasks';
import { CommonModule, Location } from '@angular/common';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.scss'
})
export class TaskItemComponent implements OnInit {

  projectName: string = '';

  task: TaskItem = {
  title: '',
  description: '',
  dueDate: new Date(),
  status: 'Backlog',
  projectId: '',
  createdAt: new Date(),
  tagIds: []
};

  constructor(
    private route:ActivatedRoute,
    private taskService:TaskService,
    private location:Location,
    private projectService:ProjectService
  ){}

  ngOnInit(): void {
    const taskId = this.route.snapshot.paramMap.get('id');
  if (taskId) {
    this.taskService.getTasksById(taskId).subscribe({
      next: (taskResponse) => {
        this.task = taskResponse;

        console.log('Task loaded:', this.task);

        // Agora vamos buscar o nome do projeto
        this.projectService.getProjectsById(this.task.projectId).subscribe({
          next: (response) => {
            this.projectName = response.project.name;
            console.log(this.projectName)
          },
          error: (err) => {
            console.error('Erro ao buscar nome do projeto:', err);
            this.projectName = 'Unknown Project';
          }
        });
      },
      error: (err) => {
        console.error('Error loading task:', err);
      }
    });
  }
  }

  goBack(){
    this.location.back();
  }

}
