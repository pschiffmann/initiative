import { useEffect } from "react";

export interface CommandStream<T = void> {
  listen(onRequest: Listener<T>): Unsubscribe;
}

export type Listener<T> = (value: T) => boolean;
export type Unsubscribe = () => void;

export class CommandController<T> implements CommandStream<T> {
  #listeners = new Set<Listener<T>>();

  get hasListeners(): boolean {
    return this.#listeners.size !== 0;
  }

  listen(listener: Listener<T>): Unsubscribe {
    if (this.#listeners.has(listener)) {
      throw new Error(
        "'listener' is already registered with this CommandStream."
      );
    }
    this.#listeners.add(listener);

    let listeners: Set<Listener<T>> | null = this.#listeners;
    return () => {
      listeners?.delete(listener);
      listeners = null;
    };
  }

  send(command: T): boolean {
    let handled = false;
    for (const listener of [...this.#listeners]) {
      try {
        handled ||= listener(command);
      } catch (e) {
        reportError(e);
      }
    }
    return handled;
  }
}

export function useAcceptCommands<T>(
  commandStream: CommandStream<T> | undefined,
  listener: Listener<T>,
  deps?: readonly any[]
) {
  useEffect(
    () => commandStream?.listen(listener),
    deps ? [commandStream, ...deps] : [commandStream]
  );
}
