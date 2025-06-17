// Task.tsx
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case 'high': return 'bg-red-500';
    case 'medium': return 'bg-yellow-400';
    case 'low': return 'bg-green-400';
    default: return 'bg-gray-400';
  }
};

export default function Task({ task }: { task: any }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.tid.toString(),
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm cursor-grab hover:shadow-md transition-shadow"
    >
      <div className="font-semibold text-gray-800 text-md mb-1">{task.title}</div>
      <div className="text-sm text-gray-600">📝 Description: {task.description ? task.description : 'no description' } </div>
      <div className="text-sm text-gray-600">📅 Due: {task.due_date}</div>
      <div className="text-sm text-gray-600 mt-1">
        ⚡ Priority:{' '}
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-white text-xs ${getPriorityColor(
            task.priority
          )}`}
        >
          {task.priority}
        </span>
      </div>
    </div>
  );
}