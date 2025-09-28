"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { booksApi, librariesApi, ApiError, authApi } from "@/lib/api"
import type { Book, CreateBookDto, Library } from "@/lib/types"
import { ErrorMessage } from "@/components/ui/error-message"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface EditBookFormProps {
  bookId: string
}

export function EditBookForm({ bookId }: EditBookFormProps) {
  const router = useRouter()
  const [book, setBook] = useState<Book | null>(null)
  const [libraries, setLibraries] = useState<Library[]>([])
  const [formData, setFormData] = useState<CreateBookDto>({
    title: "",
    author: "",
    isbn: "",
    libraryId: "",
  })
  const [isLoadingBook, setIsLoadingBook] = useState(true)
  const [isLoadingLibraries, setIsLoadingLibraries] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    const loadBook = async () => {
      setIsLoadingBook(true)
      setError(null)

      try {
        const response = await booksApi.getById(bookId)
        if (!isActive) return

        setBook(response)
        setFormData({
          title: response.title ?? "",
          author: response.author ?? "",
          isbn: response.isbn ?? "",
          libraryId: response.libraryId ?? "",
        })
      } catch (err) {
        if (!isActive) return

        console.error("Error loading book:", err)

        if (err instanceof ApiError && err.statusCode === 401) {
          authApi.clearToken()
          setError("Tu sesión ha expirado. Redirigiendo al inicio de sesión...")
          router.replace("/auth/login")
          return
        }

        const message = err instanceof Error ? err.message : "No se pudo cargar el libro"
        setError(message)
      } finally {
        if (isActive) {
          setIsLoadingBook(false)
        }
      }
    }

    void loadBook()

    return () => {
      isActive = false
    }
  }, [bookId, router])

  useEffect(() => {
    let isActive = true

    const loadLibraries = async () => {
      setIsLoadingLibraries(true)

      try {
        const librariesResponse = await librariesApi.getAll()
        if (!isActive) return

        setLibraries(librariesResponse)

        if (librariesResponse.length > 0) {
          setFormData((previous) => ({
            ...previous,
            libraryId: previous.libraryId || librariesResponse[0]?.id || "",
          }))
        }
      } catch (err) {
        if (!isActive) return

        console.error("Error loading libraries:", err)

        if (err instanceof ApiError && err.statusCode === 401) {
          authApi.clearToken()
          setError("Tu sesión ha expirado. Redirigiendo al inicio de sesión...")
          router.replace("/auth/login")
          return
        }

        const message = err instanceof Error ? err.message : "No se pudieron cargar las bibliotecas"
        setError(message)
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
  }, [router])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (isSaving) {
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const trimmedTitle = formData.title.trim()
      const trimmedAuthor = formData.author.trim()
      const trimmedIsbn = formData.isbn?.trim() ?? ""
      const selectedLibraryId = formData.libraryId

      if (!trimmedTitle) {
        setError("El título es obligatorio")
        setIsSaving(false)
        return
      }

      if (!trimmedAuthor) {
        setError("El autor es obligatorio")
        setIsSaving(false)
        return
      }

      if (!selectedLibraryId) {
        setError("Selecciona una biblioteca para el libro")
        setIsSaving(false)
        return
      }

      const payload: Partial<CreateBookDto> = {
        title: trimmedTitle,
        author: trimmedAuthor,
        libraryId: selectedLibraryId,
      }

      if (trimmedIsbn) {
        payload.isbn = trimmedIsbn
      }

      await booksApi.update(bookId, payload)
      router.push("/books")
      router.refresh()
    } catch (err) {
      console.error("Error updating book:", err)

      if (err instanceof ApiError && err.statusCode === 401) {
        authApi.clearToken()
        setError("Tu sesión ha expirado. Redirigiendo al inicio de sesión...")
        router.replace("/auth/login")
        return
      }

      const message = err instanceof Error ? err.message : "Error al actualizar el libro"
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoadingBook) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner className="w-6 h-6 text-blue-600" />
      </div>
    )
  }

  if (!book) {
    return <ErrorMessage message={error ?? "Libro no encontrado"} />
  }

  const hasLibrariesAvailable = libraries.length > 0
  const isFormValid =
    formData.title.trim().length > 0 &&
    formData.author.trim().length > 0 &&
    formData.libraryId.trim().length > 0 &&
    hasLibrariesAvailable

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <ErrorMessage message={error} />}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Título del Libro *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={formData.title}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ingresa el título del libro"
          disabled={isSaving}
        />
      </div>

      <div>
        <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
          Autor *
        </label>
        <input
          id="author"
          name="author"
          type="text"
          required
          value={formData.author}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ingresa el nombre del autor"
          disabled={isSaving}
        />
      </div>

      <div>
        <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-2">
          ISBN (Opcional)
        </label>
        <input
          id="isbn"
          name="isbn"
          type="text"
          value={formData.isbn}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ingresa el ISBN del libro"
          disabled={isSaving}
        />
      </div>

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
            disabled={isSaving}
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

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
          disabled={isSaving}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!isFormValid || isSaving}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <LoadingSpinner className="w-4 h-4" />
              Guardando...
            </>
          ) : (
            "Guardar Cambios"
          )}
        </button>
      </div>
    </form>
  )
}
