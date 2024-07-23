import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";

interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PaginationComponent({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationComponentProps) {
  const paginationButtons = () => {
    const buttons = [];

    const visiblePages = 5;
    let firstPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    let lastPage = Math.min(totalPages, firstPage + visiblePages - 1);

    if (lastPage - firstPage + 1 < visiblePages) {
      firstPage = Math.max(1, lastPage - visiblePages + 1);
    }

    for (let page = firstPage; page <= lastPage; page++) {
      buttons.push(
        <PaginationItem key={page} className="h-8 w-8">
          <PaginationLink
            onClick={() => onPageChange(page)}
            className={page === currentPage ? "bg-blue-500 text-white" : ""}
          >
            {page}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return buttons;
  };

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem key="prev-10" className="h-8 w-8">
          <PaginationLink
            disabled={currentPage <= 10}
            onClick={() => onPageChange(Math.max(1, currentPage - 10))}
          >
            <ChevronsLeftIcon className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>
        <PaginationItem key="prev" className="h-8 w-8">
          <PaginationPrevious
            disabled={currentPage <= 1}
            aria-disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          />
        </PaginationItem>
        {paginationButtons()}
        <PaginationItem key="next" className="h-8 w-8">
          <PaginationNext
            disabled={currentPage >= totalPages}
            aria-disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          />
        </PaginationItem>
        <PaginationItem key="next-10" className="h-8 w-8">
          <PaginationLink
            disabled={currentPage + 5 > totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 10))}
          >
            <ChevronsRightIcon className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
