"use client";

import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Plus, MoreHorizontal, GripVertical } from "lucide-react";
import { BoardData, Task } from "@/types/kanban";

const initialData: BoardData = {
  tasks: {
    "task-1": { id: "task-1", title: "Design Landing Page", description: "Create mockups for the new landing page." },
    "task-2": { id: "task-2", title: "Setup Next.js project", description: "Initialize the project with App Router and Tailwind." },
    "task-3": { id: "task-3", title: "API Integration", description: "Connect frontend to backend endpoints." },
    "task-4": { id: "task-4", title: "User Testing", description: "Conduct user testing on staging." },
  },
  columns: {
    "col-1": {
      id: "col-1",
      title: "To Do",
      taskIds: ["task-1", "task-2"],
    },
    "col-2": {
      id: "col-2",
      title: "In Progress",
      taskIds: ["task-3"],
    },
    "col-3": {
      id: "col-3",
      title: "Done",
      taskIds: ["task-4"],
    },
  },
  columnOrder: ["col-1", "col-2", "col-3"],
};

export function KanbanBoard() {
  const [data, setData] = useState<BoardData>(initialData);
  const [isMounted, setIsMounted] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [addingToCol, setAddingToCol] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="p-8">Loading board...</div>;

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startColumn = data.columns[source.droppableId];
    const finishColumn = data.columns[destination.droppableId];

    // Moving within the same column
    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...startColumn, taskIds: newTaskIds };

      setData({
        ...data,
        columns: { ...data.columns, [newColumn.id]: newColumn },
      });
      return;
    }

    // Moving from one column to another
    const startTaskIds = Array.from(startColumn.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = { ...startColumn, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finishColumn.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finishColumn, taskIds: finishTaskIds };

    setData({
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    });
  };

  const handleAddTask = (columnId: string) => {
    if (!newTaskTitle.trim()) return;

    const newTaskId = `task-${Date.now()}`;
    const newTask: Task = { id: newTaskId, title: newTaskTitle };

    const column = data.columns[columnId];
    const newTaskIds = [...column.taskIds, newTaskId];

    setData({
      ...data,
      tasks: { ...data.tasks, [newTaskId]: newTask },
      columns: {
        ...data.columns,
        [columnId]: { ...column, taskIds: newTaskIds },
      },
    });

    setNewTaskTitle("");
    setAddingToCol(null);
  };

  return (
    <div className="flex flex-1 h-full overflow-x-auto p-6 items-start gap-6">
      <DragDropContext onDragEnd={onDragEnd}>
        {data.columnOrder.map((columnId) => {
          const column = data.columns[columnId];
          const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

          return (
            <div key={column.id} className="flex flex-col bg-column-bg rounded-xl w-80 min-w-80 max-h-full">
              <div className="flex items-center justify-between p-4 pb-2">
                <h2 className="font-semibold text-foreground text-sm flex items-center gap-2">
                  {column.title}
                  <span className="bg-border text-xs px-2 py-0.5 rounded-full text-card-foreground">
                    {tasks.length}
                  </span>
                </h2>
                <button className="text-foreground hover:bg-border p-1 rounded-md transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 overflow-y-auto p-3 space-y-3 min-h-[150px] transition-colors ${
                      snapshot.isDraggingOver ? "bg-primary/5" : ""
                    }`}
                  >
                    {tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-card p-4 rounded-lg shadow-sm border border-border group ${
                              snapshot.isDragging ? "shadow-md ring-2 ring-primary" : "hover:border-primary/50"
                            }`}
                            style={{ ...provided.draggableProps.style }}
                          >
                            <div className="flex items-start justify-between">
                              <p className="text-sm font-medium text-foreground leading-snug">
                                {task.title}
                              </p>
                              <button className="text-border group-hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                <GripVertical className="w-4 h-4" />
                              </button>
                            </div>
                            {task.description && (
                              <p className="text-xs text-foreground/70 mt-2 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    {addingToCol === column.id ? (
                      <div className="mt-3">
                        <input
                          autoFocus
                          type="text"
                          className="w-full bg-card border border-primary rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-primary shadow-sm"
                          placeholder="What needs to be done?"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddTask(column.id);
                            if (e.key === 'Escape') setAddingToCol(null);
                          }}
                          onBlur={() => handleAddTask(column.id)}
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingToCol(column.id)}
                        className="flex items-center gap-2 text-foreground/70 hover:text-foreground hover:bg-border w-full p-2 mt-2 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Add Task
                      </button>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </DragDropContext>
    </div>
  );
}
