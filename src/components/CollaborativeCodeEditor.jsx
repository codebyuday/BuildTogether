import { useEffect, useRef } from 'react'
import * as Y from 'yjs'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { json } from '@codemirror/lang-json'
import { yCollab } from 'y-codemirror.next'
import { SupabaseProvider } from '@supabase-labs/y-supabase'
import { supabase } from '../lib/supabase'

const LANG_MAP = {
  javascript: () => javascript(),
  jsx: () => javascript({ jsx: true }),
  typescript: () => javascript({ typescript: true }),
  tsx: () => javascript({ jsx: true, typescript: true }),
  python: () => python(),
  html: () => html(),
  css: () => css(),
  json: () => json(),
}

export default function CollaborativeCodeEditor({ roomId, fileId, language = 'javascript', initialContent = '', onChange }) {
  const containerRef = useRef(null)
  const viewRef = useRef(null)
  const onChangeRef = useRef(onChange)
  const initialContentRef = useRef(initialContent)

  useEffect(() => { onChangeRef.current = onChange }, [onChange])
  useEffect(() => { initialContentRef.current = initialContent }, [initialContent])

  useEffect(() => {
    if (!containerRef.current) return

    const ydoc = new Y.Doc()
    const provider = new SupabaseProvider(roomId, ydoc, supabase, {
      awareness: true,
      persistence: true,
    })

    provider.awareness?.setLocalStateField('user', {
      name: 'User-' + Math.random().toString(36).slice(2, 6),
      color: '#3b82f6',
    })

    const ytext = ydoc.getText('code')
    const undoManager = new Y.UndoManager(ytext)

    if (ytext.toString() === '' && initialContentRef.current) {
      ytext.insert(0, initialContentRef.current)
    }

    const langExtension = LANG_MAP[language]?.() || javascript()
    let saveTimeout = null

    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        basicSetup,
        langExtension,
        yCollab(ytext, provider.awareness, { undoManager }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && onChangeRef.current) {
            if (saveTimeout) clearTimeout(saveTimeout)
            saveTimeout = setTimeout(() => {
              onChangeRef.current(ytext.toString())
            }, 800)
          }
        }),
      ],
    })

    viewRef.current = new EditorView({ state, parent: containerRef.current })

    return () => {
      if (saveTimeout) clearTimeout(saveTimeout)
      viewRef.current?.destroy()
      provider.destroy()
      ydoc.destroy()
    }
  }, [roomId, fileId, language])

  return <div ref={containerRef} className="h-full min-h-[400px]" />
}
