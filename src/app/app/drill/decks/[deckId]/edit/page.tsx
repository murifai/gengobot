export default async function EditDeckPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = await params;
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Edit Deck</h1>
      <p className="text-muted-foreground">Deck ID: {deckId}</p>
      <p className="text-sm text-muted-foreground mt-2">Coming Soon</p>
    </div>
  );
}
