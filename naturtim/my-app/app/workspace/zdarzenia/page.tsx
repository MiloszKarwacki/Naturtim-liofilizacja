"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

interface AuditLog {
  id: number;
  timestamp: string;
  userId: number;
  userName: string;
  description: string;
  details: string | null;
}

interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

interface Filters {
  searchTerm: string;
  fromDate: string;
  toDate: string;
  sortDirection: "asc" | "desc";
}

export default function EventsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    pageSize: 20,
    pageCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    searchTerm: "",
    fromDate: "",
    toDate: "",
    sortDirection: "desc"
  });

  // Funkcja do ładowania danych
  const loadData = async (page = 1) => {
    setLoading(true);

    // Przygotuj parametry zapytania
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("sortDirection", filters.sortDirection);

    if (filters.searchTerm) params.append("searchTerm", filters.searchTerm);
    if (filters.fromDate) params.append("fromDate", filters.fromDate);
    if (filters.toDate) params.append("toDate", filters.toDate);

    try {
      const response = await fetch(`/api/audit-log?${params.toString()}`);
      const result = await response.json();

      if (result.data) {
        setLogs(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Błąd podczas pobierania logów:", error);
    } finally {
      setLoading(false);
    }
  };

  // Efekt do pobierania danych przy pierwszym renderze
  useEffect(() => {
    loadData();
  }, []);

  // Obsługa zmiany strony
  const changePage = (newPage: number) => {
    loadData(newPage);
  };

  // Obsługa filtrowania
  const handleFilter = () => {
    loadData(1); // Reset do pierwszej strony przy filtrowaniu
  };

  // Zmiana kierunku sortowania
  const toggleSortDirection = () => {
    const newDirection = filters.sortDirection === "desc" ? "asc" : "desc";
    setFilters({ ...filters, sortDirection: newDirection });
    loadData(1); // Reset do pierwszej strony przy zmianie sortowania
  };

  // Czyszczenie filtrów
  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      fromDate: "",
      toDate: "",
      sortDirection: "desc"
    });
    loadData(1);
  };

  // Formatowanie daty
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd.MM.yyyy HH:mm:ss", { locale: pl });
    } catch (e) {
      return dateStr;
    }
  };

  // Renderowanie detali
  const renderDetails = (details: string | null) => {
    if (!details) return null;

    try {
      const parsed = JSON.parse(details);
      return (
        <div className="text-xs text-gray-500">
          {Object.entries(parsed).map(([key, value]) =>
            <div key={key}>
              {key}: {JSON.stringify(value)}
            </div>
          )}
        </div>
      );
    } catch (e) {
      return (
        <div className="text-xs text-gray-500">
          {details}
        </div>
      );
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Dziennik zdarzeń systemowych</h1>

      {/* Filtry */}
      <div className="flex flex-wrap gap-3 p-4 border rounded-md bg-gray-50">
        <div className="flex-1 min-w-[300px]">
          <label className="text-sm font-medium mb-1 block">Szukaj</label>
          <Input
            placeholder="Wpisz nazwę użytkownika lub numer partii"
            value={filters.searchTerm}
            onChange={e =>
              setFilters({ ...filters, searchTerm: e.target.value })}
          />
        </div>

        <div className="min-w-[170px]">
          <label className="text-sm font-medium mb-1 block">Data od</label>
          <Input
            type="date"
            value={filters.fromDate}
            onChange={e => setFilters({ ...filters, fromDate: e.target.value })}
          />
        </div>

        <div className="min-w-[170px]">
          <label className="text-sm font-medium mb-1 block">Data do</label>
          <Input
            type="date"
            value={filters.toDate}
            onChange={e => setFilters({ ...filters, toDate: e.target.value })}
          />
        </div>

        <div className="flex gap-2 items-end">
          <Button onClick={handleFilter} className="mb-0">
            Filtruj
          </Button>

          <Button variant="outline" onClick={clearFilters} className="mb-0">
            Wyczyść
          </Button>
        </div>
      </div>

      {/* Tabela logów */}
      <div className="border rounded-md">
        <Table>
          <TableCaption>Lista zdarzeń systemowych</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead
                className="w-[220px] pr-12 cursor-pointer hover:bg-gray-100"
                onClick={toggleSortDirection}
              >
                Data i czas
                {filters.sortDirection === "desc"
                  ? <span className="ml-2">↓</span>
                  : <span className="ml-2">↑</span>}
              </TableHead>
              <TableHead className="w-[240px] pr-12">Użytkownik</TableHead>
              <TableHead className="pl-4">Opis działania</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    Ładowanie danych...
                  </TableCell>
                </TableRow>
              : logs.length === 0
                ? <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      Brak zdarzeń spełniających kryteria
                    </TableCell>
                  </TableRow>
                : logs.map(log =>
                    <TableRow key={log.id}>
                      <TableCell className="font-mono pr-12">
                        {formatDate(log.timestamp)}
                      </TableCell>
                      <TableCell className="pr-12">
                        {log.userName}
                      </TableCell>
                      <TableCell className="pl-4">
                        {log.description}
                        {renderDetails(log.details)}
                      </TableCell>
                    </TableRow>
                  )}
          </TableBody>
        </Table>
      </div>

      {/* Paginacja */}
      {pagination.pageCount > 1 &&
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => changePage(Math.max(1, pagination.page - 1))}
                className={
                  pagination.page <= 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {Array.from({ length: pagination.pageCount }, (_, i) => i + 1)
              .filter(
                page =>
                  page === 1 ||
                  page === pagination.pageCount ||
                  Math.abs(page - pagination.page) <= 1
              )
              .map((page, i, array) => {
                // Dodaj wielokropek jeśli są przerwy w numeracji
                if (i > 0 && array[i - 1] !== page - 1) {
                  return (
                    <PaginationItem key={`ellipsis-${page}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === pagination.page}
                      onClick={() => changePage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  changePage(
                    Math.min(pagination.pageCount, pagination.page + 1)
                  )}
                className={
                  pagination.page >= pagination.pageCount
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>}
    </div>
  );
}
