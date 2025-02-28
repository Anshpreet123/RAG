import UploadPDF from "./components/UploadPDF";
import Chatbot from "./components/Chatbot";

import { useState } from "react";

function App() {
  const [uploaded, setUploaded] = useState(false);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center">Chatbot with PDF Knowledge</h1>
      <UploadPDF onUploadSuccess={() => setUploaded(true)} />
      <Chatbot />
    </div>
  );
}

export default App;
