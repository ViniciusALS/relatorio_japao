/**
 * Página inicial (fallback) da aplicação.
 *
 * Exibida quando nenhuma rota específica é correspondida na raiz.
 * Redireciona para /dashboard em uso normal via rota configurada.
 *
 * @returns {JSX.Element} Página de boas-vindas centralizada.
 */
const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold">Welcome to Your Blank App</h1>
        <p className="text-sm text-muted-foreground">Start building your amazing project here!</p>
      </div>
    </div>
  );
};

export default Index;
