import { DialogBodyText, DialogButtonPrimary, DialogButtonSecondary, DialogHeader, Focusable, ModalRoot, showModal } from "@decky/ui";
import { FC, useRef, useState } from "react";
import { ToggleField } from "./togglefield";
import { WolPromptResult } from "../../lib/moondeckapplauncher";

interface Props {
  closeModal?: () => void;
  hostName: string;
  onResult: (result: WolPromptResult) => void;
}

export const WolPromptModal: FC<Props> = ({ closeModal, hostName, onResult }) => {
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const resolvedRef = useRef(false);

  const finish = (result: WolPromptResult): void => {
    if (resolvedRef.current) {
      return;
    }
    resolvedRef.current = true;
    onResult(result);
    closeModal?.();
  };

  return (
    <ModalRoot closeModal={() => finish({ action: "dismiss" })}>
      <DialogHeader>
        Host PC is offline
      </DialogHeader>
      <DialogBodyText style={{ marginBottom: "0.75em" }}>
        {`${hostName} appears to be offline. Would you like to wake it using Wake On LAN?`}
      </DialogBodyText>
      <ToggleField
        label="Don't ask again"
        description="Remember this choice for this host. You can change it later in WOL Settings."
        bottomSeparator="none"
        value={dontAskAgain}
        setValue={setDontAskAgain}
      />
      <Focusable style={{ display: "flex", justifyContent: "flex-end", gap: "1em", marginTop: "1em" }}>
        <DialogButtonPrimary onClick={() => finish({ action: "wake", dontAskAgain })}>
          Wake PC
        </DialogButtonPrimary>
        <DialogButtonSecondary onClick={() => finish({ action: "decline", dontAskAgain })}>
          Don&apos;t wake
        </DialogButtonSecondary>
      </Focusable>
    </ModalRoot>
  );
};

export function showWolPromptModal(hostName: string): Promise<WolPromptResult> {
  return new Promise((resolve) => {
    let resolved = false;
    const resolveOnce = (result: WolPromptResult): void => {
      if (resolved) {
        return;
      }
      resolved = true;
      resolve(result);
    };

    showModal(
      <WolPromptModal hostName={hostName} onResult={resolveOnce} />,
      undefined,
      { fnOnClose: () => resolveOnce({ action: "dismiss" }) }
    );
  });
}
