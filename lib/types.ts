// Shared DTOs and types for the library management system
export interface Book {
  id: string
  title: string
  author: string
  isbn?: string
  available: boolean
  createdAt?: string | null
  updatedAt?: string | null
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
}

export interface CreateBookDto {
  title: string
  author: string
  isbn?: string
}

export interface BookQuery {
  title?: string
  author?: string
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
