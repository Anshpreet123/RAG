import { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { FaFilePdf, FaTrash, FaUpload } from "react-icons/fa";

const UploadPDF = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [pdfFiles, setPdfFiles] = useState([]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 2,
    onDrop: async (acceptedFiles) => {
      if (pdfFiles.length + acceptedFiles.length > 2) {
        alert("You can only upload up to 2 PDFs.");
        return;
      }

      setUploading(true);
      const uploadedFiles = [...pdfFiles];

      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          await axios.post("http://localhost:8000/upload", formData);
          uploadedFiles.push(file);
        } catch (error) {
          console.error("Upload failed", error);
        }
      }

      setPdfFiles(uploadedFiles);
      setUploading(false);
      onUploadSuccess();
    },
  });

  const removePdf = (index) => {
    const updatedFiles = pdfFiles.filter((_, i) => i !== index);
    setPdfFiles(updatedFiles);
  };

  return (
    <div className="w-full h-1/3 mx-auto bg-white p-4 rounded-lg shadow-lg">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 p-6 text-center cursor-pointer rounded-md hover:bg-gray-50 transition-all flex flex-col items-center"
      >
        <input {...getInputProps()} />
        <FaUpload className="text-gray-500 text-2xl mb-2" />
        <p className="text-gray-600">
          {uploading ? "Uploading..." : "Drag & drop a PDF or click to upload"}
        </p>
      </div>

      {pdfFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Uploaded PDFs
          </h3>
          {pdfFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-100 p-3 rounded-lg mb-2"
            >
              <div className="flex items-center space-x-2">
                <FaFilePdf className="text-red-500 text-xl" />
                <div>
                  <p className="text-gray-700 text-sm font-medium">
                    {file.name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removePdf(index)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadPDF;
