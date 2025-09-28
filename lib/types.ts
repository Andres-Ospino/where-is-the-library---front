// Shared DTOs and types for the library management system
// Relationship: cada libro pertenece a una biblioteca específica identificada por `libraryId`.
export interface Book {
  id: string
  title: string
  author: string
  isbn?: string
  available: boolean
  libraryId: string
  library?: Library
  createdAt?: string | null
  updatedAt?: string | null
}

export interface Library {
  id: string
  name: string
  description?: string
  location?: string
  createdAt?: string | null
  updatedAt?: string | null
  books?: Book[]
}

export interface Member {
  id: string
  name: string
  email: string
  phone?: string
  createdAt?: string | null
  updatedAt?: string | null
}

export interface Loan {
  id: string
  bookId: string
  memberId: string
  loanDate?: string | null
  returnDate?: string | null
  isReturned: boolean
  book?: Book
  member?: Member
  library?: Library
}

export interface CreateBookDto {
  title: string
  author: string
  isbn?: string
  libraryId: string
}

export interface CreateLibraryDto {
  name: string
  description?: string
  location?: string
}

export interface BookQuery {
  title?: string
  author?: string
  libraryId?: string
}

export interface CreateMemberDto {
  name: string
  email: string
  phone?: string
  password?: string
}

export interface CreateLoanDto {
  bookId: string
  memberId: string
}

export interface LoanQuery {
  bookId?: string
  memberId?: string
  activeOnly?: boolean
}

export interface ApiError {
  message: string
  statusCode: number
}
