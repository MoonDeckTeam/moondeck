import { BuddyStatus, ServerStatus, executeAsyncWrapper, logger, validAbortPcStateChangeStates } from "../../lib";
import { ButtonItem, PanelSection, PanelSectionRow } from "@decky/ui";
import { CurrentHostSettings, useCommandExecutionStatus } from "../../hooks";
import { FC, useContext } from "react";
import { MoonDeckContext } from "../../contexts";

interface Props {
  serverStatus: ServerStatus;
  buddyStatus: BuddyStatus;
  currentHostSettings: CurrentHostSettings;
}

export const HostCommandPanel: FC<Props> = ({ serverStatus, buddyStatus, currentHostSettings }) => {
  const { connectivityManager, moonDeckAppLauncher } = useContext(MoonDeckContext);
  const executionStatus = useCommandExecutionStatus();

  const additionalCleanup = async () => {
    try {
      await moonDeckAppLauncher.moonDeckApp.killApp(true);
      await moonDeckAppLauncher.moonDeckApp.clearApp();
    } catch (error) {
      logger.critical(error);
    }
  };

  const wolEnabled = currentHostSettings.wolSettings.enabled;
  const hibernateHost = currentHostSettings.buddy.hibernateHost;
  const statusChangeCanBeAborted = validAbortPcStateChangeStates.includes(buddyStatus);
  const showWolButton = wolEnabled || statusChangeCanBeAborted;
  const enableWolButton = !executionStatus && (statusChangeCanBeAborted || (wolEnabled && serverStatus === "Offline" && buddyStatus === "Offline"));
  return (
    <PanelSection title="COMMANDS" spinner={executionStatus}>
      {
        showWolButton &&
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            bottomSeparator="none"
            disabled={!enableWolButton}
            onClick={executeAsyncWrapper(async () => {
              if (!statusChangeCanBeAborted || !await connectivityManager.commandProxy.abortPcStateChange()) {
                if (wolEnabled) {
                  await connectivityManager.commandProxy.wakeOnLan();
                }
              }
            })}
          >
            {statusChangeCanBeAborted && !wolEnabled ? "Cancel PC state change" : "Wake On LAN"}
          </ButtonItem>
        </PanelSectionRow>
      }
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          bottomSeparator="none"
          disabled={executionStatus || buddyStatus !== "Online"}
          onClick={executeAsyncWrapper(() => connectivityManager.commandProxy.restartPC(additionalCleanup))}
        >
          Restart PC
        </ButtonItem>
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          bottomSeparator="none"
          disabled={executionStatus || buddyStatus !== "Online"}
          onClick={executeAsyncWrapper(() => connectivityManager.commandProxy.shutdownPC(additionalCleanup))}
        >
          Shutdown PC
        </ButtonItem>
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          disabled={executionStatus || buddyStatus !== "Online"}
          onClick={executeAsyncWrapper(() => connectivityManager.commandProxy.suspendOrHibernatePC({ additionalCleanup }))}
        >
          {hibernateHost ? "Hibernate PC" : "Suspend PC"}
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
};
