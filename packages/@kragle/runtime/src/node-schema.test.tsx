import { test } from "@jest/globals";
import { InferProps, NodeSchema } from "./node-schema.js";
import * as t from "./type-system/index.js";
import { assertTypesAreEqual } from "./util/test-utils.js";

test("InferProps turns Schema.inputs into props", () => {
  const schema = new NodeSchema("@kragle/runtime::Test", {
    inputs: {
      a: t.string(),
      b: t.optional(t.number()),
    },
  });
  type Props = InferProps<typeof schema>;

  function Component({ a, b, OutputsProvider }: Props) {
    assertTypesAreEqual<typeof a, string>(true);
    assertTypesAreEqual<typeof b, number | undefined>(true);
    return <OutputsProvider />;
  }
});

test("InferProps turns Schema.outputs into OutputsProvider props", () => {
  const schema = new NodeSchema("@kragle/runtime::Test", {
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

test("InferProps adds Schema.slots to the OutputsProvider.children parameter", () => {
  const schema = new NodeSchema("@kragle/runtime::Test", {
    slots: {
      X: {},
      Y: {},
    },
  });
  type Props = InferProps<typeof schema>;

  function Component({ OutputsProvider }: Props) {
    return (
      <OutputsProvider>
        {({ X, Y, ...rest }) => (
          <>
            <X />
            <Y />
          </>
        )}
      </OutputsProvider>
    );
  }
});

test("InferProps adds Schema.slots.inputs to props", () => {
  const schema = new NodeSchema("@kragle/runtime::Test", {
    inputs: {
      a: t.string(),
    },
    slots: {
      X: {
        inputs: {
          b: t.string(),
          c: t.optional(t.number()),
        },
      },
      Y: {
        inputs: {
          d: t.union(t.string(), t.null()),
        },
      },
    },
  });
  type Props = InferProps<typeof schema>;

  function Component({ a, b, c, d, OutputsProvider }: Props) {
    assertTypesAreEqual<typeof a, string>(true);
    assertTypesAreEqual<typeof b, readonly string[]>(true);
    assertTypesAreEqual<typeof c, readonly (number | undefined)[]>(true);
    assertTypesAreEqual<typeof d, readonly (string | null)[]>(true);
    return <OutputsProvider />;
  }
});

test("InferProps adds Schema.slots.outputs to the slot props", () => {
  const schema = new NodeSchema("@kragle/runtime::Test", {
    outputs: {
      a: t.string(),
    },
    slots: {
      X: {
        outputs: {
          b: t.string(),
          c: t.optional(t.number()),
        },
      },
      Y: {
        outputs: {
          d: t.union(t.string(), t.null()),
        },
      },
    },
  });
  type Props = InferProps<typeof schema>;

  function Component({ OutputsProvider }: Props) {
    let outputA!: string;
    let outputB!: string;
    let outputC!: number | undefined;
    let outputD!: string | null;
    return (
      <OutputsProvider a={outputA}>
        {({ X, Y }) => (
          <>
            <X b={outputB} c={outputC} />
            <Y d={outputD} />
          </>
        )}
      </OutputsProvider>
    );
  }
});
