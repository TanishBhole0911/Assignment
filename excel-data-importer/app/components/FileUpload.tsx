"use client"

import { useState, useRef } from "react"
import { useDropzone } from "react-dropzone"

interface FileUploadProps {
  onFileUpload: (file: File) => void
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onDrop = (acceptedFiles: File[]) => {
    handleFile(acceptedFiles[0])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxSize: 2 * 1024 * 1024, // 2MB
    multiple: false,
  })

  const handleFile = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      setError("File size exceeds 2MB limit")
      return
    }
    setError(null)
    onFileUpload(file)
  }

  return (
    <div className="mb-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-4 text-center cursor-pointer ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the file here...</p>
        ) : (
          <p>Drag and drop an Excel file here, or click to select a file</p>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        accept=".xlsx"
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Select File
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}

