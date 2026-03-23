// src/components/ui/Pagination.tsx

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon1'
import ArrowRightIcon from '@/components/icons/ArrowRightIcon1'

interface Props {
  currentPage: number
  totalPages: number
}

export default function Pagination({ currentPage, totalPages }: Props): JSX.Element {
  const router = useRouter()
  const searchParams = useSearchParams()

  const onPageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`/search?${params.toString()}`)
  }

  const getPages = (): (number | '...')[] => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | '...')[] = [1, 2]
    if (currentPage > 4) pages.push('...')
    if (currentPage > 2 && currentPage < totalPages - 1) pages.push(currentPage)
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages - 1, totalPages)
    return [...new Set(pages)]
  }

  return (
    <footer className="self-stretch py-6 bg-white flex flex-col justify-center items-center gap-2.5">
      <nav
        aria-label="Pagination"
        className="w-96 bg-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-start overflow-hidden"
      >
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="flex-1 h-10 px-4 py-3 rounded-[1px] border-r border-gray-200 flex justify-center items-center gap-1.5 disabled:opacity-40"
        >
          <span className="size-4 relative overflow-hidden flex items-center justify-center">
            <ArrowLeftIcon className="w-2.5 h-2 text-neutral-500" />
          </span>
          <span className="text-neutral-500 text-sm font-medium font-['Inter'] leading-5">Prev</span>
        </button>

        {getPages().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            aria-label={typeof page === 'number' ? `Page ${page}` : 'More pages'}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`size-10 rounded-[1px] border-r border-gray-200 flex justify-center items-center text-sm font-medium font-['Inter'] leading-5 ${
              page === currentPage ? 'text-lime-700' : 'text-neutral-500'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="flex-1 h-10 px-4 py-3 rounded-[1px] outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-center items-center gap-1.5 disabled:opacity-40"
        >
          <span className="text-neutral-500 text-sm font-medium font-['Inter'] leading-5">Next</span>
          <span className="size-4 relative overflow-hidden flex items-center justify-center">
            <ArrowRightIcon className="w-2.5 h-2 text-neutral-500" />
          </span>
        </button>
      </nav>
    </footer>
  )
}