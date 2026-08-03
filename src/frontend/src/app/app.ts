import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProjectTreeComponent } from './features/project-tree/project-tree.component';
import { EditorComponent } from './features/editor/editor.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ProjectTreeComponent, EditorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
