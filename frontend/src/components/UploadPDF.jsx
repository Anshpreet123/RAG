import { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const UploadPDF = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  
  const { getRootProps, getInputProps } = useDropzone({
    accept: "application/pdf",
    onDrop: async (acceptedFiles) => {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", acceptedFiles[0]);

      try {
        await axios.post("http://localhost:8000/upload", formData);
        alert("File uploaded successfully!");
        onUploadSuccess(); // Refresh chat after upload
      } catch (error) {
        console.error("Upload failed", error);
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div {...getRootProps()} className="p-4 border-dashed border-2 rounded-md text-center cursor-pointer">
      <input {...getInputProps()} />
      {uploading ? "Uploading..." : "Drag & drop a PDF or click to upload"}
    </div>
  );
};

export default UploadPDF;
