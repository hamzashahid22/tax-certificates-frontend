import Dialog from "@mui/material/Dialog";
import "./Workspace.css";

export default function WorkspaceDialog({ open, onClose, title, description, children, actions, danger = false, busy = false }) {
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm"
      aria-labelledby="workspace-dialog-title" aria-describedby="workspace-dialog-description"
      PaperProps={{ className: "workspace-dialog", sx: { borderRadius: "16px", margin: "16px", width: "calc(100% - 32px)", maxWidth: "520px", maxHeight: "calc(100% - 32px)" } }}
      slotProps={{ backdrop: { sx: { backgroundColor: "rgba(17, 30, 50, .48)", backdropFilter: "blur(5px)" } } }}>
      <div className="workspace-dialog-header">
        <div className={`workspace-dialog-icon ${danger ? "workspace-dialog-icon-danger" : ""}`} aria-hidden="true">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
            {danger ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 3h.01M10.3 3.9 2.1 18a2 2 0 0 0 1.7 3h16.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m18-13v6m-3-3h6M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />}
          </svg>
        </div>
        <button type="button" className="workspace-close" onClick={onClose} disabled={busy} aria-label="Close dialog">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m6 6 12 12M6 18 18 6" /></svg>
        </button>
        <h2 id="workspace-dialog-title">{title}</h2>
        <p id="workspace-dialog-description">{description}</p>
      </div>
      <div className="workspace-dialog-body">{children}</div>
      <div className="workspace-dialog-footer">{actions}</div>
    </Dialog>
  );
}
