"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { membersApi } from "@/lib/api"
import type { CreateMemberDto } from "@/lib/types"
import { ErrorMessage } from "@/components/ui/error-message"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function CreateMemberForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateMemberDto>({
    name: "",
    email: "",
    phone: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        name: formData.name.trim(),
        email: formData.email.trim(),
        ...(formData.phone?.trim() && { phone: formData.phone.trim() }),
      }

      await membersApi.create(dataToSend)
      router.push("/members")
      router.refresh()
    } catch (err: any) {
      console.error("Error creating member:", err)
      setError(err.message || "Error al crear el miembro")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = formData.name.trim() && formData.email.trim()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <ErrorMessage message={error} />}

      {/* Name Field */}
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
          disabled={isLoading}
        />
      </div>

      {/* Email Field */}
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
          disabled={isLoading}
        />
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Teléfono (Opcional)
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="Ingresa el número de teléfono"
          disabled={isLoading}
        />
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
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <LoadingSpinner className="w-4 h-4" />
              Creando...
            </>
          ) : (
            "Crear Miembro"
          )}
        </button>
      </div>
    </form>
  )
}
