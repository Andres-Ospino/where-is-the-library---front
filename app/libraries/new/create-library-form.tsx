"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { librariesApi, ApiError, authApi } from "@/lib/api"
import type { CreateLibraryDto } from "@/lib/types"
import { ErrorMessage } from "@/components/ui/error-message"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function CreateLibraryForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateLibraryDto>({
    name: "",
    description: "",
    address: "",
    openingHours: "",
  })

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const trimmedName = formData.name.trim()
      const trimmedAddress = formData.address.trim()
      const trimmedOpeningHours = formData.openingHours.trim()
      const trimmedDescription = formData.description?.trim()

      if (!trimmedName) {
        setError("El nombre es obligatorio")
        setIsSubmitting(false)
        return
      }

      if (!trimmedAddress) {
        setError("La dirección es obligatoria")
        setIsSubmitting(false)
        return
      }

      if (!trimmedOpeningHours) {
        setError("El horario de atención es obligatorio")
        setIsSubmitting(false)
        return
      }

      const payload: CreateLibraryDto = {
        name: trimmedName,
        address: trimmedAddress,
        openingHours: trimmedOpeningHours,
        ...(trimmedDescription && { description: trimmedDescription }),
      }

      await librariesApi.create(payload)
      router.push("/libraries")
      router.refresh()
    } catch (err) {
      console.error("Error creating library:", err)

      if (err instanceof ApiError && err.statusCode === 401) {
        authApi.clearToken()
        setError("Tu sesión ha expirado. Redirigiendo al inicio de sesión...")
        router.replace("/auth/login")
        return
      }

      const message = err instanceof Error ? err.message : "Error al crear la biblioteca"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid =
    formData.name.trim().length > 0 &&
    formData.address.trim().length > 0 &&
    formData.openingHours.trim().length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <ErrorMessage message={error} />}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nombre de la Biblioteca *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Ingresa el nombre de la biblioteca"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Descripción (Opcional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description ?? ""}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Describe brevemente los servicios o colecciones de la biblioteca"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
          Dirección *
        </label>
        <input
          id="address"
          name="address"
          type="text"
          required
          value={formData.address}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Ingresa la dirección completa"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="openingHours" className="block text-sm font-medium text-gray-700 mb-2">
          Horario de atención *
        </label>
        <input
          id="openingHours"
          name="openingHours"
          type="text"
          required
          value={formData.openingHours}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Ej. Lunes a viernes de 9:00 a 18:00"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner className="w-4 h-4" />
              Creando...
            </>
          ) : (
            "Crear Biblioteca"
          )}
        </button>
      </div>
    </form>
  )
}
