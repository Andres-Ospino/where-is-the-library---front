// Centralized HTTP client for API calls
import type {
  Book,
  BookQuery,
  CreateBookDto,
  CreateLoanDto,
  CreateMemberDto,
  Loan,
  LoanQuery,
  Member,
} from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
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

const defaultHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
}

export const api = {
  // Generic GET method
  async get<T>(path: string, query?: Record<string, QueryParamValue>): Promise<T> {
    const response = await fetch(buildUrl(path, query), {
      method: "GET",
      headers: defaultHeaders,
      cache: "no-store", // Ensure fresh data
    })

    return handleResponse<T>(response)
  },

  // Generic POST method
  async post<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(buildUrl(path), {
      method: "POST",
      headers: defaultHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    })

    return handleResponse<T>(response)
  },

  // Generic PUT method
  async put<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(buildUrl(path), {
      method: "PUT",
      headers: defaultHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    })

    return handleResponse<T>(response)
  },

  // Generic PATCH method
  async patch<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(buildUrl(path), {
      method: "PATCH",
      headers: defaultHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    })

    return handleResponse<T>(response)
  },

  // Generic DELETE method
  async delete<T>(path: string): Promise<T> {
    const response = await fetch(buildUrl(path), {
      method: "DELETE",
      headers: defaultHeaders,
      cache: "no-store",
    })

    return handleResponse<T>(response)
  },
}

// Specific API methods for books
export const booksApi = {
  getAll: (filters?: BookQuery) => api.get<Book[]>("/books", filters),
  getById: (id: string) => api.get<Book>(`/books/${id}`),
  create: (data: CreateBookDto) => api.post<Book | undefined>("/books", data),
  update: (id: string, data: Partial<CreateBookDto>) => api.patch<Book | undefined>(`/books/${id}`, data),
  delete: (id: string) => api.delete<void>(`/books/${id}`),
}

// Specific API methods for members
export const membersApi = {
  getAll: () => api.get<Member[]>("/members"),
  getById: (id: string) => api.get<Member>(`/members/${id}`),
  create: (data: CreateMemberDto) => api.post<Member | undefined>("/members", data),
  update: (id: string, data: Partial<CreateMemberDto>) => api.put<Member | undefined>(`/members/${id}`, data),
  delete: (id: string) => api.delete<void>(`/members/${id}`),
}

// Specific API methods for loans
export const loansApi = {
  getAll: (filters?: LoanQuery) => api.get<Loan[]>("/loans", filters),
  getById: (id: string) => api.get<Loan>(`/loans/${id}`),
  create: (data: CreateLoanDto) => api.post<Loan | undefined>("/loans", data),
  returnLoan: (id: string) => api.post<Loan | undefined>(`/loans/${id}/return`),
}
