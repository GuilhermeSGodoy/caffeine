import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserSettings } from '../models/user-settings.model';
import { API_BASE_URL } from '../api-base-url';

@Injectable({ providedIn: 'root' })
export class UserSettingsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/user-settings`;

  get() {
    return this.http.get<UserSettings>(this.baseUrl);
  }

  setTheme(theme: string) {
    return this.http.put<UserSettings>(this.baseUrl, { theme });
  }
}
