// Centralized HTTP client for API calls
import type {
  Book,
  BookQuery,
  CreateLibraryDto,
  CreateBookDto,
  CreateLoanDto,
  CreateMemberDto,
  Library,
  Loan,
  LoanQuery,
  Member,
} from "./types"

// Permite configurar la URL base del backend desde variables de entorno en tiempo de build,
// utilizando el valor de la colección de Postman como predeterminado para mantener compatibilidad.
const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL)?.trim() ||
  "https://backend-480236425407.us-central1.run.app"
const AUTH_TOKEN_STORAGE_KEY = "library-auth-token"

const isBrowser = () => typeof window !== "undefined"

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

type AuthTokenProvider = () => string | null

let inMemoryAuthToken: string | null = null
let customAuthTokenProvider: AuthTokenProvider | null = null

function persistAuthToken(token: string | null) {
  inMemoryAuthToken = token

  if (!isBrowser()) {
    return
  }

  try {
    if (token) {
      window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
    } else {
      window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    }
  } catch (error) {
    console.warn("No se pudo actualizar el token en el almacenamiento local", error)
  }
}

export function setAuthToken(token: string) {
  persistAuthToken(token)
}

export function clearAuthToken() {
  persistAuthToken(null)
}

export function configureAuthTokenProvider(provider: AuthTokenProvider | null) {
  customAuthTokenProvider = provider
}

export function getAuthToken(): string | null {
  if (customAuthTokenProvider) {
    try {
      const providedToken = customAuthTokenProvider()
      if (providedToken) {
        inMemoryAuthToken = providedToken
        return providedToken
      }
    } catch (error) {
      console.warn("No se pudo obtener el token desde el proveedor configurado", error)
    }
  }

  if (inMemoryAuthToken) {
    return inMemoryAuthToken
  }

  if (!isBrowser()) {
    return null
  }

  try {
    const storedToken = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
    inMemoryAuthToken = storedToken
    return storedToken
  } catch (error) {
    console.warn("No se pudo leer el token almacenado", error)
    return null
  }
}

type QueryParamValue = string | number | boolean | null | undefined

function buildUrl(path: string, query?: Record<string, QueryParamValue>) {
  const baseUrl = API_BASE_URL.replace(/\/$/, "")
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const url = new URL(`${baseUrl}${normalizedPath}`)

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return
      }

      const stringValue = String(value)

      if (stringValue.trim().length > 0) {
        url.searchParams.set(key, stringValue)
      }
    })
  }

  return url.toString()
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? ""
  const isJson = contentType.includes("application/json")

  let rawText: string | undefined
  try {
    rawText = await response.text()
  } catch (error) {
    rawText = undefined
  }

  let data: unknown = undefined

  if (rawText && rawText.length > 0) {
    if (isJson) {
      try {
        data = JSON.parse(rawText)
      } catch (error) {
        data = rawText
      }
    } else {
      data = rawText
    }
  }

  if (!response.ok) {
    let message = `HTTP ${response.status}`

    if (data && typeof data === "object" && "message" in data && (data as any).message) {
      message = String((data as any).message)
    } else if (typeof data === "string" && data.trim().length > 0) {
      message = data.trim()
    }

    throw new ApiError(response.status, message)
  }

  return (data as T) ?? (undefined as T)
}

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResponse {
  token?: string
  accessToken?: string
  access_token?: string
  [key: string]: unknown
}

function extractAuthToken(payload: LoginResponse | undefined): string | null {
  if (!payload || typeof payload !== "object") {
    return null
  }

  const possibleKeys: (keyof LoginResponse)[] = ["token", "accessToken", "access_token"]

  for (const key of possibleKeys) {
    const value = payload[key]
    if (typeof value === "string" && value.trim().length > 0) {
      return value
    }
  }

  return null
}

const defaultHeaders: Record<string, string> = {
  Accept: "application/json",
  "Content-Type": "application/json",
}

