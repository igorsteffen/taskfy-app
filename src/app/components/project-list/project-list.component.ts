import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Project } from '../../models/projects';
import { ProjectService } from '../../services/project.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
declare var bootstrap: any;

@Component({
  selector: 'app-project-list',
  imports: [CommonModule, CdkDropList, CdkDrag, ReactiveFormsModule],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss'
})
export class ProjectListComponent implements OnInit {

  editingProject!: Project;
  editForm!: FormGroup;
  selectedProjectId: string | null = null;
  statuses = ['Backlog', 'InProgress', 'Review', 'Done'];

  projects: Project[] = [];

  backlog: Project[] = [];
  inProgress: Project[] = [];
  review: Project[] = [];
  done: Project[] = [];

  selectedProjectToDelete: string | null = null;

  constructor(private projectService: ProjectService, private fb: FormBuilder, private router:Router) { }

  ngOnInit(): void {

    this.editForm = this.fb.group({
      name: ['', Validators.required],
      status: ['', Validators.required],
      dueDate: ['', Validators.required]
    });

    this.loadProjects();

    this.projectService.projectCreated$.subscribe(() => {
      this.loadProjects(); // recarrega a lista completa
    });
  }

  loadProjects() {
    this.backlog = [];
    this.inProgress = [];
    this.review = [];
    this.done = [];

    this.projectService.getProjects().subscribe(projects => {
      this.projects = projects;

      projects.forEach((project: Project) => {
        this.addToStatusArray(project);
      });
    });
  }

  openEditProjectModal(project: Project) {
    this.editingProject = project;

    this.editForm.patchValue({
      name: project.name,
      status: project.status,
      dueDate: project.dueDate
    });

    const modal = new bootstrap.Modal(document.getElementById('editProjectModal'));
    modal.show();
  }

  closeEditModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('editProjectModal'));
    modal?.hide();
    this.editForm.reset();
    this.selectedProjectId = null;
  }

  updateProject() {
    if (this.editForm.invalid || !this.editingProject?.id) return;
  
    const { name, status, dueDate } = this.editForm.value;
  
    const updatedData = {
      name,
      status,
      dueDate: new Date(dueDate)
    };
  
    this.projectService.updateProject(this.editingProject.id, updatedData).subscribe({
      next: () => {
        console.log('Project updated!');
        this.projectService.emitProjectCreated();
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Error updating project:', err);
      }
    });
  }

  drop(event: CdkDragDrop<Project[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const previousList = event.previousContainer.data;
      const currentList = event.container.data;

      // Obtem o projeto original
      const movedProject = previousList[event.previousIndex];

      // Calcula o novo status com base no destino
      const newStatus = this.getStatusByContainerId(event.container.id);

      // ✅ 1. Atualiza o status ANTES da renderização
      movedProject.status = newStatus;

      // ✅ 2. Remove da lista antiga
      previousList.splice(event.previousIndex, 1);

      // ✅ 3. Adiciona à nova lista
      currentList.splice(event.currentIndex, 0, movedProject);

      // ✅ 4. Atualiza no backend
      this.projectService.updateProject(movedProject.id!, { status: newStatus }).subscribe();
    }
  }

  getStatusByContainerId(id: string): Project['status'] {
    if (id.includes('backlog')) return 'Backlog';
    if (id.includes('inProgress')) return 'InProgress';
    if (id.includes('review')) return 'Review';
    return 'Done';
  }


  changeStatus(project: Project, newStatus: Project['status']) {
    if (project.status === newStatus) return;

    // Remove da lista atual e atualiza o status
    this.removeFromStatusArray(project);
    project.status = newStatus;
    this.addToStatusArray(project);

    // Atualiza no backend
    this.updateProjectStatus(project, newStatus);
  }

  updateProjectStatus(project: Project, newStatus: Project['status']) {
    this.projectService.updateProject(project.id!, { status: newStatus }).subscribe({
      next: () => console.log(`Project "${project.name}" status updated to ${newStatus}`),
      error: () => console.error('Error updating status')
    });
  }

  removeFromStatusArray(project: Project) {
    [this.backlog, this.inProgress, this.review, this.done].forEach(list => {
      const index = list.findIndex(p => p.id === project.id);
      if (index > -1) list.splice(index, 1);
    });
  }

  addToStatusArray(project: Project) {
    switch (project.status) {
      case 'Backlog': this.backlog.push(project); break;
      case 'InProgress': this.inProgress.push(project); break;
      case 'Review': this.review.push(project); break;
      case 'Done': this.done.push(project); break;
    }
  }

  openDeleteModal(projectId: string) {
    this.selectedProjectToDelete = projectId;
    const modal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    modal.show();
  }
  
  confirmDelete() {
    if (!this.selectedProjectToDelete) return;
  
    this.projectService.deleteProject(this.selectedProjectToDelete).subscribe({
      next: () => {
        console.log('Project deleted');
        this.projectService.emitProjectCreated();
  
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
        modal?.hide();
      },
      error: () => console.error('Error deleting project')
    });
  
    this.selectedProjectToDelete = null;
  }

  GoToProjectTasks(id?: string){
    this.router.navigate([`/projects/${id}/projectTasks`]); 
  }

}
