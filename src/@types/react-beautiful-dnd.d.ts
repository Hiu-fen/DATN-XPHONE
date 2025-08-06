declare module "react-beautiful-dnd" {
  import * as React from "react";

  export interface DropResult {
    draggableId: string;
    type: string;
    source: {
      index: number;
      droppableId: string;
    };
    destination: {
      index: number;
      droppableId: string;
    } | null;
    reason: "DROP" | "CANCEL";
    mode: "FLUID" | "SNAP";
    combine?: {
      draggableId: string;
      droppableId: string;
    };
  }

  export interface DraggableProvided {
    innerRef: (element?: HTMLElement | null) => any;
    draggableProps: any;
    dragHandleProps: any;
  }

  export interface DraggableStateSnapshot {
    isDragging: boolean;
    draggingOver?: string;
  }

  export interface DroppableProvided {
    innerRef: (element?: HTMLElement | null) => any;
    droppableProps: any;
    placeholder?: React.ReactElement<any> | null;
  }

  export class DragDropContext extends React.Component<{
    onDragEnd: (result: DropResult) => void;
    children?: React.ReactNode;
  }> {}

  export class Droppable extends React.Component<{
    droppableId: string;
    children: (
      provided: DroppableProvided,
      snapshot: { isDraggingOver: boolean }
    ) => React.ReactNode;
  }> {}

  export class Draggable extends React.Component<{
    draggableId: string;
    index: number;
    children: (
      provided: DraggableProvided,
      snapshot: DraggableStateSnapshot
    ) => React.ReactNode;
  }> {}
}
