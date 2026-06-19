import { KanbanBoard } from "@/components/kanban-board";
import { Layout } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col h-screen bg-background overflow-hidden">
      <header className="h-16 flex items-center px-6 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <Layout className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Task Management</h1>
        </div>
      </header>
      
      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>
    </main>
  );
}
