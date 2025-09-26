"use client"

import Link from "next/link"
import { loansApi, booksApi, membersApi } from "@/lib/api"
import type { Loan, Book, Member } from "@/lib/types"
import { ErrorMessage } from "@/components/ui/error-message"
import { LoanActions } from "./loan-actions"

async function getLoansData(): Promise<{
  loans: Loan[]
  books: Book[]
  members: Member[]
  error?: string
}> {
  try {
    const [loans, books, members] = await Promise.all([loansApi.getAll(), booksApi.getAll(), membersApi.getAll()])

    return { loans, books, members }
  } catch (error: any) {
    console.error("Error fetching loans data:", error)
    return {
      loans: [],
      books: [],
      members: [],
      error: error.message || "Error al cargar los datos de préstamos",
    }
  }
}

export default async function LoansPage() {
  const { loans, books, members, error } = await getLoansData()

  // Enrich loans with book and member data
  const enrichedLoans = loans.map((loan) => ({
    ...loan,
    book: books.find((book) => book.id === loan.bookId),
    member: members.find((member) => member.id === loan.memberId),
  }))

  const activeLoans = enrichedLoans.filter((loan) => !loan.returned)
  const returnedLoans = enrichedLoans.filter((loan) => loan.returned)
  const availableBooks = books.filter((book) => book.available)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Préstamos</h1>
              <p className="text-gray-600 mt-2">Administra préstamos y devoluciones de libros</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/"
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Volver al Inicio
              </Link>
            </div>
          </div>

          {/* Error Message */}
          {error && <ErrorMessage message={error} className="mb-6" />}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-2xl font-bold text-purple-600">{activeLoans.length}</div>
              <div className="text-sm text-gray-600">Préstamos Activos</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-2xl font-bold text-green-600">{returnedLoans.length}</div>
              <div className="text-sm text-gray-600">Devueltos</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-2xl font-bold text-blue-600">{availableBooks.length}</div>
              <div className="text-sm text-gray-600">Libros Disponibles</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-2xl font-bold text-red-600">
                {activeLoans.filter((loan) => new Date(loan.dueDate) < new Date()).length}
              </div>
              <div className="text-sm text-gray-600">Vencidos</div>
            </div>
          </div>

          {/* New Loan Section */}
          {availableBooks.length > 0 && members.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Crear Nuevo Préstamo</h2>
              <LoanActions books={availableBooks} members={members} />
            </div>
          )}

          {/* Active Loans */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Préstamos Activos</h2>
            {activeLoans.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay préstamos activos</h3>
                <p className="text-gray-600">Todos los libros han sido devueltos</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {activeLoans.map((loan) => (
                  <div key={loan.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {loan.book?.title || "Libro no encontrado"}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              new Date(loan.dueDate) < new Date()
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {new Date(loan.dueDate) < new Date() ? "Vencido" : "Activo"}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-1">Autor: {loan.book?.author || "Desconocido"}</p>
                        <p className="text-gray-600 mb-1">Miembro: {loan.member?.name || "Miembro no encontrado"}</p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>Prestado: {new Date(loan.loanDate).toLocaleDateString("es-ES")}</span>
                          <span>Vence: {new Date(loan.dueDate).toLocaleDateString("es-ES")}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            try {
                              await loansApi.returnLoan(loan.id)
                              window.location.reload()
                            } catch (error) {
                              console.error("Error returning loan:", error)
                            }
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                        >
                          Devolver
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Returned Loans */}
          {returnedLoans.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Historial de Devoluciones</h2>
              <div className="grid gap-4">
                {returnedLoans.slice(0, 5).map((loan) => (
                  <div key={loan.id} className="bg-white rounded-lg shadow-md p-6 opacity-75">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {loan.book?.title || "Libro no encontrado"}
                          </h3>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Devuelto
                          </span>
                        </div>
                        <p className="text-gray-600 mb-1">Miembro: {loan.member?.name || "Miembro no encontrado"}</p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>Prestado: {new Date(loan.loanDate).toLocaleDateString("es-ES")}</span>
                          {loan.returnDate && (
                            <span>Devuelto: {new Date(loan.returnDate).toLocaleDateString("es-ES")}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
