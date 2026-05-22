import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page.component';
import { RegisterPageComponent } from './pages/register-page.component';
import { HomePageComponent } from './pages/home-page.component';
import { ProfilePageComponent } from './pages/profile-page.component';
import { RankingPageComponent } from './pages/ranking-page.component';
import { CreateQuizPageComponent } from './pages/create-quiz-page.component';
import { AdminPageComponent } from './pages/admin-page.component';
import { ForgotPasswordPageComponent } from './pages/forgot-password-page.component';
import { ExplorePageComponent } from './pages/explore-page.component';
import { adminGuard, authGuard } from './core/route.guards';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'explore', component: ExplorePageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'admin-login', redirectTo: 'login', pathMatch: 'full' },
  { path: 'register', component: RegisterPageComponent },
  { path: 'forgot-password', component: ForgotPasswordPageComponent },
  { path: 'profile', component: ProfilePageComponent, canActivate: [authGuard] },
  { path: 'ranking', component: RankingPageComponent, canActivate: [authGuard] },
  { path: 'create-quiz', component: CreateQuizPageComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminPageComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' }
];