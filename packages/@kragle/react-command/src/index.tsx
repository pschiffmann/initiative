export interface CommandStream<T = void> {
  listen(onRequest: Listener<T>): Unsubscribe;
}

export type Listener<T> = T extends void
  ? () => boolean
  : (value: T) => boolean;
export type Unsubscribe = () => void;

type SendParams<T> = T extends void
  ? []
  : T extends undefined
  ? [] | [data: T]
  : [data: T];

export class CommandController<T = void> implements CommandStream<T> {
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

  send(...args: SendParams<T>): boolean;
  send(data?: any): boolean {
    let handled = false;
    for (const listener of [...this.#listeners]) {
      try {
        handled ||= listener(data);
      } catch (e) {
        reportError(e);
      }
    }
    return handled;
  }
}
