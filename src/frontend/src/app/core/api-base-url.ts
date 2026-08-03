// Em dev, o backend roda via `dotnet watch run` numa porta fixa (ver scripts/dev).
// Em produção, o Electron injeta a porta dinâmica descoberta no spawn do processo backend.
export const API_BASE_URL = (window as any).caffeine?.apiBaseUrl ?? 'http://127.0.0.1:5000/api';
