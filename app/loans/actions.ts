"use server"

import { loansApi } from "@/lib/api"
import { revalidatePath } from "next/cache"

export async function returnLoan(loanId: string) {
  try {
    await loansApi.returnLoan(loanId)
    revalidatePath("/loans")
    return { success: true }
  } catch (error: any) {
    console.error("Error returning loan:", error)
    return { success: false, error: error.message }
  }
}

export async function createLoan(bookId: string, memberId: string) {
  try {
    await loansApi.create({ bookId, memberId })
    revalidatePath("/loans")
    return { success: true }
  } catch (error: any) {
    console.error("Error creating loan:", error)
    return { success: false, error: error.message }
  }
}
