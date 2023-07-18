import { TodoLibraryMembers } from "./todo.schema.js";

export const TodoLibrary$getId: TodoLibraryMembers["getId"] = (todo) => todo.id;

export const TodoLibrary$getDescription: TodoLibraryMembers["getDescription"] =
  (todo) => todo.description;

export const TodoLibrary$getCreatedAt: TodoLibraryMembers["getCreatedAt"] = (
  todo
) => "Added on " + todo.createdAt.toLocaleString();

export const TodoLibrary$getCompleted: TodoLibraryMembers["getCompleted"] = (
  todo
) => todo.completed;
