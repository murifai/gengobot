export const dynamic = 'force-dynamic';

export default function Custom404() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <h2 className="text-2xl font-bold text-foreground">Page Not Found</h2>
        <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      </div>
    </div>
  );
}
