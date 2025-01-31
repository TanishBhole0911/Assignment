"use client"

import { useState } from "react"

interface ErrorModalProps {
  errors: {
    sheet: string
    row: number
    errors: string[]
  }[]
  onClose: () => void
}

export default function ErrorModal({ errors, onClose }: ErrorModalProps) {
  const [activeTab, setActiveTab] = useState<string>(errors[0].sheet)

  const groupedErrors = errors.reduce((acc, error) => {
    if (!acc[error.sheet]) {
      acc[error.sheet] = []
    }
    acc[error.sheet].push(error)
    return acc
  }, {} as { [sheet: string]: { row: number; errors: string[] }[] })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
        <h2 className="text-xl font-bold mb-4">Validation Errors</h2>
        <div className="mb-4">
          {Object.keys(groupedErrors).map((sheet) => (
            <button
              key={sheet}
              onClick={() => setActiveTab(sheet)}
              className={`mr-2 px-3 py-1 rounded ${activeTab === sheet ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              {sheet}
            </button>
          ))}
        </div>
        <ul>
          {groupedErrors[activeTab].map((error, index) => (
            <li key={index} className="mb-2">
              <span className="font-bold">Row {error.row}:</span>
              <ul>
                {error.errors.map((description, i) => (
                  <li key={i}>{description}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Close
        </button>
      </div>
    </div>
  )
}

