import { FC } from "react";

/**
 * [HOC][1] that binds a subset of the components props to `values`.
 *
 * Like `Function.bind()`, but for React component props.
 *
 * [1]: https://legacy.reactjs.org/docs/higher-order-components.html
 */
export function withProps<P extends {}, K extends keyof P>(
  Component: FC<P>,
  values: Pick<P, K>
): FC<Omit<P, K>> {
  function WithProps(props: Omit<P, K>) {
    return <Component {...props} {...(values as any)} />;
  }
  WithProps.displayName = `WithProps(${getDisplayName(Component)}`;
  return WithProps;
}

function getDisplayName(component: FC<any>): string {
  return component.displayName || component.name || "Component";
}
