export const dynamic = 'force-dynamic';

export default function Custom500() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-4xl font-bold text-foreground">500</h1>
        <h2 className="text-2xl font-bold text-foreground">Server Error</h2>
        <p className="text-muted-foreground">
          An internal server error occurred. Please try again later.
        </p>
      </div>
    </div>
  );
}
