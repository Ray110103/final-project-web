"use client"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { PaginationMeta } from "@/types/pagination"

interface PaginationSectionProps {
  meta: PaginationMeta
  setPage: (page: number) => void
}

const PaginationSection = ({ meta, setPage }: PaginationSectionProps) => {
  const { page, take, total } = meta
  const totalPages = Math.ceil(total / take)

  // Don't render pagination if there's only one page or no data
  if (totalPages <= 1) return null

  const handlePrev = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  const handleNext = () => {
    if (page < totalPages) {
      setPage(page + 1)
    }
  }

  const handlePageClick = (pageNumber: number) => {
    setPage(pageNumber)
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (page > 3) {
        pages.push("ellipsis-start")
      }

      // Show pages around current page
      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i)
        }
      }

      if (page < totalPages - 2) {
        pages.push("ellipsis-end")
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <Pagination>
      <PaginationContent className="gap-2">
        <PaginationItem>
          <PaginationPrevious
            onClick={handlePrev}
            className="text-white bg-zinc-900 border-zinc-700 hover:bg-orange-500/20 hover:text-orange-400 hover:border-orange-400"
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink className="bg-orange-500 text-white border-orange-500 hover:bg-orange-600">
            {page}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            onClick={handleNext}
            className="text-white bg-zinc-900 border-zinc-700 hover:bg-orange-500/20 hover:text-orange-400 hover:border-orange-400"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default PaginationSection
