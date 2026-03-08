/* ============================================================
 * 🌿 API Client — Fetch wrapper с Telegram initData авторизацией
 * ============================================================ */

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

/** Получить initData из Telegram WebApp SDK */
function getInitData(): string {
  return window.Telegram?.WebApp?.initData ?? "";
}

/** Базовый fetch с авторизацией */
async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  // Telegram initData → заголовок авторизации
  const initData = getInitData();
  if (initData) {
    headers["X-Telegram-Init-Data"] = initData;
  }

  const config: RequestInit = {
    ...rest,
    headers,
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, config);

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new ApiError(response.status, errorBody || response.statusText);
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/** Типизированная ошибка API */
export class ApiError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    super(`API Error ${status}: ${body}`);
    this.name = "ApiError";
  }
}

/* ── Convenience methods ──────────────────────────────── */

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body }),

  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),

  /** Upload файла (multipart) */
  upload: async <T>(path: string, file: File, field = "file"): Promise<T> => {
    const form = new FormData();
    form.append(field, file);

    const initData = getInitData();
    const headers: Record<string, string> = {};
    if (initData) {
      headers["X-Telegram-Init-Data"] = initData;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: form,
    });

    if (!res.ok) {
      throw new ApiError(res.status, await res.text().catch(() => ""));
    }

    return res.json();
  },
};
