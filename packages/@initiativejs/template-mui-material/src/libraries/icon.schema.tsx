// It was an idea, but turns out it takes several seconds to fetch all the
// icons in vite dev mode. This wait time is unacceptable; we need to find
// another way to import the icons.

import { t } from "@initiativejs/schema";
import { SvgIconComponent } from "@mui/icons-material";

export const iconType = t.entity<SvgIconComponent>(
  "@initiativejs/template-mui-material::Icon",
);
