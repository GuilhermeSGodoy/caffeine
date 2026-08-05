import { Component, inject, input, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { PanelModule } from 'primeng/panel';
import { ThemeStore } from '../../core/state/theme.store';

@Component({
  selector: 'app-settings-dialog',
  standalone: true,
  imports: [DialogModule, PanelModule],
  templateUrl: './settings-dialog.component.html',
  styleUrl: './settings-dialog.component.scss'
})
export class SettingsDialogComponent {
  protected readonly themeStore = inject(ThemeStore);

  readonly visible = input(false);
  readonly visibleChange = output<boolean>();

  protected onVisibleChange(visible: boolean): void {
    this.visibleChange.emit(visible);
  }

  protected selectTheme(id: string): void {
    this.themeStore.setTheme(id);
  }
}
