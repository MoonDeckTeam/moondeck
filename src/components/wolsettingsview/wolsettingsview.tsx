import { DialogBody, DialogControlsSection, DialogControlsSectionHeader, Field } from "@decky/ui";
import { FC, useContext } from "react";
import { LabelWithIcon, NumericTextInput, ToggleField } from "../shared";
import { HostOff } from "../icons";
import { MoonDeckContext } from "../../contexts";
import { WOLExecutableSelection } from "./wolexecutableselection";
import { useCurrentHostSettings } from "../../hooks";

export const WOLSettingsView: FC = () => {
  const { settingsManager } = useContext(MoonDeckContext);
  const hostSettings = useCurrentHostSettings();

  if (hostSettings === null) {
    return (
      <DialogBody>
        <DialogControlsSection>
          <Field
            label={<LabelWithIcon icon={HostOff} label="HOST IS NOT SELECTED" />}
            description="Go to host selection page to select host"
            bottomSeparator="none"
          />
        </DialogControlsSection>
      </DialogBody>
    );
  }

  const wolEnabled = hostSettings.wolSettings.enabled;

  return (
    <DialogBody>
      <DialogControlsSection>
        <DialogControlsSectionHeader>General</DialogControlsSectionHeader>
        <ToggleField
          label="Enable Wake On LAN"
          description="Allow MoonDeck to wake this host PC using Wake On LAN."
          value={wolEnabled}
          setValue={(value) => { settingsManager.updateHost((settings) => { settings.wolSettings.enabled = value; }); }}
        />
        <ToggleField
          label="Ask before waking offline host"
          description="Show a confirmation prompt before sending Wake On LAN when launching a game while this host PC is offline."
          disabled={!wolEnabled}
          value={hostSettings.wolSettings.promptBeforeWake}
          setValue={(value) => { settingsManager.updateHost((settings) => { settings.wolSettings.promptBeforeWake = value; }); }}
        />
        <WOLExecutableSelection hostSettings={hostSettings} />
        <Field
          label="WOL port"
          description="Port to be used for sending out WOL request."
          childrenContainerWidth="fixed"
          disabled={!wolEnabled}
        >
          <NumericTextInput
            min={1}
            max={65535}
            disabled={!wolEnabled}
            value={hostSettings.wolSettings.port}
            setValue={(value) => { settingsManager.updateHost((settings) => { settings.wolSettings.port = value; }); }}
          />
        </Field>
      </DialogControlsSection>
    </DialogBody>
  );
};
