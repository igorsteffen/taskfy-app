import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Project } from '../models/projects';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private apiUrl = "https://localhost:7171/api/Projects"

  constructor(private http:HttpClient, private authService:AuthService) { }

  private getHeaders(){
    return {headers: new HttpHeaders({'x-access-token': this.authService.getToken() || ''})};
  }

  private projectCreatedSource = new Subject<void>();
  projectCreated$ = this.projectCreatedSource.asObservable();

  emitProjectCreated() {
    this.projectCreatedSource.next();
  }

  getProjects(){
    return this.http.get<Project[]>(`${this.apiUrl}`, this.getHeaders())
  }

  createProject(data: Partial<Project>) {
    return this.http.post<Project>(`${this.apiUrl}`, data, this.getHeaders());
  }

  getProjectsById(id:string){
    return this.http.get<{ project: Project }>(`${this.apiUrl}/${id}`, this.getHeaders())
  }

  deleteProject(id:string){
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders())
  }

  updateProject(id:string, data:Partial<Project>){
    return this.http.patch(`${this.apiUrl}/${id}`, data, this.getHeaders())
  }
}
