import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { McpHostProvider } from "@/hooks/use-host"
import { RecordView } from "@/record-view"
import "./styles.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <McpHostProvider appInfo={{ name: "Record summary", version: "0.1.0" }}>
      <RecordView />
    </McpHostProvider>
  </StrictMode>,
)
