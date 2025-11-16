export default async function TaskAttemptPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Task Attempt</h1>
      <p className="text-muted-foreground">Task ID: {taskId}</p>
      <p className="text-sm text-muted-foreground mt-2">Active session - Coming Soon</p>
    </div>
  );
}
