import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProjectTreeComponent } from './features/project-tree/project-tree.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ProjectTreeComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
