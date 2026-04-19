import "./styles.css";
import { authorizeSmartLaunch } from "./lib/smart";

const status = document.querySelector<HTMLDivElement>("#launch-status");

async function start(): Promise<void> {
  if (!status) {
    return;
  }

  try {
    status.textContent = "Connecting to the EHR launch context...";
    await authorizeSmartLaunch();
  } catch (error) {
    status.textContent =
      error instanceof Error ? error.message : "SMART launch failed. Check your Epic sandbox settings.";
  }
}

void start();
