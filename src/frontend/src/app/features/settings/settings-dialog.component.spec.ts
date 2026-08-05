import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SettingsDialogComponent } from './settings-dialog.component';
import { ThemeStore } from '../../core/state/theme.store';
import { API_BASE_URL } from '../../core/api-base-url';

describe('SettingsDialogComponent', () => {
  let http: HttpTestingController;
  let themeStore: ThemeStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SettingsDialogComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpTestingController);
    themeStore = TestBed.inject(ThemeStore);
  });

  afterEach(() => http.verify());

  it('lista todos os temas do catálogo', () => {
    const fixture = TestBed.createComponent(SettingsDialogComponent);
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const options = nativeElement.querySelectorAll('.settings-dialog__theme-option');
    expect(options.length).toBe(themeStore.themes.length);
  });

  it('seleciona um tema ao clicar na opção correspondente', () => {
    const fixture = TestBed.createComponent(SettingsDialogComponent);
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const options = Array.from(nativeElement.querySelectorAll<HTMLButtonElement>('.settings-dialog__theme-option'));
    const tokyoOption = options.find((button) => button.textContent?.includes('Tokyo'));
    tokyoOption?.click();

    http.expectOne(`${API_BASE_URL}/user-settings`).flush({ theme: 'tokyo' });

    expect(themeStore.currentThemeId()).toBe('tokyo');
  });
});
