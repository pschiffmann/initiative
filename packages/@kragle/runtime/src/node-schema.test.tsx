import { test } from "@jest/globals";
import { InferProps, NodeSchema } from "./node-schema.js";
import * as t from "./type-system/index.js";
import { assertTypesAreEqual } from "./util/test-utils.js";

test("InferProps turns Schema.inputs into props", () => {
  const schema = new NodeSchema("@kragle/runtime/Test", {
    inputs: {
      a: t.string(),
      b: t.optional(t.number()),
    },
  });
  type Props = InferProps<typeof schema>;

  function Component({ a, b }: Props) {
    assertTypesAreEqual<typeof a, string>(true);
    assertTypesAreEqual<typeof b, number | undefined>(true);
    return null;
  }
});

test("InferProps turns Schema.outputs into OutputsProvider props", () => {
  const schema = new NodeSchema("@kragle/runtime/Test", {
    outputs: {
      a: t.string(),
      b: t.optional(t.number()),
    },
  });
  type Props = InferProps<typeof schema>;

  function Component({ OutputsProvider }: Props) {
    let outputA!: string;
    let outputB!: number | undefined;
    return <OutputsProvider a={outputA} b={outputB} />;
  }
});

test("InferProps turns Schema.slots into a slots prop", () => {
  const schema = new NodeSchema("@kragle/runtime/Test", {
    slots: {
      x: {},
    },
  });
  type Props = InferProps<typeof schema>;

  function Component({ slots }: Props) {
    return <>{slots.x.element()}</>;
  }
});

test("InferProps adds Schema.slots.inputs to props", () => {
  const schema = new NodeSchema("@kragle/runtime/Test", {
    inputs: {
      a: t.string(),
    },
    slots: {
      x: {
        inputs: {
          b: t.string(),
          c: t.optional(t.number()),
        },
      },
      y: {
        inputs: {
          d: t.union(t.string(), t.null()),
        },
      },
    },
  });
  type Props = InferProps<typeof schema>;

  function Component({ a, b, c, d }: Props) {
    assertTypesAreEqual<typeof a, string>(true);
    assertTypesAreEqual<typeof b, readonly string[]>(true);
    assertTypesAreEqual<typeof c, readonly (number | undefined)[]>(true);
    assertTypesAreEqual<typeof d, readonly (string | null)[]>(true);
    return null;
  }
});

test("InferProps turns slots into arrays for collection slots", () => {
  const schema = new NodeSchema("@kragle/runtime/Test", {
    slots: {
      x: {
        inputs: {},
      },
    },
  });
  type Props = InferProps<typeof schema>;

  function Component({ slots }: Props) {
    return <>{slots.x.map((x) => x.element())}</>;
  }
});

test("InferProps adds Schema.slots.outputs to the slots.*.element parammeters", () => {
  const schema = new NodeSchema("@kragle/runtime/Test", {
    outputs: {
      a: t.string(),
    },
    slots: {
      x: {
        outputs: {
          b: t.string(),
          c: t.optional(t.number()),
        },
      },
      y: {
        inputs: {},
        outputs: {
          d: t.union(t.string(), t.null()),
        },
      },
    },
  });
  type Props = InferProps<typeof schema>;

  function Component({ slots, OutputsProvider }: Props) {
    let outputA!: string;
    let outputB!: string;
    let outputC!: number | undefined;
    let outputD!: string | null;
    return (
      <OutputsProvider a={outputA}>
        {slots.x.element({ b: outputB, c: outputC })}
        {slots.y.map((y) => y.element({ d: outputD }))}
      </OutputsProvider>
    );
  }
});

test("InferProps plays nice with generics", () => {
  const schema = new NodeSchema("@kragle/runtime/Test", (t1, t2, t3) => ({
    inputs: {
      a: t.array(t1),
      b: t.function(t1)(t.string()),
      c: t.function(t1)(t.array(t2)),
      d: t.function(t2)(t.string()),
    },
    outputs: {
      x: t1,
      y: t2,
    },
  }));
  type Props = InferProps<typeof schema>;

  function Component({ a, b, c, d, OutputsProvider }: Props) {
    return <OutputsProvider x={a[0]} y={c(a[0])[0]} />;
  }
});
