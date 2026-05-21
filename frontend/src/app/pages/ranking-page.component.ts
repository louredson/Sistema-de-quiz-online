import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';

@Component({ standalone: true, imports: [CommonModule], template: `
<div class='card'><h2>Ranking Global</h2>
<table><tr><th>#</th><th>Nome</th><th>Total</th><th>Melhor</th></tr>
<tr *ngFor='let r of rows'><td>{{r.position}}</td><td>{{r.name}}</td><td>{{r.total_score}}</td><td>{{r.best_score}}%</td></tr></table>
</div>` })
export class RankingPageComponent { rows:any[]=[]; api=inject(ApiService); constructor(){this.api.ranking().subscribe(r=>this.rows=r.ranking||[]);} }
