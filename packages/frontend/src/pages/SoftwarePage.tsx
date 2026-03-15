/**
 * Página de listagem de software da JRC Brasil.
 *
 * Exibe tabela paginada com dados vindos da API via useSoftware hook.
 * Inclui barra de uso de licenças, estados de carregamento e erro.
 */
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { useSoftware } from "@/hooks/useSoftware";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";

const PAGE_SIZE = 20;

const typeLabels: Record<string, string> = {
  perpetual: "Perpétua",
  subscription: "Assinatura",
  oem: "OEM",
};

const SoftwarePage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useSoftware(page);
  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0;

  return (
    <AppLayout>
      <PageHeader title="Software" subtitle="Controle de licenças de software" />

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading && (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        {isError && (
          <div className="p-8 text-center">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">Erro ao carregar software.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Tentar novamente</Button>
          </div>
        )}

        {data && data.results.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">Nenhum registro encontrado.</p>
          </div>
        )}

        {data && data.results.length > 0 && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Software</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Uso</TableHead>
                  <TableHead>Expiração</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.results.map(s => {
                  const usage = Math.round((s.inUse / s.quantity) * 100);
                  return (
                    <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <p className="font-medium">{s.softwareName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{s.licenseKey}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{typeLabels[s.licenseType]}</Badge>
                      </TableCell>
                      <TableCell className="w-48">
                        <div className="flex items-center gap-3">
                          <Progress value={usage} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {s.inUse}/{s.quantity}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.expiresAt || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <nav aria-label="Paginação" className="flex justify-center gap-1 p-4 border-t border-border">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    className={`px-3 py-1 text-sm border rounded transition-colors ${
                      page === i + 1
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setPage(i + 1)}
                    aria-label={`Ir para página ${i + 1}`}
                    aria-current={page === i + 1 ? "page" : undefined}
                  >
                    {i + 1}
                  </button>
                ))}
              </nav>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default SoftwarePage;
