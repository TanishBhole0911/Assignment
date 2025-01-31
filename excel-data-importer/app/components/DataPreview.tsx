"use client"

import { useState } from "react"
import { format } from "date-fns"

interface DataPreviewProps {
  sheets: string[]
  currentSheet: string
  onSheetChange: (sheet: string) => void
  data: any[]
  onImport: () => Promise<void>
}

export default function DataPreview({ sheets, currentSheet, onSheetChange, data, onImport }: DataPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [isImporting, setIsImporting] = useState(false)
  const rowsPerPage = 10

  const formatDate = (date: string) => {
    const parsedDate = new Date(date)
    return isNaN(parsedDate.getTime()) ? date : format(parsedDate, "dd-MM-yyyy")
  }

  const formatNumber = (num: number) => {
    return typeof num === "number" ? num.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : num
  }

  const handleDeleteRow = (index: number) => {
    if (confirm("Are you sure you want to delete this row?")) {
      // TODO: Implement row deletion
      console.log("Delete row", index)
    }
  }

  const handleImport = async () => {
    setIsImporting(true)
    try {
      await onImport()
    } finally {
      setIsImporting(false)
    }
  }

  const paginatedData = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  return (
    <div className="mt-8">
      <div className="mb-4">
        <label htmlFor="sheet-select" className="mr-2">
          Select Sheet:
        </label>
        <select
          id="sheet-select"
          value={currentSheet}
          onChange={(e) => onSheetChange(e.target.value)}
          className="border rounded px-2 py-1"
        >
          {sheets.map((sheet) => (
            <option key={sheet} value={sheet}>
              {sheet}
            </option>
          ))}
        </select>
      </div>
      {data.length > 0 ? (
        <>
          <table className="w-full border-collapse border">
            <thead>
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key} className="border p-2">
                    {key}
                  </th>
                ))}
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, index) => (
                <tr key={index}>
                  {Object.entries(row).map(([key, value]) => (
                    <td key={key} className="border p-2">
                      {key.toLowerCase().includes("date")
                        ? formatDate(value as string)
                        : key.toLowerCase().includes("amount")
                          ? formatNumber(value as number)
                          : String(value)}
                    </td>
                  ))}
                  <td className="border p-2">
                    <button
                      onClick={() => handleDeleteRow(index)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-between items-center">
            <div>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-300 rounded mr-2 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage * rowsPerPage >= data.length}
                className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <button
              onClick={handleImport}
              disabled={isImporting}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {isImporting ? "Importing..." : "Import"}
            </button>
          </div>
        </>
      ) : (
        <p>No data available for the selected sheet.</p>
      )}
    </div>
  )
}

