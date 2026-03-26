'use client'

import { useCurrentEditor } from '@tiptap/react'
import type { Editor } from '@tiptap/core'

// MUI components & icons
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import FormatBoldIcon from '@mui/icons-material/FormatBold'
import FormatItalicIcon from '@mui/icons-material/FormatItalic'
import FormatStrikethroughIcon from '@mui/icons-material/FormatStrikethrough'
import CodeIcon from '@mui/icons-material/Code'
import FormatClearIcon from '@mui/icons-material/FormatClear'
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft'
import LooksOneIcon from '@mui/icons-material/LooksOne'
import LooksTwoIcon from '@mui/icons-material/LooksTwo'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered'
import DataObjectIcon from '@mui/icons-material/DataObject' // better for code block
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import UndoIcon from '@mui/icons-material/Undo'
import RedoIcon from '@mui/icons-material/Redo'

// Tiptap extensions
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { StarterKit } from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extension-placeholder'
import { EditorProvider } from '@tiptap/react'

interface ToolbarButtonProps {
  icon: React.ReactNode
  label: string
  isActive?: boolean
  disabled?: boolean
  onClick: () => void
}

const ToolbarButton = ({ icon, label, isActive = false, disabled = false, onClick }: ToolbarButtonProps) => (
  <Tooltip title={label} arrow>
    <span> {/* span wrapper prevents Tooltip from disabling focus on disabled buttons */}
      <IconButton
        size="small"
        color={isActive ? 'primary' : 'default'}
        onClick={onClick}
        disabled={disabled}
        sx={{ borderRadius: 1 }}
      >
        {icon}

      </IconButton>
    </span>
  </Tooltip>
)

const EditorToolbar = () => {
  const { editor } = useCurrentEditor()

  if (!editor) return null

  const isActive = (name: string, attrs?: Record<string, any>) => editor.isActive(name, attrs)
  const can = (command: () => boolean) => editor.can().chain().focus()[command.name]?.() ?? false

  return (
    <div className="flex flex-wrap items-center gap-1 p-3 bg-gray-50 border-b">
      <ToolbarButton
        icon={<FormatBoldIcon fontSize="small" />}
        label="Bold (Ctrl+B)"
        isActive={isActive('bolds')}
        disabled={!can(() => editor.commands.toggleBold())}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />

      <ToolbarButton
        icon={<FormatItalicIcon fontSize="small" />}
        label="Italic (Ctrl+I)"
        isActive={isActive('italic')}
        disabled={!can(() => editor.commands.toggleItalic())}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />

      <ToolbarButton
        icon={<FormatStrikethroughIcon fontSize="small" />}
        label="Strikethrough"
        isActive={isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />

      <ToolbarButton
        icon={<CodeIcon fontSize="small" />}
        label="Inline Code"
        isActive={isActive('code')}
        onClick={() => editor.chain().focus().toggleCode().run()}
      />

      <ToolbarButton
        icon={<FormatClearIcon fontSize="small" />}
        label="Clear formatting"
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
      />

      <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 24 }} />

      <ToolbarButton
        icon={<FormatAlignLeftIcon fontSize="small" />}
        label="Paragraph"
        isActive={isActive('paragraph')}
        onClick={() => editor.chain().focus().setParagraph().run()}
      />

      <ToolbarButton
        icon={<LooksOneIcon fontSize="small" />}
        label="Heading 1"
        isActive={isActive('heading', { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      />

      <ToolbarButton
        icon={<LooksTwoIcon fontSize="small" />}
        label="Heading 2"
        isActive={isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />

      <ToolbarButton
        icon={<FormatListBulletedIcon fontSize="small" />}
        label="Bullet List"
        isActive={isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />

      <ToolbarButton
        icon={<FormatListNumberedIcon fontSize="small" />}
        label="Numbered List"
        isActive={isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />

      <ToolbarButton
        icon={<DataObjectIcon fontSize="small" />}
        label="Code Block"
        isActive={isActive('codeBlock')}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      />

      <ToolbarButton
        icon={<FormatQuoteIcon fontSize="small" />}
        label="Blockquote"
        isActive={isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />

      <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 24 }} />

      <ToolbarButton
        icon={<UndoIcon fontSize="small" />}
        label="Undo (Ctrl+Z)"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      />

      <ToolbarButton
        icon={<RedoIcon fontSize="small" />}
        label="Redo (Ctrl+Y)"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      />
    </div>
  )
}

const extensions = [
  Color.configure({ types: ['textStyle'] }),
  TextStyle,
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
    heading: {
      levels: [1, 2, 3], // you can add more levels if needed
    },
  }),
  Placeholder.configure({
    placeholder: 'Start writing something meaningful...',
  }),
]

const initialContent = `
  <h2>Welcome!</h2>
  <p>This is a clean, modern rich text editor built with <strong>Tiptap</strong> and <strong>MUI</strong>.</p>
  <p>Try formatting text, creating lists, code blocks, or quotes.</p>
  <ul>
    <li>Beautiful icons</li>
    <li>Tooltips on hover</li>
    <li>Responsive toolbar</li>
  </ul>
  <pre><code class="language-js">console.log("Hello, world!")</code></pre>
  <blockquote>
    Simplicity is the ultimate sophistication.<br />
    — Leonardo da Vinci
  </blockquote>
`

const EditorCustom = () => {
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
      <EditorProvider
        extensions={extensions}
        content={initialContent}
        slotBefore={
          <>
            <EditorToolbar />
            <Divider />
          </>
        }
        immediatelyRender={true}
      />
    </div>
  )
}

export default EditorCustom
