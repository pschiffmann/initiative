// TODO: Move somewhere else – maybe @pschiffmann/std?
export class Listeners<T> {
  add(listener: Listener<T>): Unsubscribe {
    if (this.#listeners.has(listener)) {
      throw new Error("'listener' is already subscribed to this object.");
    }
    this.#listeners.add(listener);

    let listeners: Set<Listener<T>> | null = this.#listeners;
    return () => {
      listeners?.delete(listener);
      listeners = null;
    };
  }

  #listeners = new Set<Listener<T>>();

  notify(event: T): void {
    for (const onChange of [...this.#listeners]) {
      try {
        onChange(event);
      } catch (e) {
        reportError(e);
      }
    }
  }
}

export type Listener<T> = (event: T) => void;

/**
 * Returned from `Observable.listen()` methods. Call this function to
 * unsubscribe the listener from the observable.
 *
 * Calling this function multiple times has no effect.
 */
export type Unsubscribe = () => void;
