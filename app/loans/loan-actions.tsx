"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loansApi, ApiError, authApi } from "@/lib/api"
import type { Book, Member, CreateLoanDto, Library } from "@/lib/types"
import { ErrorMessage } from "@/components/ui/error-message"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface LoanActionsProps {
  books: Book[]
  members: Member[]
  libraries: Library[]
  initialLibraryId?: string
  onLoanCreated?: () => Promise<void> | void
}

export function LoanActions({ books, members, libraries, initialLibraryId, onLoanCreated }: LoanActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLibraryId, setSelectedLibraryId] = useState<string>(() => {
    const normalizedInitialId = initialLibraryId ? String(initialLibraryId) : null

    if (
      normalizedInitialId &&
      libraries.some((library) => String(library.id) === normalizedInitialId)
    ) {
      return normalizedInitialId
    }

    return libraries[0] ? String(libraries[0].id) : ""
  })
  const [formData, setFormData] = useState<CreateLoanDto>({
    bookId: "",
    memberId: "",
  })

  useEffect(() => {
    if (libraries.length === 0) {
      setSelectedLibraryId("")
      return
    }

    const normalizedInitialId = initialLibraryId ? String(initialLibraryId) : null

    if (
      normalizedInitialId &&
      libraries.some((library) => String(library.id) === normalizedInitialId)
    ) {
      setSelectedLibraryId(normalizedInitialId)
      return
    }

    setSelectedLibraryId((current) => {
      if (current && libraries.some((library) => String(library.id) === current)) {
        return current
      }

      return libraries[0] ? String(libraries[0].id) : ""
    })
  }, [initialLibraryId, libraries])

  const handleLoanFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLibraryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLibraryId = e.target.value
    setSelectedLibraryId(newLibraryId)
    setFormData({ bookId: "", memberId: "" })
  }

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!selectedLibraryId) {
        setError("Selecciona una biblioteca para continuar con el préstamo")
        setIsLoading(false)
        return
      }

      const selectedBook = books.find((book) => String(book.id) === formData.bookId)
      if (!selectedBook || String(selectedBook.libraryId) !== selectedLibraryId) {
        setError("El libro seleccionado no pertenece a la biblioteca elegida")
        setIsLoading(false)
        return
      }

      await loansApi.create(formData)
      if (onLoanCreated) {
        await onLoanCreated()
      }
      setFormData({ bookId: "", memberId: "" })
    } catch (err: any) {
      console.error("Error creating loan:", err)
      if (err instanceof ApiError && err.statusCode === 401) {
        authApi.clearToken()
        setError("Tu sesión ha expirado. Redirigiendo al inicio de sesión...")
        router.replace("/auth/login")
        return
      }

      setError(err.message || "Error al crear el préstamo")
    } finally {
      setIsLoading(false)
    }
  }

  const booksForSelectedLibrary = books.filter(
    (book) => String(book.libraryId) === selectedLibraryId,
  )
  const isFormValid = selectedLibraryId && formData.bookId && formData.memberId
  const hasLibraries = libraries.length > 0

  return (
    <form onSubmit={handleCreateLoan} className="space-y-4">
      {error && <ErrorMessage message={error} />}

      <div className="grid md:grid-cols-3 gap-4">
        {/* Library Selection */}
        <div>
          <label htmlFor="libraryId" className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Biblioteca
          </label>
          <select
            id="libraryId"
            name="libraryId"
            value={selectedLibraryId}
            onChange={handleLibraryChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            disabled={isLoading || !hasLibraries}
          >
            {hasLibraries ? (
              libraries.map((library) => (
                <option key={library.id} value={String(library.id)}>
                  {library.name}
                </option>
              ))
            ) : (
              <option value="">No hay bibliotecas disponibles</option>
            )}
          </select>
        </div>

        {/* Book Selection */}
        <div>
          <label htmlFor="bookId" className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Libro
          </label>
          <select
            id="bookId"
            name="bookId"
            value={formData.bookId}
            onChange={handleLoanFieldChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            disabled={isLoading}
          >
            <option value="">Selecciona un libro...</option>
            {booksForSelectedLibrary.map((book) => (
              <option key={book.id} value={String(book.id)}>
                {book.title} - {book.author}
              </option>
            ))}
          </select>
          {hasLibraries && booksForSelectedLibrary.length === 0 && (
            <p className="text-xs text-gray-500 mt-2">
              No hay libros disponibles en esta biblioteca. Publica un título para habilitar préstamos.
            </p>
          )}
        </div>

        {/* Member Selection */}
        <div>
          <label htmlFor="memberId" className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Miembro
          </label>
          <select
            id="memberId"
            name="memberId"
            value={formData.memberId}
            onChange={handleLoanFieldChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            disabled={isLoading}
          >
            <option value="">Selecciona un miembro...</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} - {member.email}
              </option>
            ))}
          </select>
          {members.length === 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Registra miembros para poder asignar préstamos en esta biblioteca.
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!isFormValid || isLoading || !hasLibraries || booksForSelectedLibrary.length === 0}
          className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <LoadingSpinner className="w-4 h-4" />
              Creando Préstamo...
            </>
          ) : (
            "Crear Préstamo"
          )}
        </button>
      </div>
    </form>
  )
}
