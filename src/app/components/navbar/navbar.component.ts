import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Project } from '../../models/projects';
declare var bootstrap: any;

@Component({
  selector: 'app-navbar',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  projectForm!: FormGroup;
  taskForm!: FormGroup;
  statuses = ['Backlog', 'InProgress', 'Review', 'Done'];
  projects: Project[] = []

  constructor(
    private fb: FormBuilder, 
    private taskService:TaskService,
    private authService : AuthService, 
    private projectService : ProjectService,
    private router : Router
  ){}

  ngOnInit() {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      status: ['', Validators.required],
      dueDate: ['', Validators.required]
    });

    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      projectId: ['', Validators.required],
      status: ['Backlog', Validators.required],
      dueDate: ['', Validators.required],
      tagIds: [[]]
    });

    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
      },
      error: (err) => {
        console.error('Error loading projects:', err);
      }
    });
  }

  logout(){
    this.authService.logout();
  }

  openProjectModal() {
    const modal = new bootstrap.Modal(document.getElementById('createProjectModal'));
    modal.show();
  }

  openTaskModal() {
    const modal = new bootstrap.Modal(document.getElementById('createTaskModal'));
    modal.show();
  }

  closeModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('createProjectModal'));
    modal?.hide();
  }

  closeTaskModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('createTaskModal'));
    modal?.hide();
  }

  createProject() {
    if (this.projectForm.invalid) return;

    const { name, status, dueDate } = this.projectForm.value;

    const newProject = {
      name,
      status,
      dueDate: new Date(dueDate),
      userId: this.authService.getUserId()
    };

    this.projectService.createProject(newProject).subscribe({
      next: (res) => {
        console.log('Project created:', res);
        this.projectService.emitProjectCreated(); // 🔔 dispara evento
        this.closeModal();
        this.projectForm.reset();
      },
      error: (err) => {
        console.error('Error creating project:', err?.error || err.message, err);
      }
    });
  }

  getCurrentUserId(): string {
    return this.authService.getUserId(); // exemplo
  }

  goToProjects() {
    this.router.navigate(['/projects']);    
  }

  createTask() {
    if (this.taskForm.invalid) return;
  
    const taskData = {
      ...this.taskForm.value,
      dueDate: new Date(this.taskForm.value.dueDate)
    };
    console.log('Dados enviados:', taskData); // ✅ Ver aqui os dados
    this.taskService.createTask(taskData).subscribe({
      next: () => {
        console.log('Task criada com sucesso!');
        this.taskForm.reset();
        this.taskService.emitTaskCreated();
        const modal = bootstrap.Modal.getInstance(document.getElementById('createTaskModal'));
        modal?.hide();
      },
      error: (err) => {
        console.error('Erro ao criar task:', err);
      }
    });
  }

  onTagInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value;
  
    const tagsArray = rawValue.split(',').map(tag => tag.trim()).filter(tag => tag);
  
    this.taskForm.patchValue({ tagIds: tagsArray });
  }
  
  
  
}
