import { DialogCommand, bemClasses } from "@kragle/design-system";
import { CommandController } from "@kragle/react-command";
import { useState } from "react";
import { LicenseKeyDialog } from "./license-key-dialog.js";
import { useLicense } from "./use-license.js";

const cls = bemClasses("kragle-license-status");

export interface LicenseStatusProps {
  className?: string;
}

export function LicenseStatus({ className }: LicenseStatusProps) {
  const [dialogController] = useState(
    () => new CommandController<DialogCommand>(),
  );

  const { licenseData, saveLicenseKey } = useLicense();
  const [expiryDate] = useState(() => {
    const result = new Date();
    result.setFullYear(result.getFullYear() - 1);
    return result;
  });

  return (
    <>
      <a
        className={cls.block(className)}
        href="#"
        onClick={(e) => {
          e.preventDefault();
          dialogController.send("open");
        }}
      >
        {!licenseData.properties
          ? "Community license – for non-commercial use only"
          : licenseData.properties.issuedAt < expiryDate
          ? "Personal license – EXPIRED"
          : "Personal license"}
      </a>
      <LicenseKeyDialog
        controller={dialogController}
        expriyDate={expiryDate}
        savedLicenseKey={licenseData.key}
        onSaveLicenseKey={saveLicenseKey}
      />
    </>
  );
}
