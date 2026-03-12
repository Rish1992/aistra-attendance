import { RouterProvider } from 'react-router'
import { router } from '@/router'
import { Tooltip } from 'radix-ui'
import { Toaster } from '@/components/ui/sonner'

function App() {
  return (
    <Tooltip.Provider delayDuration={200}>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" richColors closeButton />
    </Tooltip.Provider>
  )
}

export default App
