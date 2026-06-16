import { useSyncExternalStore, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PencilIcon, PinIcon } from '../../../components/Icons'
import { pinnedSessionsStore, type PinnedSessionEntry } from '../../../store/pinnedSessionsStore'

interface PinnedBarProps {
  onSelectSession: (sessionId: string, directory: string) => void
  onRenameSession: (sessionId: string, newTitle: string) => void
}

export function PinnedBar({ onSelectSession, onRenameSession }: PinnedBarProps) {
  const entries = useSyncExternalStore(
    pinnedSessionsStore.subscribe,
    pinnedSessionsStore.getSnapshot,
  )

  if (!entries || entries.length === 0) return null

  return (
    <div className="mx-2 mt-1 mb-1 rounded-lg bg-bg-100/60 ring-1 ring-border-200/30 px-1 py-0.5">
      {entries.map(entry => (
        <PinnedItem
          key={entry.sessionId}
          entry={entry}
          onSelect={onSelectSession}
          onRename={onRenameSession}
        />
      ))}
    </div>
  )
}

interface PinnedItemProps {
  entry: PinnedSessionEntry
  onSelect: (sessionId: string, directory: string) => void
  onRename: (sessionId: string, newTitle: string) => void
}

function PinnedItem({ entry, onSelect, onRename }: PinnedItemProps) {
  const { t } = useTranslation(['commands', 'common'])
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(entry.title)

  const handleClick = () => {
    if (isEditing) return
    onSelect(entry.sessionId, entry.directory)
  }

  const handleUnpin = (e: React.MouseEvent) => {
    e.stopPropagation()
    pinnedSessionsStore.unpin(entry.sessionId)
  }

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditTitle(entry.title)
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    const trimmed = editTitle.trim()
    if (trimmed && trimmed !== entry.title) {
      onRename(entry.sessionId, trimmed)
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditTitle(entry.title)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveEdit()
    else if (e.key === 'Escape') handleCancelEdit()
  }

  if (isEditing) {
    return (
      <div className="px-2 py-1">
        <input
          type="text"
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={handleKeyDown}
          onClick={e => e.stopPropagation()}
          className="w-full bg-bg-000 border border-accent-main-100/50 rounded px-2 py-1 text-[length:var(--fs-sm)] text-text-100 focus:outline-none focus:ring-1 focus:ring-accent-main-100/30"
        />
      </div>
    )
  }

  return (
    <div
      onClick={handleClick}
      className="group relative flex items-center pl-[6px] pr-2 py-1.5 rounded-md cursor-pointer hover:bg-bg-200/40 transition-colors duration-150"
    >
      <PinIcon className="w-3 h-3 shrink-0 mr-1.5 text-accent-main-100/70" />
      <div className="flex-1 min-w-0 mr-1 group-hover:mr-[52px] transition-[margin] duration-200">
        <p className="text-[length:var(--fs-sm)] truncate text-text-200 group-hover:text-text-100" title={entry.title}>
          {entry.title}
        </p>
        {entry.directory && (
          <p className="text-[length:var(--fs-xxs)] truncate text-text-400 mt-0.5" title={entry.directory}>
            {entry.directory.replace(/\\/g, '/').split('/').filter(Boolean).slice(-2).join('/') || entry.directory}
          </p>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-150 z-10">
        <button
          type="button"
          onClick={handleStartEdit}
          className="p-1 rounded hover:bg-bg-300 text-text-500 hover:text-text-200 transition-colors"
          title={t('sessions.rename')}
        >
          <PencilIcon className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={handleUnpin}
          className="p-1 rounded text-accent-main-100 hover:text-accent-main-200 transition-colors"
          title={t('sessions.unpin')}
        >
          <PinIcon className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
