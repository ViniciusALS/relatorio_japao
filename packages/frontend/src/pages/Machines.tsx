/**
 * Página de listagem de máquinas da JRC Brasil.
 *
 * Exibe tabela paginada com dados vindos da API via useMachines hook.
 * Inclui estados de carregamento, erro com retry e mensagem de lista vazia.
 */
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { useMachines } from "@/hooks/useMachines";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, Monitor, Laptop, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PAGE_SIZE = 20;

/** Ícone booleano para flags de criptografia e antivírus. */
const BoolIcon = ({ value }: { value: boolean }) =>
  value ? <Check className="w-4 h-4 text-status-active" /> : <X className="w-4 h-4 text-destructive" />;

const Machines = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useMachines(page);
  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0;

  return (
    <AppLayout>
      <PageHeader title="Máquinas" subtitle="Inventário de computadores e notebooks" />

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
            <p className="text-sm text-muted-foreground mb-3">Erro ao carregar máquinas.</p>
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
                  <TableHead>Hostname</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Service Tag</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead className="text-center">Criptografia</TableHead>
                  <TableHead className="text-center">Antivírus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.results.map(m => (
                  <TableRow key={m.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium font-mono text-xs">{m.hostname}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        {m.machineType === "notebook" ? <Laptop className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                        {m.machineType === "notebook" ? "Notebook" : "Desktop"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{m.model}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{m.serviceTag}</TableCell>
                    <TableCell className="font-mono text-xs">{m.ip}</TableCell>
                    <TableCell>{m.collaboratorName}</TableCell>
                    <TableCell className="text-center"><BoolIcon value={m.encrypted} /></TableCell>
                    <TableCell className="text-center"><BoolIcon value={m.antivirus} /></TableCell>
                  </TableRow>
                ))}
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

export default Machines;
