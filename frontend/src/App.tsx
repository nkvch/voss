import { useRef, useState } from "react";
import { Layout } from "./components/Layout";
import { Recorder } from "./components/Recorder/Recorder";
import { RecordingWidget } from "./components/Recorder/RecordingWidget";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { useRecorder } from "./hooks/useRecorder";
import { useUploads } from "./hooks/useUploads";

type View = "record" | "dashboard";

function App() {
  const [view, setView] = useState<View>("record");
  const recorder = useRecorder();
  const { uploads, loading, addUpload } = useUploads();
  const contentRef = useRef<HTMLDivElement>(null);

  const handleNavigate = (v: View) => {
    if (v === view) return;
    const el = contentRef.current;
    if (el) {
      el.classList.remove("view-transition");
      void el.offsetHeight;
      el.classList.add("view-transition");
    }
    setView(v);
  };

  return (
    <Layout currentView={view} onNavigate={handleNavigate}>
      <div ref={contentRef}>
        <div style={{ display: view === "record" ? undefined : "none" }}>
          <Recorder recorder={recorder} onUploadComplete={addUpload} />
        </div>
        <div style={{ display: view === "dashboard" ? undefined : "none" }}>
          <Dashboard uploads={uploads} loading={loading} />
        </div>
      </div>

      {recorder.state === "recording" && view !== "record" && (
        <RecordingWidget
          duration={recorder.duration}
          onStop={recorder.stopRecording}
        />
      )}
    </Layout>
  );
}

export default App;
