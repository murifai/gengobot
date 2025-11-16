export default async function EditCharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Edit Character</h1>
      <p className="text-muted-foreground">Character ID: {id}</p>
      <p className="text-sm text-muted-foreground mt-2">Coming Soon</p>
    </div>
  );
}
