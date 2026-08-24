import {
  useMemo,
  useState,
} from "react";

export function usePagination<T>(
  items: T[],
  initialPageSize = 10
) {
  const [
    requestedPage,
    setRequestedPage,
  ] = useState(1);

  const [
    pageSize,
    setPageSizeState,
  ] = useState(initialPageSize);

  const totalItems = items.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / pageSize)
  );

  const currentPage = Math.min(
    Math.max(requestedPage, 1),
    totalPages
  );

  const paginatedItems =
    useMemo(() => {
      const firstItemIndex =
        (currentPage - 1) *
        pageSize;

      return items.slice(
        firstItemIndex,
        firstItemIndex + pageSize
      );
    }, [
      items,
      currentPage,
      pageSize,
    ]);

  const setCurrentPage = (
    nextPage: number
  ) => {
    setRequestedPage(
      Math.min(
        Math.max(nextPage, 1),
        totalPages
      )
    );
  };

  const setPageSize = (
    nextPageSize: number
  ) => {
    setPageSizeState(nextPageSize);
    setRequestedPage(1);
  };

  const resetPage = () => {
    setRequestedPage(1);
  };

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
    setCurrentPage,
    setPageSize,
    resetPage,
  };
}