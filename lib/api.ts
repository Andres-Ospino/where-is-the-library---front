// Centralized HTTP client for API calls
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

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
    throw new ApiError(response.status, errorData.message || `HTTP ${response.status}`)
  }

  return response.json()
}

export const api = {
  // Generic GET method
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Ensure fresh data
    })

    return handleResponse<T>(response)
  },

  // Generic POST method
  async post<T>(path: string, body?: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    })

    return handleResponse<T>(response)
  },

  // Generic PUT method
  async put<T>(path: string, body?: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    })

    return handleResponse<T>(response)
  },

  // Generic DELETE method
  async delete<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    return handleResponse<T>(response)
  },
}

// Specific API methods for books
export const booksApi = {
  getAll: () => api.get<any[]>("/books"),
  getById: (id: string) => api.get<any>(`/books/${id}`),
  create: (data: any) => api.post<any>("/books", data),
  update: (id: string, data: any) => api.put<any>(`/books/${id}`, data),
  delete: (id: string) => api.delete<void>(`/books/${id}`),
}

// Specific API methods for members
export const membersApi = {
  getAll: () => api.get<any[]>("/members"),
  getById: (id: string) => api.get<any>(`/members/${id}`),
  create: (data: any) => api.post<any>("/members", data),
  update: (id: string, data: any) => api.put<any>(`/members/${id}`, data),
  delete: (id: string) => api.delete<void>(`/members/${id}`),
}

// Specific API methods for loans
export const loansApi = {
  getAll: () => api.get<any[]>("/loans"),
  getById: (id: string) => api.get<any>(`/loans/${id}`),
  create: (data: any) => api.post<any>("/loans", data),
  returnLoan: (id: string) => api.post<any>(`/loans/${id}/return`),
}
