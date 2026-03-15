/**
 * Página de listagem de colaboradores da JRC Brasil.
 *
 * Exibe tabela paginada com dados vindos da API via useCollaborators hook.
 * Inclui estados de carregamento, erro com retry e mensagem de lista vazia.
 */
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { useCollaborators } from "@/hooks/useCollaborators";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, AlertCircle } from "lucide-react";

const PAGE_SIZE = 20;

/** Ícone booleano para flags de acesso. */
const BoolIcon = ({ value }: { value: boolean }) =>
  value ? <Check className="w-4 h-4 text-status-active" /> : <X className="w-4 h-4 text-status-inactive" />;

const Collaborators = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useCollaborators(page);
  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0;

  return (
    <AppLayout>
      <PageHeader title="Colaboradores" subtitle="Cadastro de funcionários da JRC Brasil" />

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
            <p className="text-sm text-muted-foreground mb-3">Erro ao carregar colaboradores.</p>
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
                  <TableHead>Nome</TableHead>
                  <TableHead>Domínio</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Servidor</TableHead>
                  <TableHead className="text-center">ERP</TableHead>
                  <TableHead className="text-center">Internet</TableHead>
                  <TableHead className="text-center">Celular</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.results.map(c => (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{c.domainUser}</TableCell>
                    <TableCell>{c.department}</TableCell>
                    <TableCell><StatusBadge status={c.status ? "active" : "inactive"} /></TableCell>
                    <TableCell className="text-center"><BoolIcon value={c.hasServerAccess} /></TableCell>
                    <TableCell className="text-center"><BoolIcon value={c.hasErpAccess} /></TableCell>
                    <TableCell className="text-center"><BoolIcon value={c.hasInternetAccess} /></TableCell>
                    <TableCell className="text-center"><BoolIcon value={c.hasCellphone} /></TableCell>
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

export default Collaborators;
