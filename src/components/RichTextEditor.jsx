import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'

const MenuBar = ({ editor }) => {
  if (!editor) return null
  const btn = (action, icon, active = false) => (
    <button key={icon} type="button" onClick={action}
      className={`p-1.5 rounded transition ${active ? 'bg-primary/10 text-primary' : 'text-muted hover:text-on-surface hover:bg-surface-container-high'}`}>
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
    </button>
  )
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-line px-2 py-1">
      {btn(() => editor.chain().focus().toggleBold().run(), 'format_bold', editor.isActive('bold'))}
      {btn(() => editor.chain().focus().toggleItalic().run(), 'format_italic', editor.isActive('italic'))}
      {btn(() => editor.chain().focus().toggleCode().run(), 'code', editor.isActive('code'))}
      <span className="w-px h-4 bg-line mx-1" />
      {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'title', editor.isActive('heading', { level: 2 }))}
      {btn(() => editor.chain().focus().toggleBulletList().run(), 'format_list_bulleted', editor.isActive('bulletList'))}
      {btn(() => editor.chain().focus().toggleOrderedList().run(), 'format_list_numbered', editor.isActive('orderedList'))}
      {btn(() => editor.chain().focus().toggleTaskList().run(), 'checklist', editor.isActive('taskList'))}
      <span className="w-px h-4 bg-line mx-1" />
      {btn(() => editor.chain().focus().toggleBlockquote().run(), 'format_quote', editor.isActive('blockquote'))}
      {btn(() => editor.chain().focus().setHorizontalRule().run(), 'horizontal_rule')}
    </div>
  )
}

export default function RichTextEditor({ content, onChange, placeholder = 'Write something...' }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[120px] px-3 py-2 focus:outline-none text-on-surface [&_.is-empty]:before:text-muted/40 [&_.is-empty]:before:content-[attr(data-placeholder)]',
      },
    },
  })

  return (
    <div className="border border-line rounded-lg overflow-hidden bg-white">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
