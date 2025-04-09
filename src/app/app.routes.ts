import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SplashComponent } from './components/splash/splash.component';
import { SignupComponent } from './components/signup/signup.component';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { AuthGuard } from './guards/auth.guard';
import { ProjectTasksComponent } from './components/project-tasks/project-tasks.component';
import { TaskItemComponent } from './components/task-item/task-item.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

export const routes: Routes = [
    { path: '', component: SplashComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent},
  { path: 'projects', component: ProjectListComponent, canActivate:[AuthGuard] },
  { path: 'projects/:id/projectTasks', component: ProjectTasksComponent, canActivate:[AuthGuard] },
  { path: 'tasks/:id', component: TaskItemComponent, canActivate:[AuthGuard] },
  { path: 'navbar', component: NavbarComponent, canActivate:[AuthGuard]},
  { path: 'chatbot', component: ChatbotComponent, canActivate:[AuthGuard]}
];
