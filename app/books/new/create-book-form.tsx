"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { booksApi, librariesApi } from "@/lib/api"
import type { CreateBookDto, Library } from "@/lib/types"
import { ErrorMessage } from "@/components/ui/error-message"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function CreateBookForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [libraries, setLibraries] = useState<Library[]>([])
  const [isLoadingLibraries, setIsLoadingLibraries] = useState(true)
  const [formData, setFormData] = useState<CreateBookDto>({
    title: "",
    author: "",
    isbn: "",
    libraryId: "",
  })

  useEffect(() => {
    let isActive = true

    const loadLibraries = async () => {
      setIsLoadingLibraries(true)
      try {
        const librariesResponse = await librariesApi.getAll()
        if (!isActive) return

        setLibraries(librariesResponse)

        if (librariesResponse.length > 0) {
          const libraryIdFromQuery = searchParams.get("libraryId")
          const defaultLibrary =
            librariesResponse.find((library) => library.id === libraryIdFromQuery) ?? librariesResponse[0]
          setFormData((prev) => ({
            ...prev,
            libraryId: prev.libraryId || defaultLibrary?.id || "",
          }))
        }
      } catch (err: any) {
        if (!isActive) return

        console.error("Error loading libraries:", err)
        setError(err.message || "No se pudieron cargar las bibliotecas disponibles")
      } finally {
        if (isActive) {
          setIsLoadingLibraries(false)
        }
      }
    }

    void loadLibraries()

    return () => {
      isActive = false
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        libraryId: formData.libraryId,
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

  const hasLibrariesAvailable = libraries.length > 0
  const isFormValid =
    formData.title.trim() && formData.author.trim() && formData.libraryId && hasLibrariesAvailable

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

      {/* Library Field */}
      <div>
        <label htmlFor="libraryId" className="block text-sm font-medium text-gray-700 mb-2">
          Biblioteca *
        </label>
        {isLoadingLibraries ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <LoadingSpinner className="w-4 h-4" /> Cargando bibliotecas...
          </div>
        ) : hasLibrariesAvailable ? (
          <select
            id="libraryId"
            name="libraryId"
            value={formData.libraryId}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            {libraries.map((library) => (
              <option key={library.id} value={library.id}>
                {library.name}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm text-gray-600">
            No hay bibliotecas registradas. Crea una biblioteca para poder asociar el libro.
          </p>
        )}
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
