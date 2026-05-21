import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../core/api.service';

@Component({ standalone: true, imports: [CommonModule, FormsModule], template: `
<div class='card form-card'>
<h2>Criar Conta</h2>
<input [(ngModel)]='name' placeholder='Nome'>
<input [(ngModel)]='email' placeholder='Email'>
<input [(ngModel)]='password' placeholder='Password' type='password'>
<button (click)='register()'>Registar</button>
<p>{{msg}}</p>
</div>` })
export class RegisterPageComponent {
  name=''; email=''; password=''; msg='';
  api=inject(ApiService); router=inject(Router);
  register(){this.api.register({name:this.name,email:this.email,password:this.password}).subscribe({next:()=>{this.msg='Conta criada';this.router.navigateByUrl('/login');},error:e=>this.msg=e.error?.message||'Erro'});}
}