function withAuthHeaders(customHeaders?: HeadersInit): HeadersInit {
  const headers = new Headers(defaultHeaders)

  if (customHeaders) {
    new Headers(customHeaders).forEach((value, key) => {
      headers.set(key, value)
    })
  }

  const token = getAuthToken()
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  return headers
}

export const api = {
  // Generic GET method
  async get<T>(path: string, query?: Record<string, QueryParamValue>): Promise<T> {
    const response = await fetch(buildUrl(path, query), {
      method: "GET",
      headers: withAuthHeaders(),
      cache: "no-store", // Ensure fresh data
    })

    return handleResponse<T>(response)
  },

  // Generic POST method
  async post<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(buildUrl(path), {
      method: "POST",
      headers: withAuthHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    })

    return handleResponse<T>(response)
  },

  // Generic PUT method
  async put<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(buildUrl(path), {
      method: "PUT",
      headers: withAuthHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    })

    return handleResponse<T>(response)
  },

  // Generic PATCH method
  async patch<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(buildUrl(path), {
      method: "PATCH",
      headers: withAuthHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    })

    return handleResponse<T>(response)
  },

  // Generic DELETE method
  async delete<T>(path: string): Promise<T> {
    const response = await fetch(buildUrl(path), {
      method: "DELETE",
      headers: withAuthHeaders(),
      cache: "no-store",
    })

    return handleResponse<T>(response)
  },
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<string> {
    const response = await api.post<LoginResponse>("/auth/login", credentials)
    const token = extractAuthToken(response)

    if (!token) {
      throw new Error("Token de autenticación no encontrado en la respuesta del servidor")
    }

    setAuthToken(token)
    return token
  },
  setToken: setAuthToken,
  clearToken: clearAuthToken,
  getToken: getAuthToken,
  configureTokenProvider: configureAuthTokenProvider,
}

// Specific API methods for books
export const booksApi = {
  getAll: (filters?: BookQuery) => api.get<Book[]>("/books", filters),
  getById: (id: string) => api.get<Book>(`/books/${id}`),
  create: (data: CreateBookDto) => api.post<Book | undefined>("/books", data),
  update: (id: string, data: Partial<CreateBookDto>) => api.patch<Book | undefined>(`/books/${id}`, data),
  delete: (id: string) => api.delete<void>(`/books/${id}`),
}

// Specific API methods for libraries
export const librariesApi = {
  getAll: () => api.get<Library[]>("/libraries"),
  getById: (id: string) => api.get<Library>(`/libraries/${id}`),
  create: (data: CreateLibraryDto) => api.post<Library | undefined>("/libraries", data),
  update: (id: string, data: Partial<CreateLibraryDto>) =>
    api.patch<Library | undefined>(`/libraries/${id}`, data),
  delete: (id: string) => api.delete<void>(`/libraries/${id}`),
}

// Specific API methods for members
export const membersApi = {
  getAll: () => api.get<Member[]>("/members"),
  getById: (id: string) => api.get<Member>(`/members/${id}`),
  create: (data: CreateMemberDto) => {
    const payload: CreateMemberDto = { ...data }
    if (!payload.password) {
      delete payload.password
    }

    return api.post<Member | undefined>("/members", payload)
  },
  update: (id: string, data: Partial<CreateMemberDto>) => {
    const payload: Partial<CreateMemberDto> = { ...data }
    if (!payload.password) {
      delete payload.password
    }

    return api.put<Member | undefined>(`/members/${id}`, payload)
  },
  delete: (id: string) => api.delete<void>(`/members/${id}`),
}

// Specific API methods for loans
export const loansApi = {
  getAll: (filters?: LoanQuery) => api.get<Loan[]>("/loans", filters),
  getById: (id: string) => api.get<Loan>(`/loans/${id}`),
  create: (data: CreateLoanDto) => api.post<Loan | undefined>("/loans", data),
  returnLoan: (id: string) => api.post<Loan | undefined>(`/loans/${id}/return`),
}
