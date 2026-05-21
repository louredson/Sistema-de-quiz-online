import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';

@Component({ standalone: true, imports: [CommonModule], template: `
<div class='card'><h2>Perfil</h2>
<p><b>Nome:</b> {{data?.profile?.name}}</p>
<p><b>Email:</b> {{data?.profile?.email}}</p>
<p><b>Role:</b> {{data?.profile?.role}}</p>
<p><b>Ranking Global:</b> #{{data?.stats?.global_rank}}</p>
<p><b>Tentativas:</b> {{data?.stats?.total_attempts}}</p>
<p><b>Melhor Score:</b> {{data?.stats?.best_score}}%</p>
</div>` })
export class ProfilePageComponent {
  data:any; api=inject(ApiService);
  constructor(){this.api.profile().subscribe(r=>this.data=r);}
}
