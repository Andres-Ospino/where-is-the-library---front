"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { booksApi } from "@/lib/api"
import type { CreateBookDto } from "@/lib/types"
import { ErrorMessage } from "@/components/ui/error-message"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function CreateBookForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateBookDto>({
    title: "",
    author: "",
    isbn: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Clean up the data before sending
      const dataToSend = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        ...(formData.isbn?.trim() && { isbn: formData.isbn.trim() }),
      }

      await booksApi.create(dataToSend)
      router.push("/books")
      router.refresh()
    } catch (err: any) {
      console.error("Error creating book:", err)
      setError(err.message || "Error al crear el libro")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = formData.title.trim() && formData.author.trim()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <ErrorMessage message={error} />}

      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Título del Libro *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ingresa el título del libro"
          disabled={isLoading}
        />
      </div>

      {/* Author Field */}
      <div>
        <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
          Autor *
        </label>
        <input
          type="text"
          id="author"
          name="author"
          value={formData.author}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ingresa el nombre del autor"
          disabled={isLoading}
        />
      </div>

      {/* ISBN Field */}
      <div>
        <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-2">
          ISBN (Opcional)
        </label>
        <input
          type="text"
          id="isbn"
          name="isbn"
          value={formData.isbn}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ingresa el ISBN del libro"
          disabled={isLoading}
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <LoadingSpinner className="w-4 h-4" />
              Creando...
            </>
          ) : (
            "Crear Libro"
          )}
        </button>
      </div>
    </form>
  )
}
