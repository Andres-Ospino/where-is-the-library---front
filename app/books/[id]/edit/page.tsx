import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EditBookForm } from "./edit-book-form"

interface EditBookPageProps {
  params: { id?: string }
}

export default function EditBookPage({ params }: EditBookPageProps) {
  const bookId = params.id

  if (!bookId) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/books" className="text-gray-600 hover:text-gray-800 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Editar libro</h1>
            </div>
            <p className="text-gray-600">
              Actualiza los datos de este libro para mantener el catálogo al día
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <Suspense
              fallback={
                <div className="flex justify-center py-8">
                  <LoadingSpinner className="w-6 h-6 text-blue-600" />
                </div>
              }
            >
              <EditBookForm bookId={bookId} />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  )
}
