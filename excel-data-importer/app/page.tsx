"use client"

import { useState } from "react"
import * as XLSX from "xlsx"
import FileUpload from "./components/FileUpload"
import ErrorModal from "./components/ErrorModal"
import DataPreview from "./components/DataPreview"
import SuccessMessage from "./components/SuccessMessage"

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<any>(null)
  const [sheets, setSheets] = useState<string[]>([])
  const [currentSheet, setCurrentSheet] = useState<string>("")
  const [data, setData] = useState<any[]>([])
  const [importSuccess, setImportSuccess] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  const parseDates = (data: any[]) => {
    return data.map(row => {
      const parsedRow = { ...row }
      for (const key in row) {
        if (Object.prototype.toString.call(row[key]) === '[object Date]') {
          parsedRow[key] = new Date(row[key]).toISOString().split('T')[0]
        }
      }
      return parsedRow
    })
  }

  const handleFileUpload = async (file: File) => {
    setFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: "array", cellDates: true })
      const sheetNames = workbook.SheetNames
      setSheets(sheetNames)
      setCurrentSheet(sheetNames[0])
      const worksheet = workbook.Sheets[sheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false })
      setData(parseDates(jsonData))
    }
    reader.readAsArrayBuffer(file)
  }

  const handleSheetChange = (sheet: string) => {
    setCurrentSheet(sheet)
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: "array", cellDates: true })
      const worksheet = workbook.Sheets[sheet]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false })
      setData(parseDates(jsonData))
    }
    reader.readAsArrayBuffer(file as Blob)
  }

  const handleImport = async () => {
    if (!file) {
      setImportError("No file selected")
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 400) {
          if (errorData.error === "No file uploaded") {
            setImportError("No file uploaded")
          } else if (errorData.error === "Invalid column headers") {
            setImportError("Invalid column headers")
          } else if (errorData.errors) {
            setErrors(errorData.errors)
          } else {
            setImportError("Unknown error occurred")
          }
        } else if (response.status === 500 && errorData.error === "Database insertion error") {
          setImportError("Database insertion error")
        } else {
          setImportError(`HTTP error! status: ${response.status}`)
        }
        setImportSuccess(false)
        return
      }

      const result = await response.json()
      console.log(result)
      setImportSuccess(true)
      setImportError(null)
    } catch (error) {
      console.error("Error:", error)
      setImportError("Failed to import data. Please try again.")
      setImportSuccess(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Excel Data Importer</h1>
      <FileUpload onFileUpload={handleFileUpload} />
      {errors && <ErrorModal errors={errors} onClose={() => setErrors(null)} />}
      {file && sheets.length > 0 && (
        <DataPreview
          sheets={sheets}
          currentSheet={currentSheet}
          onSheetChange={handleSheetChange}
          data={data}
          onImport={handleImport}
        />
      )}
      {importSuccess && <SuccessMessage />}
      {importError && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{importError}</div>
      )}
    </div>
  )
}

