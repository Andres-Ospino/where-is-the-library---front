"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { librariesApi, ApiError, authApi } from "@/lib/api"
import type { CreateLibraryDto, Library } from "@/lib/types"
import { ErrorMessage } from "@/components/ui/error-message"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface EditLibraryFormProps {
  libraryId: string
}

export function EditLibraryForm({ libraryId }: EditLibraryFormProps) {
  const router = useRouter()
  const [library, setLibrary] = useState<Library | null>(null)
  const [formData, setFormData] = useState<CreateLibraryDto>({
    name: "",
    description: "",
    location: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    const loadLibrary = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await librariesApi.getById(libraryId)
        if (!isActive) return

        setLibrary(response)
        setFormData({
          name: response.name ?? "",
          description: response.description ?? "",
          location: response.location ?? "",
        })
      } catch (err) {
        if (!isActive) return

        console.error("Error loading library:", err)

        if (err instanceof ApiError && err.statusCode === 401) {
          authApi.clearToken()
          setError("Tu sesión ha expirado. Redirigiendo al inicio de sesión...")
          router.replace("/auth/login")
          return
        }

        const message = err instanceof Error ? err.message : "No se pudo cargar la biblioteca"
        setError(message)
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadLibrary()

    return () => {
      isActive = false
    }
  }, [libraryId, router])

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

    if (isSaving) {
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const payload: Partial<CreateLibraryDto> = {
        name: formData.name.trim(),
        ...(formData.description?.trim() && { description: formData.description.trim() }),
        ...(formData.location?.trim() && { location: formData.location.trim() }),
      }

      if (!payload.name) {
        setError("El nombre es obligatorio")
        setIsSaving(false)
        return
      }

      await librariesApi.update(libraryId, payload)
      router.push("/libraries")
      router.refresh()
    } catch (err) {
      console.error("Error updating library:", err)

      if (err instanceof ApiError && err.statusCode === 401) {
        authApi.clearToken()
        setError("Tu sesión ha expirado. Redirigiendo al inicio de sesión...")
        router.replace("/auth/login")
        return
      }

      const message = err instanceof Error ? err.message : "Error al actualizar la biblioteca"
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner className="w-6 h-6 text-purple-600" />
      </div>
    )
  }

  if (!library) {
    return <ErrorMessage message={error ?? "Biblioteca no encontrada"} />
  }

  const isFormValid = formData.name.trim().length > 0 && formData.location.trim().length > 0

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
          disabled={isSaving}
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
          disabled={isSaving}
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
          Ubicación *
        </label>
        <input
          id="location"
          name="location"
          type="text"
          required
          value={formData.location ?? ""}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Ingresa la dirección o ciudad"
          disabled={isSaving}
        />
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
          className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
