"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { loansApi, booksApi, membersApi, ApiError, authApi } from "@/lib/api"
import type { Loan, Book, Member } from "@/lib/types"
import { ErrorMessage } from "@/components/ui/error-message"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { LoanActions } from "./loan-actions"

export default function LoansPage() {
  const router = useRouter()
  const isMountedRef = useRef(true)
  const [loans, setLoans] = useState<Loan[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const handleUnauthorized = useCallback(() => {
    authApi.clearToken()
    setError("Tu sesión ha expirado. Redirigiendo al inicio de sesión...")
    setLoans([])
    setBooks([])
    setMembers([])
    router.replace("/auth/login")
  }, [router])

  const loadData = useCallback(async () => {
    if (!isMountedRef.current) return

    setIsLoading(true)
    setError(null)

    try {
      const [loansResponse, booksResponse, membersResponse] = await Promise.all([
        loansApi.getAll(),
        booksApi.getAll(),
        membersApi.getAll(),
      ])

      if (!isMountedRef.current) return

      setLoans(loansResponse)
      setBooks(booksResponse)
      setMembers(membersResponse)
    } catch (err) {
      if (!isMountedRef.current) return

      console.error("Error fetching loans data:", err)

      if (err instanceof ApiError && err.statusCode === 401) {
        handleUnauthorized()
        return
      }

      const message = err instanceof Error ? err.message : "Error al cargar los datos de préstamos"
      setError(message)
      setLoans([])
      setBooks([])
      setMembers([])
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [handleUnauthorized])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleReturnLoan = useCallback(
    async (loanId: string) => {
      try {
        await loansApi.returnLoan(loanId)
        await loadData()
      } catch (err) {
        console.error("Error returning loan:", err)

        if (err instanceof ApiError && err.statusCode === 401) {
          handleUnauthorized()
          return
        }

        const message = err instanceof Error ? err.message : "Error al devolver el préstamo"
        setError(message)
      }
    },
    [handleUnauthorized, loadData],
  )

  const enrichedLoans = loans.map((loan) => ({
    ...loan,
    book: books.find((book) => book.id === loan.bookId),
    member: members.find((member) => member.id === loan.memberId),
  }))

  const activeLoans = enrichedLoans.filter((loan) => !loan.isReturned)
  const returnedLoans = enrichedLoans.filter((loan) => loan.isReturned)
  const availableBooks = books.filter((book) => book.available)

  const now = new Date()
  const activeLoansWithDueInfo = activeLoans.filter((loan) => {
    if (!loan.returnDate) return false
    const dueDate = new Date(loan.returnDate)
    return !Number.isNaN(dueDate.getTime())
  })
  const overdueLoans = activeLoansWithDueInfo.filter((loan) => {
    if (!loan.returnDate) return false
    const dueDate = new Date(loan.returnDate)
    return !Number.isNaN(dueDate.getTime()) && dueDate < now
  })
  const overdueDisplayValue = activeLoansWithDueInfo.length > 0 ? overdueLoans.length.toString() : "N/D"

  const formatDate = (value?: string | null) => {
    if (!value) return null
    const parsedDate = new Date(value)
    if (Number.isNaN(parsedDate.getTime())) {
      return null
    }

    return parsedDate.toLocaleDateString("es-ES")
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
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

          {error && <ErrorMessage message={error} className="mb-6" />}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner className="w-8 h-8 text-purple-600" />
            </div>
          ) : (
            <>
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
                  <div className="text-2xl font-bold text-red-600">{overdueDisplayValue}</div>
                  <div className="text-sm text-gray-600">Vencidos</div>
                </div>
              </div>

              {availableBooks.length > 0 && members.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Crear Nuevo Préstamo</h2>
                  <LoanActions books={availableBooks} members={members} onLoanCreated={loadData} />
                </div>
              )}

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
                    {activeLoans.map((loan) => {
                      const loanDateLabel = formatDate(loan.loanDate)
                      const returnDateInstance = loan.returnDate ? new Date(loan.returnDate) : null
                      const hasReturnDate = Boolean(returnDateInstance) && !Number.isNaN(returnDateInstance.getTime())
                      const isOverdue = Boolean(returnDateInstance && returnDateInstance < now)
                      const statusClass = isOverdue ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"

                      return (
                        <div key={loan.id} className="bg-white rounded-lg shadow-md p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {loan.book?.title || "Libro no encontrado"}
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                                  {isOverdue ? "Vencido" : "Activo"}
                                </span>
                              </div>
                              <p className="text-gray-600 mb-1">Autor: {loan.book?.author || "Desconocido"}</p>
                              <p className="text-gray-600 mb-1">Miembro: {loan.member?.name || "Miembro no encontrado"}</p>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                <span>Prestado: {loanDateLabel ?? "Fecha no disponible"}</span>
                                <span>
                                  {hasReturnDate
                                    ? `Fecha objetivo: ${returnDateInstance.toLocaleDateString("es-ES")}`
                                    : "Fecha objetivo no disponible"}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => void handleReturnLoan(loan.id)}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                              >
                                Devolver
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {returnedLoans.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Historial de Devoluciones</h2>
                  <div className="grid gap-4">
                    {returnedLoans.slice(0, 5).map((loan) => {
                      const loanDateLabel = formatDate(loan.loanDate)
                      const returnDateLabel = formatDate(loan.returnDate)

                      return (
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
                              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                <span>Prestado: {loanDateLabel ?? "Fecha no disponible"}</span>
                                {returnDateLabel && <span>Devuelto: {returnDateLabel}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
