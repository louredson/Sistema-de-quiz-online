import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page.component';
import { RegisterPageComponent } from './pages/register-page.component';
import { HomePageComponent } from './pages/home-page.component';
import { ProfilePageComponent } from './pages/profile-page.component';
import { RankingPageComponent } from './pages/ranking-page.component';
import { CreateQuizPageComponent } from './pages/create-quiz-page.component';
import { AdminPageComponent } from './pages/admin-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'profile', component: ProfilePageComponent },
  { path: 'ranking', component: RankingPageComponent },
  { path: 'create-quiz', component: CreateQuizPageComponent },
  { path: 'admin', component: AdminPageComponent },
];
