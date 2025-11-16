export default async function DrillSessionPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = await params;
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Drill Session</h1>
      <p className="text-muted-foreground">Deck ID: {deckId}</p>
      <p className="text-sm text-muted-foreground mt-2">Active study session - Coming Soon</p>
    </div>
  );
}
