import { metadata } from "@/app/layout";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PaginationMeta } from "@/types/pagination";

interface PaginationServiceProps {
  meta: PaginationMeta;
  setPage: (page: number) => void;
}

const PaginationSection = ({meta, setPage} : PaginationServiceProps) => {
  const { page, take, total } = meta;

  const handlePrev = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  const handleNext = () => {
    const totalPages = Math.ceil(total / take);
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={handlePrev} />
        </PaginationItem>

        <PaginationItem>
          <PaginationLink>{page}</PaginationLink>
        </PaginationItem>

        <PaginationItem>
          <PaginationNext onClick={handleNext} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationSection;
