import Link from "next/link"
import { booksApi } from "@/lib/api"
import type { Book } from "@/lib/types"
import { ErrorMessage } from "@/components/ui/error-message"

async function getBooks(): Promise<{ books: Book[]; error?: string }> {
  try {
    const books = await booksApi.getAll()
    return { books }
  } catch (error: any) {
    console.error("Error fetching books:", error)
    return { books: [], error: error.message || "Error al cargar los libros" }
  }
}

export default async function BooksPage() {
  const { books, error } = await getBooks()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Libros</h1>
              <p className="text-gray-600 mt-2">Administra el catálogo de libros de la biblioteca</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/"
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Volver al Inicio
              </Link>
              <Link
                href="/books/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Agregar Libro
              </Link>
            </div>
          </div>

          {/* Error Message */}
          {error && <ErrorMessage message={error} className="mb-6" />}

          {/* Books Grid */}
          {books.length === 0 && !error ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay libros registrados</h3>
              <p className="text-gray-600 mb-4">Comienza agregando el primer libro a la biblioteca</p>
              <Link
                href="/books/new"
                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Agregar Primer Libro
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <div key={book.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{book.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">por {book.author}</p>
                      {book.isbn && <p className="text-gray-500 text-xs">ISBN: {book.isbn}</p>}
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        book.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {book.available ? "Disponible" : "Prestado"}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Agregado: {new Date(book.createdAt).toLocaleDateString("es-ES")}</span>
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800 font-medium">Editar</button>
                        <button className="text-red-600 hover:text-red-800 font-medium">Eliminar</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {books.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{books.length}</div>
                  <div className="text-sm text-gray-600">Total de Libros</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {books.filter((book) => book.available).length}
                  </div>
                  <div className="text-sm text-gray-600">Disponibles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {books.filter((book) => !book.available).length}
                  </div>
                  <div className="text-sm text-gray-600">Prestados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((books.filter((book) => book.available).length / books.length) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Disponibilidad</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
