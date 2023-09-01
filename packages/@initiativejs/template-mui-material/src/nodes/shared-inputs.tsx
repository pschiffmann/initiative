import { t } from "@initiativejs/schema";

export const surfaceInputs = {
  backgroundColor: {
    type: t.optional(t.string()),
  },
  elevation: {
    type: t.optional(
      t.union(
        t.number(1),
        t.number(2),
        t.number(3),
        t.number(4),
        t.number(5),
        t.number(6),
        t.number(7),
        t.number(8),
        t.number(9),
        t.number(10),
        t.number(11),
        t.number(12),
        t.number(13),
        t.number(14),
        t.number(15),
        t.number(16),
        t.number(17),
        t.number(18),
        t.number(19),
        t.number(20),
        t.number(21),
        t.number(22),
        t.number(23),
        t.number(24),
      ),
    ),
  },
  outlined: {
    type: t.optional(t.boolean()),
  },
  borderRadius: {
    type: t.optional(t.number()),
  },
};
