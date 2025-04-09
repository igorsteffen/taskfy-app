import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { TaskItem } from '../models/tasks';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private apiUrl = "https://taskfy20250408212035.azurewebsites.net/api/Tasks"

  constructor(private http:HttpClient, private authService:AuthService) { }

  private getHeaders(){
    return {headers: new HttpHeaders({'x-access-token': this.authService.getToken() || ''})};
  }

  private taskCreatedSource = new Subject<void>();
    taskCreated$ = this.taskCreatedSource.asObservable();
  
    emitTaskCreated() {
      this.taskCreatedSource.next();
    }

  getTasks(){
      return this.http.get<TaskItem[]>(`${this.apiUrl}`, this.getHeaders())
    }

    getTasksByProjectId(projectId: string) {
      return this.http.get<TaskItem[]>(`${this.apiUrl}/project/${projectId}`, this.getHeaders());
    }
  
    createTask(task: Partial<TaskItem>) {
      return this.http.post<TaskItem>(`${this.apiUrl}`, task, this.getHeaders());
    }
  
    getTasksById(id:string){
      return this.http.get<TaskItem>(`${this.apiUrl}/${id}`, this.getHeaders())
    }  
    
    updateTask(id:string, task:Partial<TaskItem>){
      return this.http.patch(`${this.apiUrl}/${id}`, task, this.getHeaders())
    }

    deleteTask(id:string){
      return this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders())
    }
}
