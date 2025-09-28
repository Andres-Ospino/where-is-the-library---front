import { Suspense } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { LoansPageContent } from "./loans-page-content"

function LoansPageFallback() {
  return (
    <div className="flex justify-center py-12">
      <LoadingSpinner className="w-8 h-8 text-purple-600" />
    </div>
  )
}

export default function LoansPage() {
  return (
    <Suspense fallback={<LoansPageFallback />}>
      <LoansPageContent />
    </Suspense>
  )
}
