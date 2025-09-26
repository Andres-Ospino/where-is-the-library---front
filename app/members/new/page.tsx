import Link from "next/link"
import { CreateMemberForm } from "./create-member-form"

export default function NewMemberPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/members" className="text-gray-600 hover:text-gray-800 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Agregar Nuevo Miembro</h1>
            </div>
            <p className="text-gray-600">Completa la información del miembro para registrarlo en la biblioteca</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <CreateMemberForm />
          </div>
        </div>
      </div>
    </main>
  )
}
