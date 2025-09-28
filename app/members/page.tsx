"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { membersApi, ApiError, authApi } from "@/lib/api"
import type { Member } from "@/lib/types"
import { ErrorMessage } from "@/components/ui/error-message"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function MembersPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    const fetchMembers = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await membersApi.getAll()
        if (!isActive) return

        setMembers(response)
      } catch (err) {
        if (!isActive) return

        console.error("Error fetching members:", err)

        if (err instanceof ApiError && err.statusCode === 401) {
          authApi.clearToken()
          setError("Tu sesión ha expirado. Redirigiendo al inicio de sesión...")
          router.replace("/auth/login")
          setMembers([])
          return
        }

        const message = err instanceof Error ? err.message : "Error al cargar los miembros"
        setError(message)
        setMembers([])
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void fetchMembers()

    return () => {
      isActive = false
    }
  }, [router])

  const handleEdit = (memberId: string) => {
    router.push(`/members/${memberId}/edit`)
  }

  const handleDelete = async (memberId: string) => {
    const memberToDelete = members.find((item) => item.id === memberId)
    const confirmationMessage = memberToDelete
      ? `¿Estás seguro de que deseas eliminar a "${memberToDelete.name}"?`
      : "¿Estás seguro de que deseas eliminar este miembro?"

    const confirmed = window.confirm(confirmationMessage)
    if (!confirmed) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await membersApi.delete(memberId)
      setMembers((previous) => previous.filter((item) => item.id !== memberId))
      router.refresh()
    } catch (err) {
      console.error("Error deleting member:", err)

      if (err instanceof ApiError && err.statusCode === 401) {
        authApi.clearToken()
        setError("Tu sesión ha expirado. Redirigiendo al inicio de sesión...")
        router.replace("/auth/login")
        return
      }

      const message = err instanceof Error ? err.message : "Error al eliminar el miembro"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const membersWithPhone = members.filter((member) => Boolean(member.phone))
  const memberCreationDates = members
    .map((member) => (member.createdAt ? new Date(member.createdAt) : null))
    .filter((date): date is Date => Boolean(date) && !Number.isNaN(date.getTime()))
  const firstMemberDate =
    memberCreationDates.length > 0
      ? new Date(Math.min(...memberCreationDates.map((date) => date.getTime())))
      : null
  const activeYears = firstMemberDate ? Math.max(0, new Date().getFullYear() - firstMemberDate.getFullYear()) : 0

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Miembros</h1>
              <p className="text-gray-600 mt-2">Administra los miembros de la biblioteca</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/"
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Volver al Inicio
              </Link>
              <Link
                href="/members/new"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Agregar Miembro
              </Link>
            </div>
          </div>

          {error && <ErrorMessage message={error} className="mb-6" />}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner className="w-8 h-8 text-green-600" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay miembros registrados</h3>
              <p className="text-gray-600 mb-4">Comienza agregando el primer miembro a la biblioteca</p>
              <Link
                href="/members/new"
                className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Agregar Primer Miembro
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((member) => (
                <div key={member.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-semibold text-lg">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                        <p className="text-gray-600 text-sm">{member.email}</p>
                        {member.phone && <p className="text-gray-500 text-xs">{member.phone}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>
                        Registrado: {member.createdAt ? new Date(member.createdAt).toLocaleDateString("es-ES") : "Fecha no disponible"}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(member.id)}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {members.length > 0 && !isLoading && (
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{members.length}</div>
                  <div className="text-sm text-gray-600">Total de Miembros</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{membersWithPhone.length}</div>
                  <div className="text-sm text-gray-600">Con Teléfono</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{activeYears}</div>
                  <div className="text-sm text-gray-600">Años Activos</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
