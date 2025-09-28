"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { librariesApi, ApiError, authApi } from "@/lib/api"
import type { Library } from "@/lib/types"
import { ErrorMessage } from "@/components/ui/error-message"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function LibrariesPage() {
  const router = useRouter()
  const [libraries, setLibraries] = useState<Library[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    const loadLibraries = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await librariesApi.getAll()
        if (!isActive) return

        setLibraries(response)
      } catch (err) {
        if (!isActive) return

        console.error("Error fetching libraries:", err)

        if (err instanceof ApiError && err.statusCode === 401) {
          authApi.clearToken()
          setError("Tu sesión ha expirado. Redirigiendo al inicio de sesión...")
          router.replace("/auth/login")
          setLibraries([])
          return
        }

        const message = err instanceof Error ? err.message : "Error al cargar las bibliotecas"
        setError(message)
        setLibraries([])
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadLibraries()

    return () => {
      isActive = false
    }
  }, [router])

  const totalLibraries = libraries.length
  const totalBooks = libraries.reduce((acc, library) => acc + (library.books?.length ?? 0), 0)
  const librariesWithBooks = libraries.filter((library) => (library.books?.length ?? 0) > 0)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Marketplace de Bibliotecas</h1>
              <p className="text-gray-600 mt-2">
                Descubre las bibliotecas disponibles y sus catálogos para iniciar un préstamo al instante
              </p>
            </div>
            <Link href="/" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors">
              Volver al Inicio
            </Link>
          </div>

          {error && <ErrorMessage message={error} className="mb-6" />}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner className="w-8 h-8 text-blue-600" />
            </div>
          ) : totalLibraries === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.054 0-2-.816-2-1.824V4.824C10 3.816 10.946 3 12 3s2 .816 2 1.824v1.352C14 7.184 13.054 8 12 8z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 21V9a2 2 0 012-2h10a2 2 0 012 2v12"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aún no hay bibliotecas registradas</h3>
              <p className="text-gray-600">
                Crea una biblioteca desde el panel de administración para comenzar a asociar libros y gestionar préstamos.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="text-2xl font-bold text-blue-600">{totalLibraries}</div>
                  <div className="text-sm text-gray-600">Bibliotecas activas</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="text-2xl font-bold text-green-600">{totalBooks}</div>
                  <div className="text-sm text-gray-600">Libros publicados</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="text-2xl font-bold text-purple-600">{librariesWithBooks.length}</div>
                  <div className="text-sm text-gray-600">Bibliotecas con catálogo disponible</div>
                </div>
              </div>

              <div className="grid gap-6">
                {libraries.map((library) => {
                  const books = library.books ?? []
                  const hasBooks = books.length > 0

                  return (
                    <div key={library.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <div>
                          <h2 className="text-2xl font-semibold text-gray-900">{library.name}</h2>
                          {library.location && <p className="text-sm text-gray-500">{library.location}</p>}
                          {library.description && (
                            <p className="text-gray-600 mt-2 max-w-2xl">{library.description}</p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Link
                            href={`/loans?libraryId=${library.id}`}
                            className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                          >
                            Iniciar préstamo aquí
                          </Link>
                          <Link
                            href={`/books/new?libraryId=${library.id}`}
                            className="inline-flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 transition-colors"
                          >
                            Agregar libro a esta biblioteca
                          </Link>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        {hasBooks ? (
                          <div className="grid gap-3 md:grid-cols-2">
                            {books.map((book) => (
                              <div key={book.id} className="flex flex-col gap-1 p-4 rounded-md bg-gray-50">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      book.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {book.available ? "Disponible" : "Prestado"}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">Autor: {book.author}</p>
                                {book.isbn && <p className="text-xs text-gray-500">ISBN: {book.isbn}</p>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600">
                            Esta biblioteca aún no ha publicado libros. Agrega un título para que los miembros puedan solicitarlo.
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
