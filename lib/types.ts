// Shared DTOs and types for the library management system
export interface Book {
  id: string
  title: string
  author: string
  isbn?: string
  available: boolean
  createdAt: string
  updatedAt: string
}

export interface Member {
  id: string
  name: string
  email: string
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface Loan {
  id: string
  bookId: string
  memberId: string
  loanDate: string
  returnDate?: string
  dueDate: string
  returned: boolean
  book?: Book
  member?: Member
}

export interface CreateBookDto {
  title: string
  author: string
  isbn?: string
}

export interface CreateMemberDto {
  name: string
  email: string
  phone?: string
}

export interface CreateLoanDto {
  bookId: string
  memberId: string
}

export interface ApiError {
  message: string
  statusCode: number
}
