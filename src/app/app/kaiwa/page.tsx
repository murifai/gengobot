export default function KaiwaHubPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Kaiwa Hub</h1>
      <p className="text-muted-foreground mb-8">Practice Japanese conversation with AI</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">Ngobrol Bebas</h2>
          <p className="text-muted-foreground">Free conversation with your characters</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">Roleplay</h2>
          <p className="text-muted-foreground">Task-based conversation practice</p>
        </div>
      </div>
    </div>
  );
}
