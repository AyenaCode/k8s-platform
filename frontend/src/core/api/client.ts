// Base REST client for the Go backend. In dev, calls are relative and Vite
// proxies them; in prod, the Go binary serves this SPA on the same origin.

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new ApiError(res.status, `GET ${path} failed`)
  return (await res.json()) as T
}

export async function apiPost<T>(path: string): Promise<T> {
  const res = await fetch(path, { method: 'POST', headers: { Accept: 'application/json' } })
  if (!res.ok) throw new ApiError(res.status, `POST ${path} failed`)
  return (await res.json()) as T
}
