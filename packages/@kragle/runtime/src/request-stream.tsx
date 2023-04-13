/**
 * Idea: Instead of calling `ref.focus()`, pass a `focusRequestStream` to inputs
 * that emit a `void` event every time the input should focus.
 */
// Name idea: Notification?
export interface RequestStream<T = void> {
  subscribe(onRequest: Subscription<T>): Unsubscribe;
}

export type Subscription<T> = T extends void
  ? () => boolean
  : (value: T) => boolean;
export type Unsubscribe = () => void;

type EmitArgs<T> = T extends void
  ? []
  : T extends undefined
  ? [] | [data: T]
  : [data: T];

export class RequestEmitter<T = void> implements RequestStream<T> {
  #subscriptions = new Set<Subscription<T>>();

  get hasSubscriptions(): boolean {
    return this.#subscriptions.size !== 0;
  }

  subscribe(onRequest: Subscription<T>): Unsubscribe {
    if (this.#subscriptions.has(onRequest)) {
      throw new Error(
        "This function is already subscribed to this request stream."
      );
    }
    this.#subscriptions.add(onRequest);

    let called = false;
    return () => {
      if (called) return;
      called = true;
      this.#subscriptions.delete(onRequest);
    };
  }

  emit(...args: EmitArgs<T>): boolean;
  emit(data?: any): boolean {
    let handled = false;
    for (const subscription of [...this.#subscriptions]) {
      try {
        handled ||= subscription(data);
      } catch (e) {
        reportError(e);
      }
    }
    return handled;
  }
}
