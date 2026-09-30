import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useRef, type ReactNode } from 'react'

export function Sheet({ open, onClose, title, description, children, wide = false }: {
  open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; wide?: boolean
}) {
  const previousFocus = useRef<HTMLElement | null>(null)
  return <Dialog.Root open={open} onOpenChange={value => { if (!value) onClose() }}>
    <Dialog.Portal><Dialog.Overlay className="sheet-overlay" />
      <Dialog.Content className={`sheet ${wide ? 'sheet-wide' : ''}`} onOpenAutoFocus={() => { previousFocus.current = document.activeElement as HTMLElement }} onCloseAutoFocus={event => { event.preventDefault(); previousFocus.current?.focus() }}>
        <div className="sheet-handle" aria-hidden="true" />
        <div className="sheet-heading"><Dialog.Title>{title}</Dialog.Title><Dialog.Close className="icon-button" aria-label="Close dialog"><X size={21} /></Dialog.Close></div>
        <Dialog.Description className={description ? 'sheet-description' : 'sr-only'}>{description || title}</Dialog.Description>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
}
