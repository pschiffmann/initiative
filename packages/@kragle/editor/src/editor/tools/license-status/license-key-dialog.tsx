import {
  AlertDialogContent,
  Button,
  Dialog,
  DialogCommand,
  MaterialIcon,
  TextFieldControl,
  Typography,
  bemClasses,
} from "#design-system";
import { LicenseProperties, decodeLicenseKey } from "@kragle/license";
import { CommandController } from "@kragle/react-command";
import { useEffect, useState } from "react";

const cls = bemClasses("kragle-license-key-dialog");

export interface LicenseKeyDialogProps {
  controller: CommandController<DialogCommand>;
  expriyDate: Date;
  savedLicenseKey: string;
  onSaveLicenseKey(licenseKey: string): void;
}

export function LicenseKeyDialog({
  controller,
  expriyDate,
  savedLicenseKey,
  onSaveLicenseKey,
}: LicenseKeyDialogProps) {
  const [licenseKey, setLicenseKey] = useState("");

  useEffect(() => {
    setLicenseKey(savedLicenseKey);
  }, [savedLicenseKey]);

  const [licenseProperties, setLicenseProperties] =
    useState<LicenseProperties | null>(null);
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const properties = await decodeLicenseKey(licenseKey);
      if (!cancelled) setLicenseProperties(properties);
    })();

    return () => {
      cancelled = true;
    };
  }, [licenseKey]);

  const kind = !licenseProperties
    ? "community"
    : licenseProperties.issuedAt < expriyDate
    ? "personal-expired"
    : "personal";

  return (
    <Dialog className={cls.block()} commandStream={controller}>
      <AlertDialogContent
        title="License terms"
        actions={
          <>
            <Button label="Cancel" onPress={() => controller.send("close")} />
            <Button
              className={cls.element("save-button")}
              label="Save"
              onPress={() => {
                onSaveLicenseKey(licenseKey);
                controller.send("close");
              }}
            />
          </>
        }
      >
        <div
          className={cls.element(
            "container",
            null,
            kind === "community" && "selected"
          )}
        >
          <div className={cls.element("container-title")}>
            {kind === "community" && <MaterialIcon icon="check_circle" />}
            <Typography variant="body-large">Community license</Typography>
          </div>
          <Typography variant="body-medium">
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
            nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
            erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
            et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est
            Lorem ipsum dolor sit amet.
          </Typography>
        </div>

        <div
          className={cls.element(
            "container",
            null,
            kind === "personal-expired" && "expired",
            kind === "personal" && "selected"
          )}
        >
          <div className={cls.element("container-title")}>
            {kind === "personal-expired" && (
              <MaterialIcon icon="warning_amber" />
            )}
            {kind === "personal" && <MaterialIcon icon="check_circle" />}
            <Typography variant="body-large">
              {kind === "personal-expired"
                ? "Personal license – EXPIRED"
                : "Personal license"}
            </Typography>
          </div>
          <Typography variant="body-medium">
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
            nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
            erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
            et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est
            Lorem ipsum dolor sit amet.
          </Typography>
        </div>

        <hr className={cls.element("divider")} />

        <TextFieldControl
          label="Your license key"
          adornmentIcon="key"
          errorText={
            !!licenseKey && !licenseProperties
              ? "Invalid license key"
              : undefined
          }
          value={licenseKey}
          onChange={setLicenseKey}
          onClear={() => setLicenseKey("")}
        />
        {licenseProperties && (
          <div className={cls.element("license-properties")}>
            <Typography variant="body-medium">
              Owner: {licenseProperties.subject}
            </Typography>
            <Typography variant="body-medium">
              Date of purchase: {licenseProperties.issuedAt.toISOString()}
            </Typography>
          </div>
        )}
      </AlertDialogContent>
    </Dialog>
  );
}
