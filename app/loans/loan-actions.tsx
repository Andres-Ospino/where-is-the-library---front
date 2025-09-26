"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { loansApi } from "@/lib/api"
import type { Book, Member, CreateLoanDto } from "@/lib/types"
import { ErrorMessage } from "@/components/ui/error-message"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface LoanActionsProps {
  books: Book[]
  members: Member[]
}

export function LoanActions({ books, members }: LoanActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateLoanDto>({
    bookId: "",
    memberId: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await loansApi.create(formData)
      setFormData({ bookId: "", memberId: "" })
      router.refresh()
    } catch (err: any) {
      console.error("Error creating loan:", err)
      setError(err.message || "Error al crear el préstamo")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = formData.bookId && formData.memberId

  return (
    <form onSubmit={handleCreateLoan} className="space-y-4">
      {error && <ErrorMessage message={error} />}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Book Selection */}
        <div>
          <label htmlFor="bookId" className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Libro
          </label>
          <select
            id="bookId"
            name="bookId"
            value={formData.bookId}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            disabled={isLoading}
          >
            <option value="">Selecciona un libro...</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title} - {book.author}
              </option>
            ))}
          </select>
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
            onChange={handleInputChange}
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
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
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
