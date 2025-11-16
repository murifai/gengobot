export default async function TaskPreStudyPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Task Pre-Study</h1>
      <p className="text-muted-foreground">Task ID: {taskId}</p>
      <p className="text-sm text-muted-foreground mt-2">Coming Soon</p>
    </div>
  );
}
