import { create } from 'zustand'
import type { DocumentCategory, EmployeeDocument } from '@/types/document'

interface DocumentState {
  documents: EmployeeDocument[]
  isLoading: boolean
  fetchMyDocuments: (employeeId: string) => Promise<void>
  fetchAllDocuments: () => Promise<void>
  updateDocument: (documentId: string, updates: { documentName?: string; category?: DocumentCategory }) => Promise<void>
  deleteDocument: (documentId: string) => Promise<void>
}

export const useDocumentStore = create<DocumentState>()((set, get) => ({
  documents: [],
  isLoading: false,
  fetchMyDocuments: async (employeeId: string) => {
    set({ isLoading: true })
    const { getMyDocuments } = await import('@/mock/handlers')
    const documents = await getMyDocuments(employeeId)
    set({ documents, isLoading: false })
  },
  fetchAllDocuments: async () => {
    set({ isLoading: true })
    const { getAllDocuments } = await import('@/mock/handlers')
    const documents = await getAllDocuments()
    set({ documents, isLoading: false })
  },
  updateDocument: async (documentId, updates) => {
    const { updateDocument } = await import('@/mock/handlers')
    const updated = await updateDocument(documentId, updates)
    set({
      documents: get().documents.map((d) =>
        d.id === documentId ? { ...d, ...updated } : d
      ),
    })
  },
  deleteDocument: async (documentId) => {
    const { deleteDocument } = await import('@/mock/handlers')
    await deleteDocument(documentId)
    set({
      documents: get().documents.filter((d) => d.id !== documentId),
    })
  },
}))
