import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRightIcon,
} from "lucide-react";

interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
}

export default function PaginationComponent({
  currentPage,
  totalPages,
}: PaginationComponentProps) {
  const paginationButtons = () => {
    const buttons = [];

    const visiblePages = 5;
    let firstPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const lastPage = Math.min(totalPages, firstPage + visiblePages - 1);

    if (lastPage - firstPage + 1 < visiblePages) {
      firstPage = Math.max(1, lastPage - visiblePages + 1);
    }

    for (let page = firstPage; page <= lastPage; page++) {
      buttons.push(
        <Link key={page} href={`/categories?page=${page}`}>
          <PaginationItem>
            <PaginationLink className="h-8 w-8" isActive={page === currentPage}>
              {page}
            </PaginationLink>
          </PaginationItem>
        </Link>,
      );
    }

    return buttons;
  };

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <Link
          key="prev-10"
          href={`/categories?page=${Math.max(1, currentPage - 10)}`}
        >
          <PaginationItem className="h-8 w-8">
            <PaginationLink className="h-8 w-8" disabled={currentPage <= 10}>
              <ChevronsLeft className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>
        </Link>
        <Link key="prev" href={`/categories?page=${currentPage - 1}`}>
          <PaginationItem className="h-8 w-8">
            <PaginationLink
              disabled={currentPage <= 1}
              aria-disabled={currentPage <= 1}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>
        </Link>
        {paginationButtons()}
        <Link key="next" href={`/categories?page=${currentPage + 1}`}>
          <PaginationItem className="h-8 w-8">
            <PaginationLink
              className="h-8 w-8"
              disabled={currentPage >= totalPages}
              aria-disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>
        </Link>
        <Link
          key="next-10"
          href={`/categories?page=${Math.min(totalPages, currentPage + 10)}`}
        >
          <PaginationItem className="h-8 w-8">
            <PaginationLink
              className="h-8 w-8"
              disabled={currentPage + 5 > totalPages}
            >
              <ChevronsRightIcon className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>
        </Link>
      </PaginationContent>
    </Pagination>
  );
}
