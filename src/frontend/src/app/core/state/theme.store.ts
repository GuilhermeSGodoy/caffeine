import { Injectable, inject, signal } from '@angular/core';
import { PrimeNG } from 'primeng/config';
import { UserSettingsApiService } from '../services/user-settings-api.service';
import { DEFAULT_THEME_ID, THEMES, ThemeDefinition, findTheme } from '../theming/theme-catalog';

const DARK_MODE_CLASS = 'app-dark';

@Injectable({ providedIn: 'root' })
export class ThemeStore {
  private readonly api = inject(UserSettingsApiService);
  private readonly primeng = inject(PrimeNG);

  readonly themes: ThemeDefinition[] = THEMES;
  readonly currentThemeId = signal<string>(DEFAULT_THEME_ID);

  init(): Promise<void> {
    return new Promise((resolve) => {
      this.api.get().subscribe({
        next: (settings) => {
          this.applyTheme(findTheme(settings.theme));
          resolve();
        },
        error: () => {
          this.applyTheme(findTheme(DEFAULT_THEME_ID));
          resolve();
        },
      });
    });
  }

  setTheme(id: string): void {
    const theme = findTheme(id);
    this.applyTheme(theme);
    this.api.setTheme(theme.id).subscribe();
  }

  private applyTheme(theme: ThemeDefinition): void {
    this.primeng.theme.set({
      preset: theme.preset,
      options: { darkModeSelector: `.${DARK_MODE_CLASS}` },
    });
    document.documentElement.classList.toggle(DARK_MODE_CLASS, theme.dark);
    this.currentThemeId.set(theme.id);
  }
}
