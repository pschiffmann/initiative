import { bemClasses } from "@kragle/design-system";

const cls = bemClasses("kragle-license-status");

export interface LicenseStatusProps {
  className?: string;
}

export function LicenseStatus({ className }: LicenseStatusProps) {
  return (
    <div className={cls.block(className)}>
      Community license – for non-commercial use only
    </div>
  );
}
