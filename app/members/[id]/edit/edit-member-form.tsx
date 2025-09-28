"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { membersApi, ApiError, authApi } from "@/lib/api"
import type { CreateMemberDto, Member } from "@/lib/types"
import { ErrorMessage } from "@/components/ui/error-message"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface EditMemberFormProps {
  memberId: string
}

export function EditMemberForm({ memberId }: EditMemberFormProps) {
  const router = useRouter()
  const [member, setMember] = useState<Member | null>(null)
  const [formData, setFormData] = useState<CreateMemberDto>({
    name: "",
    email: "",
    phone: "",
  })
  const [isLoadingMember, setIsLoadingMember] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    const loadMember = async () => {
      setIsLoadingMember(true)
      setError(null)

      try {
        const response = await membersApi.getById(memberId)
        if (!isActive) return

        setMember(response)
        setFormData({
          name: response.name ?? "",
          email: response.email ?? "",
          phone: response.phone ?? "",
        })
      } catch (err) {
        if (!isActive) return

        console.error("Error loading member:", err)

        if (err instanceof ApiError && err.statusCode === 401) {
          authApi.clearToken()
          setError("Tu sesión ha expirado. Redirigiendo al inicio de sesión...")
          router.replace("/auth/login")
          return
        }

        const message = err instanceof Error ? err.message : "No se pudo cargar el miembro"
        setError(message)
      } finally {
        if (isActive) {
          setIsLoadingMember(false)
        }
      }
    }

    void loadMember()

    return () => {
      isActive = false
    }
  }, [memberId, router])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      const trimmedName = formData.name.trim()
      const trimmedEmail = formData.email.trim()
      const trimmedPhone = formData.phone?.trim() ?? ""

      if (!trimmedName) {
        setError("El nombre es obligatorio")
        setIsSaving(false)
        return
      }

      if (!trimmedEmail) {
        setError("El correo electrónico es obligatorio")
        setIsSaving(false)
        return
      }

      const payload: Partial<CreateMemberDto> = {
        name: trimmedName,
        email: trimmedEmail,
      }

      if (trimmedPhone) {
        payload.phone = trimmedPhone
      }

      await membersApi.update(memberId, payload)
      router.push("/members")
      router.refresh()
    } catch (err) {
      console.error("Error updating member:", err)

      if (err instanceof ApiError && err.statusCode === 401) {
        authApi.clearToken()
        setError("Tu sesión ha expirado. Redirigiendo al inicio de sesión...")
        router.replace("/auth/login")
        return
      }

      const message = err instanceof Error ? err.message : "Error al actualizar el miembro"
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoadingMember) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner className="w-6 h-6 text-green-600" />
      </div>
    )
  }

  if (!member) {
    return <ErrorMessage message={error ?? "Miembro no encontrado"} />
  }

  const isFormValid = formData.name.trim().length > 0 && formData.email.trim().length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <ErrorMessage message={error} />}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nombre Completo *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="Ingresa el nombre completo"
          disabled={isSaving}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Correo Electrónico *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="ejemplo@correo.com"
          disabled={isSaving}
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Teléfono (Opcional)
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone ?? ""}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="Ingresa el número de teléfono"
          disabled={isSaving}
        />
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.push("/members")}
          className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
          disabled={isSaving}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!isFormValid || isSaving}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
