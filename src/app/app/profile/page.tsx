export default function ProfileHubPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Profile Hub</h1>
      <p className="text-muted-foreground mb-8">Manage your profile and settings</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Settings</h2>
          <p className="text-sm text-muted-foreground">Account settings</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Progress</h2>
          <p className="text-sm text-muted-foreground">Your learning progress</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Characters</h2>
          <p className="text-sm text-muted-foreground">Manage characters</p>
        </div>
      </div>
    </div>
  );
}
