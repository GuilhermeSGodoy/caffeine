import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ThemeStore } from './theme.store';
import { API_BASE_URL } from '../api-base-url';

describe('ThemeStore', () => {
  let store: ThemeStore;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    store = TestBed.inject(ThemeStore);
    http = TestBed.inject(HttpTestingController);
    document.documentElement.classList.remove('app-dark');
  });

  afterEach(() => http.verify());

  it('aplica o tema salvo e marca como atual ao inicializar', async () => {
    const initPromise = store.init();
    http.expectOne(`${API_BASE_URL}/user-settings`).flush({ theme: 'tokyo' });
    await initPromise;

    expect(store.currentThemeId()).toBe('tokyo');
    expect(document.documentElement.classList.contains('app-dark')).toBe(true);
  });

  it('cai no tema padrão quando a busca inicial falha', async () => {
    const initPromise = store.init();
    http.expectOne(`${API_BASE_URL}/user-settings`).flush('erro', { status: 500, statusText: 'Server Error' });
    await initPromise;

    expect(store.currentThemeId()).toBe('caffeine');
  });

  it('remove a classe de modo escuro ao selecionar um tema claro', () => {
    store.setTheme('latte');
    http.expectOne(`${API_BASE_URL}/user-settings`).flush({ theme: 'latte' });

    expect(store.currentThemeId()).toBe('latte');
    expect(document.documentElement.classList.contains('app-dark')).toBe(false);
  });

  it('persiste o tema escolhido via API', () => {
    store.setTheme('caffeine');

    const req = http.expectOne(`${API_BASE_URL}/user-settings`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ theme: 'caffeine' });
    req.flush({ theme: 'caffeine' });
  });
});
