'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { useEffect, useCallback, useState } from 'react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Highlighter,
  Minus,
  Type,
  Palette,
  Box,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { createLowlight } from 'lowlight'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'

const lowlight = createLowlight()
lowlight.register('javascript', javascript)
lowlight.register('python', python)


// Callout box templates
const CALLOUT_TEMPLATES = {
  info: {
    label: 'Info Box',
    icon: Info,
    style: 'background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 1.25em 1.5em; margin: 1.5em 0; border-radius: 0 8px 8px 0;',
    textColor: '#1e40af'
  },
  success: {
    label: 'Success Box',
    icon: CheckCircle,
    style: 'background-color: #d1fae5; border-left: 4px solid #10b981; padding: 1.25em 1.5em; margin: 1.5em 0; border-radius: 0 8px 8px 0;',
    textColor: '#065f46'
  },
  warning: {
    label: 'Warning Box',
    icon: AlertTriangle,
    style: 'background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 1.25em 1.5em; margin: 1.5em 0; border-radius: 0 8px 8px 0;',
    textColor: '#92400e'
  },
  error: {
    label: 'Error Box',
    icon: AlertCircle,
    style: 'background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 1.25em 1.5em; margin: 1.5em 0; border-radius: 0 8px 8px 0;',
    textColor: '#991b1b'
  },
  neutral: {
    label: 'Neutral Box',
    icon: Box,
    style: 'background-color: #f3f4f6; border-left: 4px solid #6b7280; padding: 1.25em 1.5em; margin: 1.5em 0; border-radius: 0 8px 8px 0;',
    textColor: '#374151'
  },
}

// Heading style templates
const HEADING_STYLES = {
  h2Blue: {
    label: 'H2 - Blue Accent',
    style: 'font-size: 1.75em; font-weight: 700; color: #1a1a1a; margin-top: 2em; margin-bottom: 1em; border-left: 4px solid #3b82f6; padding-left: 0.75em;'
  },
  h2Green: {
    label: 'H2 - Green Accent',
    style: 'font-size: 1.75em; font-weight: 700; color: #1a1a1a; margin-top: 2em; margin-bottom: 1em; border-left: 4px solid #10b981; padding-left: 0.75em;'
  },
  h2Purple: {
    label: 'H2 - Purple Accent',
    style: 'font-size: 1.75em; font-weight: 700; color: #1a1a1a; margin-top: 2em; margin-bottom: 1em; border-left: 4px solid #8b5cf6; padding-left: 0.75em;'
  },
  h2Orange: {
    label: 'H2 - Orange Accent',
    style: 'font-size: 1.75em; font-weight: 700; color: #1a1a1a; margin-top: 2em; margin-bottom: 1em; border-left: 4px solid #f59e0b; padding-left: 0.75em;'
  },
  h3Regular: {
    label: 'H3 - Regular',
    style: 'font-size: 1.25em; font-weight: 600; color: #374151; margin-top: 2em; margin-bottom: 1em;'
  },
}

// Color palette
const COLORS = [
  { name: 'Default', value: null },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
]

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#fef08a' },
  { name: 'Green', value: '#bbf7d0' },
  { name: 'Blue', value: '#bfdbfe' },
  { name: 'Purple', value: '#e9d5ff' },
  { name: 'Pink', value: '#fbcfe8' },
  { name: 'Orange', value: '#fed7aa' },
]

export default function TiptapEditor({ content, onChange, placeholder = 'Start writing your post...' }) {
  const [linkUrl, setLinkUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
        codeBlock: false,
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: content?.json || content || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => {
      onChange({
        json: editor.getJSON(),
        html: editor.getHTML(),
      })
    },
  })

  useEffect(() => {
    if (!editor || !content) return

    const current = editor.getJSON()
    const incoming = content?.json || content

    if (JSON.stringify(current) !== JSON.stringify(incoming)) {
      editor.commands.setContent(incoming)
    }
  }, [content, editor])

  const insertCallout = useCallback((type) => {
    if (!editor) return
    const template = CALLOUT_TEMPLATES[type]
    const html = `<div style="${template.style}"><p style="line-height: 1.8; margin: 0; color: ${template.textColor};">Your content here...</p></div><p></p>`
    editor.chain().focus().insertContent(html).run()
  }, [editor])

  const insertStyledHeading = useCallback((type, level) => {
    if (!editor) return
    const template = HEADING_STYLES[type]
    const tag = `h${level}`
    const html = `<${tag} style="${template.style}">Your heading here</${tag}><p></p>`
    editor.chain().focus().insertContent(html).run()
  }, [editor])

  const setLink = useCallback(() => {
    if (!editor || !linkUrl) return
    
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    setLinkUrl('')
  }, [editor, linkUrl])

  const addImage = useCallback(() => {
    if (!editor || !imageUrl) return
    editor.chain().focus().setImage({ src: imageUrl }).run()
    setImageUrl('')
  }, [editor, imageUrl])

  const insertComparisonCard = useCallback((type) => {
    if (!editor) return
    
    const styles = {
      generative: {
        bg: '#dbeafe',
        color: '#1e40af',
        label: 'Generative AI'
      },
      agentic: {
        bg: '#d1fae5',
        color: '#065f46',
        label: 'Agentic AI'
      }
    }
    
    const s = styles[type]
    const html = `<div style="background-color: ${s.bg}; padding: 0.75em 1em; border-radius: 6px; margin-bottom: 0.5em;"><strong style="color: ${s.color};">${s.label}:</strong> <span style="color: #374151;">Your description here...</span></div>`
    editor.chain().focus().insertContent(html).run()
  }, [editor])

  const insertComparisonBlock = useCallback(() => {
    if (!editor) return
    
    const html = `
      <div style="background-color: #f9fafb; padding: 1.5em; margin-bottom: 1.5em; border-radius: 8px; border: 1px solid #e5e7eb;">
        <h4 style="font-size: 1.1em; font-weight: 600; color: #1f2937; margin-top: 0; margin-bottom: 1em;">Comparison Title</h4>
        <div style="display: flex; flex-direction: column; gap: 0.75em;">
          <div style="background-color: #dbeafe; padding: 0.75em 1em; border-radius: 6px;">
            <strong style="color: #1e40af;">Generative AI:</strong> <span style="color: #374151;">Description here...</span>
          </div>
          <div style="background-color: #d1fae5; padding: 0.75em 1em; border-radius: 6px;">
            <strong style="color: #065f46;">Agentic AI:</strong> <span style="color: #374151;">Description here...</span>
          </div>
        </div>
      </div>
    `
    editor.chain().focus().insertContent(html).run()
  }, [editor])

  const insertHorizontalRule = useCallback(() => {
    if (!editor) return
    const html = `<hr style="border: none; border-top: 2px solid #e0e0e0; margin: 3em 0;">`
    editor.chain().focus().insertContent(html).run()
  }, [editor])

  if (!editor) {
    return (
      <div className="border rounded-lg p-4 min-h-[500px] flex items-center justify-center">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1">
        
        {/* Text Formatting */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(editor.isActive('bold') && 'bg-muted')}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(editor.isActive('italic') && 'bg-muted')}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn(editor.isActive('underline') && 'bg-muted')}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={cn(editor.isActive('strike') && 'bg-muted')}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={cn(editor.isActive('code') && 'bg-muted')}
            title="Inline Code"
          >
            <Code className="h-4 w-4" />
          </Button>
          {/* Tables */}
          <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
            {/* Insert Table */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
              }
              title="Insert Table"
            >
              📊
            </Button>

            {/* Add Row */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              disabled={!editor.can().addRowAfter()}
              title="Add Row"
            >
              ➕Row
            </Button>

            {/* Add Column */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              disabled={!editor.can().addColumnAfter()}
              title="Add Column"
            >
              ➕Col
            </Button>

            {/* Delete Row */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().deleteRow().run()}
              disabled={!editor.can().deleteRow()}
              title="Delete Row"
            >
              ❌Row
            </Button>

            {/* Delete Column */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              disabled={!editor.can().deleteColumn()}
              title="Delete Column"
            >
              ❌Col
            </Button>

            {/* Delete Table */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().deleteTable().run()}
              disabled={!editor.can().deleteTable()}
              title="Delete Table"
            >
              🗑
            </Button>
          </div>
        </div>

        {/* Headings Dropdown */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" title="Headings">
                <Type className="h-4 w-4 mr-1" />
                <span className="text-xs">Heading</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Basic Headings</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                <Heading1 className="h-4 w-4 mr-2" /> Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                <Heading2 className="h-4 w-4 mr-2" /> Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                <Heading3 className="h-4 w-4 mr-2" /> Heading 3
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
                <Type className="h-4 w-4 mr-2" /> Paragraph
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Styled Headings</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => insertStyledHeading('h2Blue', 2)}>
                <span className="w-3 h-3 bg-blue-500 rounded mr-2" /> H2 - Blue Accent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertStyledHeading('h2Green', 2)}>
                <span className="w-3 h-3 bg-green-500 rounded mr-2" /> H2 - Green Accent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertStyledHeading('h2Purple', 2)}>
                <span className="w-3 h-3 bg-purple-500 rounded mr-2" /> H2 - Purple Accent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertStyledHeading('h2Orange', 2)}>
                <span className="w-3 h-3 bg-orange-500 rounded mr-2" /> H2 - Orange Accent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(editor.isActive('bulletList') && 'bg-muted')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(editor.isActive('orderedList') && 'bg-muted')}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(editor.isActive('blockquote') && 'bg-muted')}
            title="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={cn(editor.isActive({ textAlign: 'left' }) && 'bg-muted')}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={cn(editor.isActive({ textAlign: 'center' }) && 'bg-muted')}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={cn(editor.isActive({ textAlign: 'right' }) && 'bg-muted')}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Text Color */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" title="Text Color">
                <Palette className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Text Color</DropdownMenuLabel>
              {COLORS.map((color) => (
                <DropdownMenuItem
                  key={color.name}
                  onClick={() => color.value ? editor.chain().focus().setColor(color.value).run() : editor.chain().focus().unsetColor().run()}
                >
                  <span 
                    className="w-4 h-4 rounded border mr-2" 
                    style={{ backgroundColor: color.value || '#000' }}
                  />
                  {color.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Highlight Color */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" title="Highlight">
                <Highlighter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Highlight Color</DropdownMenuLabel>
              {HIGHLIGHT_COLORS.map((color) => (
                <DropdownMenuItem
                  key={color.name}
                  onClick={() => editor.chain().focus().toggleHighlight({ color: color.value }).run()}
                >
                  <span 
                    className="w-4 h-4 rounded border mr-2" 
                    style={{ backgroundColor: color.value }}
                  />
                  {color.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => editor.chain().focus().unsetHighlight().run()}>
                Remove Highlight
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Callout Boxes */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" title="Callout Boxes">
                <Box className="h-4 w-4 mr-1" />
                <span className="text-xs">Callout</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Callout Boxes</DropdownMenuLabel>
              {Object.entries(CALLOUT_TEMPLATES).map(([key, template]) => {
                const Icon = template.icon
                return (
                  <DropdownMenuItem key={key} onClick={() => insertCallout(key)}>
                    <Icon className="h-4 w-4 mr-2" />
                    {template.label}
                  </DropdownMenuItem>
                )
              })}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Comparison Cards</DropdownMenuLabel>
              <DropdownMenuItem onClick={insertComparisonBlock}>
                <Box className="h-4 w-4 mr-2" />
                Full Comparison Block
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertComparisonCard('generative')}>
                <span className="w-3 h-3 bg-blue-500 rounded mr-2" />
                Generative AI Card
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertComparisonCard('agentic')}>
                <span className="w-3 h-3 bg-green-500 rounded mr-2" />
                Agentic AI Card
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Insert Elements */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
          {/* Horizontal Rule */}
          <Button
            variant="ghost"
            size="sm"
            onClick={insertHorizontalRule}
            title="Horizontal Rule"
          >
            <Minus className="h-4 w-4" />
          </Button>

          {/* Link */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" title="Insert Link">
                <LinkIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <Label htmlFor="link-url">Link URL</Label>
                <Input
                  id="link-url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={setLink}>Add Link</Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => editor.chain().focus().unsetLink().run()}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Image */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" title="Insert Image">
                <ImageIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <Button size="sm" onClick={addImage}>Insert Image</Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bubble Menu (appears on text selection) */}
      {editor && (
        <BubbleMenu editor={editor}>
          <div className="bg-background border rounded-lg shadow-lg flex gap-0.5 p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn('h-8 w-8 p-0', editor.isActive('bold') && 'bg-muted')}
            >
              <Bold className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn('h-8 w-8 p-0', editor.isActive('italic') && 'bg-muted')}
            >
              <Italic className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={cn('h-8 w-8 p-0', editor.isActive('underline') && 'bg-muted')}
            >
              <UnderlineIcon className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()}
              className={cn('h-8 w-8 p-0', editor.isActive('highlight') && 'bg-muted')}
            >
              <Highlighter className="h-3 w-3" />
            </Button>
            
            {/* Table Controls (only visible inside table) */}
            {editor.isActive('table') && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                >
                  +Row
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                >
                  +Col
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().deleteRow().run()}
                >
                  Del Row
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                >
                  Del Col
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().deleteTable().run()}
                >
                  Delete Table
                </Button>
              </>
            )}
          </div>
        </BubbleMenu>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} className="min-h-[400px]" />

      {/* Footer with Word Count */}
      <div className="border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground flex justify-between">
        <span>
          {editor.getText().length} characters
        </span>
        <span>
          {editor.getText().split(/\s+/).filter(Boolean).length} words
        </span>
      </div>
    </div>
  )
}

// 'use client'

// import { useEditor, EditorContent} from '@tiptap/react'
// import { BubbleMenu } from '@tiptap/react/menus'
// import StarterKit from '@tiptap/starter-kit'
// import Underline from '@tiptap/extension-underline'
// import TextAlign from '@tiptap/extension-text-align'
// import Highlight from '@tiptap/extension-highlight'
// import Link from '@tiptap/extension-link'
// import Image from '@tiptap/extension-image'
// import Placeholder from '@tiptap/extension-placeholder'
// import { TextStyle } from '@tiptap/extension-text-style'
// import { Color } from '@tiptap/extension-color'
// import { useEffect, useCallback, useState } from 'react'
// import {
//   Bold,
//   Italic,
//   Underline as UnderlineIcon,
//   Strikethrough,
//   Code,
//   Heading1,
//   Heading2,
//   Heading3,
//   List,
//   ListOrdered,
//   Quote,
//   Undo,
//   Redo,
//   AlignLeft,
//   AlignCenter,
//   AlignRight,
//   Link as LinkIcon,
//   Image as ImageIcon,
//   Highlighter,
//   Minus,
//   Type,
//   Palette,
//   Box,
//   AlertCircle,
//   CheckCircle,
//   Info,
//   AlertTriangle,
// } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator,
//   DropdownMenuLabel,
// } from '@/components/ui/dropdown-menu'
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { cn } from '@/lib/utils'
// import { Table } from '@tiptap/extension-table'
// import { TableRow } from '@tiptap/extension-table-row'
// import { TableHeader } from '@tiptap/extension-table-header'
// import { TableCell } from '@tiptap/extension-table-cell'
// import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
// import { createLowlight } from 'lowlight'
// import javascript from 'highlight.js/lib/languages/javascript'
// import python from 'highlight.js/lib/languages/python'

// const lowlight = createLowlight()
// lowlight.register('javascript', javascript)
// lowlight.register('python', python)


// // Callout box templates
// const CALLOUT_TEMPLATES = {
//   info: {
//     label: 'Info Box',
//     icon: Info,
//     style: 'background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 1.25em 1.5em; margin: 1.5em 0; border-radius: 0 8px 8px 0;',
//     textColor: '#1e40af'
//   },
//   success: {
//     label: 'Success Box',
//     icon: CheckCircle,
//     style: 'background-color: #d1fae5; border-left: 4px solid #10b981; padding: 1.25em 1.5em; margin: 1.5em 0; border-radius: 0 8px 8px 0;',
//     textColor: '#065f46'
//   },
//   warning: {
//     label: 'Warning Box',
//     icon: AlertTriangle,
//     style: 'background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 1.25em 1.5em; margin: 1.5em 0; border-radius: 0 8px 8px 0;',
//     textColor: '#92400e'
//   },
//   error: {
//     label: 'Error Box',
//     icon: AlertCircle,
//     style: 'background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 1.25em 1.5em; margin: 1.5em 0; border-radius: 0 8px 8px 0;',
//     textColor: '#991b1b'
//   },
//   neutral: {
//     label: 'Neutral Box',
//     icon: Box,
//     style: 'background-color: #f3f4f6; border-left: 4px solid #6b7280; padding: 1.25em 1.5em; margin: 1.5em 0; border-radius: 0 8px 8px 0;',
//     textColor: '#374151'
//   },
// }

// // Heading style templates
// const HEADING_STYLES = {
//   h2Blue: {
//     label: 'H2 - Blue Accent',
//     style: 'font-size: 1.75em; font-weight: 700; color: #1a1a1a; margin-top: 2em; margin-bottom: 1em; border-left: 4px solid #3b82f6; padding-left: 0.75em;'
//   },
//   h2Green: {
//     label: 'H2 - Green Accent',
//     style: 'font-size: 1.75em; font-weight: 700; color: #1a1a1a; margin-top: 2em; margin-bottom: 1em; border-left: 4px solid #10b981; padding-left: 0.75em;'
//   },
//   h2Purple: {
//     label: 'H2 - Purple Accent',
//     style: 'font-size: 1.75em; font-weight: 700; color: #1a1a1a; margin-top: 2em; margin-bottom: 1em; border-left: 4px solid #8b5cf6; padding-left: 0.75em;'
//   },
//   h2Orange: {
//     label: 'H2 - Orange Accent',
//     style: 'font-size: 1.75em; font-weight: 700; color: #1a1a1a; margin-top: 2em; margin-bottom: 1em; border-left: 4px solid #f59e0b; padding-left: 0.75em;'
//   },
//   h3Regular: {
//     label: 'H3 - Regular',
//     style: 'font-size: 1.25em; font-weight: 600; color: #374151; margin-top: 2em; margin-bottom: 1em;'
//   },
// }

// // Color palette
// const COLORS = [
//   { name: 'Default', value: null },
//   { name: 'Gray', value: '#6b7280' },
//   { name: 'Red', value: '#ef4444' },
//   { name: 'Orange', value: '#f97316' },
//   { name: 'Yellow', value: '#eab308' },
//   { name: 'Green', value: '#22c55e' },
//   { name: 'Blue', value: '#3b82f6' },
//   { name: 'Purple', value: '#8b5cf6' },
//   { name: 'Pink', value: '#ec4899' },
// ]

// const HIGHLIGHT_COLORS = [
//   { name: 'Yellow', value: '#fef08a' },
//   { name: 'Green', value: '#bbf7d0' },
//   { name: 'Blue', value: '#bfdbfe' },
//   { name: 'Purple', value: '#e9d5ff' },
//   { name: 'Pink', value: '#fbcfe8' },
//   { name: 'Orange', value: '#fed7aa' },
// ]

// export default function TiptapEditor({ content, onChange, placeholder = 'Start writing your post...' }) {
//   const [linkUrl, setLinkUrl] = useState('')
//   const [imageUrl, setImageUrl] = useState('')

//   const editor = useEditor({
//     extensions: [
//       StarterKit.configure({
//         heading: {
//           levels: [1, 2, 3, 4],
//         },
//         codeBlock: false,
//       }),
//       Underline,
//       TextStyle,
//       Color,
//       Highlight.configure({
//         multicolor: true,
//       }),
//       TextAlign.configure({
//         types: ['heading', 'paragraph'],
//       }),
//       Link.configure({
//         openOnClick: false,
//         HTMLAttributes: {
//           class: 'text-blue-600 underline hover:text-blue-800',
//         },
//       }),
//       Image.configure({
//         HTMLAttributes: {
//           class: 'rounded-lg max-w-full h-auto my-4',
//         },
//       }),
//       Placeholder.configure({
//         placeholder,
//       }),
//       Table.configure({
//         resizable: true,
//       }),
//       TableRow,
//       TableHeader,
//       TableCell,
//       CodeBlockLowlight.configure({
//         lowlight,
//       }),
//     ],
//     content: content?.json || content || '',
//     immediatelyRender: false,
//     editorProps: {
//       attributes: {
//         class: 'max-w-none focus:outline-none min-h-[400px] px-4 py-3 text-black',
//       },
//     },
//     onUpdate: ({ editor }) => {
//       onChange({
//         json: editor.getJSON(),
//         html: editor.getHTML(),
//       })
//     },
//   })

//   useEffect(() => {
//     if (!editor || !content) return

//     const current = editor.getJSON()
//     const incoming = content?.json || content

//     if (JSON.stringify(current) !== JSON.stringify(incoming)) {
//       editor.commands.setContent(incoming)
//     }
//   }, [content, editor])

//   const insertCallout = useCallback((type) => {
//     if (!editor) return
//     const template = CALLOUT_TEMPLATES[type]
//     const html = `<div style="${template.style}"><p style="line-height: 1.8; margin: 0; color: ${template.textColor};">Your content here...</p></div><p></p>`
//     editor.chain().focus().insertContent(html).run()
//   }, [editor])

//   const insertStyledHeading = useCallback((type, level) => {
//     if (!editor) return
//     const template = HEADING_STYLES[type]
//     const tag = `h${level}`
//     const html = `<${tag} style="${template.style}">Your heading here</${tag}><p></p>`
//     editor.chain().focus().insertContent(html).run()
//   }, [editor])

//   const setLink = useCallback(() => {
//     if (!editor || !linkUrl) return
    
//     if (linkUrl === '') {
//       editor.chain().focus().extendMarkRange('link').unsetLink().run()
//       return
//     }

//     editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
//     setLinkUrl('')
//   }, [editor, linkUrl])

//   const addImage = useCallback(() => {
//     if (!editor || !imageUrl) return
//     editor.chain().focus().setImage({ src: imageUrl }).run()
//     setImageUrl('')
//   }, [editor, imageUrl])

//   const insertComparisonCard = useCallback((type) => {
//     if (!editor) return
    
//     const styles = {
//       generative: {
//         bg: '#dbeafe',
//         color: '#1e40af',
//         label: 'Generative AI'
//       },
//       agentic: {
//         bg: '#d1fae5',
//         color: '#065f46',
//         label: 'Agentic AI'
//       }
//     }
    
//     const s = styles[type]
//     const html = `<div style="background-color: ${s.bg}; padding: 0.75em 1em; border-radius: 6px; margin-bottom: 0.5em;"><strong style="color: ${s.color};">${s.label}:</strong> <span style="color: #374151;">Your description here...</span></div>`
//     editor.chain().focus().insertContent(html).run()
//   }, [editor])

//   const insertComparisonBlock = useCallback(() => {
//     if (!editor) return
    
//     const html = `
//       <div style="background-color: #f9fafb; padding: 1.5em; margin-bottom: 1.5em; border-radius: 8px; border: 1px solid #e5e7eb;">
//         <h4 style="font-size: 1.1em; font-weight: 600; color: #1f2937; margin-top: 0; margin-bottom: 1em;">Comparison Title</h4>
//         <div style="display: flex; flex-direction: column; gap: 0.75em;">
//           <div style="background-color: #dbeafe; padding: 0.75em 1em; border-radius: 6px;">
//             <strong style="color: #1e40af;">Generative AI:</strong> <span style="color: #374151;">Description here...</span>
//           </div>
//           <div style="background-color: #d1fae5; padding: 0.75em 1em; border-radius: 6px;">
//             <strong style="color: #065f46;">Agentic AI:</strong> <span style="color: #374151;">Description here...</span>
//           </div>
//         </div>
//       </div>
//     `
//     editor.chain().focus().insertContent(html).run()
//   }, [editor])

//   const insertHorizontalRule = useCallback(() => {
//     if (!editor) return
//     const html = `<hr style="border: none; border-top: 2px solid #e0e0e0; margin: 3em 0;">`
//     editor.chain().focus().insertContent(html).run()
//   }, [editor])

//   if (!editor) {
//     return (
//       <div className="border rounded-lg p-4 min-h-[500px] flex items-center justify-center">
//         <div className="text-muted-foreground">Loading editor...</div>
//       </div>
//     )
//   }

//   return (
//     <div className="border rounded-lg overflow-hidden">
//       {/* Toolbar */}
//       <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1">
        
//         {/* Text Formatting */}
//         <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => editor.chain().focus().toggleBold().run()}
//             className={cn(editor.isActive('bold') && 'bg-muted')}
//             title="Bold"
//           >
//             <Bold className="h-4 w-4" />
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => editor.chain().focus().toggleItalic().run()}
//             className={cn(editor.isActive('italic') && 'bg-muted')}
//             title="Italic"
//           >
//             <Italic className="h-4 w-4" />
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => editor.chain().focus().toggleUnderline().run()}
//             className={cn(editor.isActive('underline') && 'bg-muted')}
//             title="Underline"
//           >
//             <UnderlineIcon className="h-4 w-4" />
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => editor.chain().focus().toggleStrike().run()}
//             className={cn(editor.isActive('strike') && 'bg-muted')}
//             title="Strikethrough"
//           >
//             <Strikethrough className="h-4 w-4" />
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => editor.chain().focus().toggleCode().run()}
//             className={cn(editor.isActive('code') && 'bg-muted')}
//             title="Inline Code"
//           >
//             <Code className="h-4 w-4" />
//           </Button>
//           {/* Tables */}
//           <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
//             {/* Insert Table */}
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() =>
//                 editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
//               }
//               title="Insert Table"
//             >
//               📊
//             </Button>

//             {/* Add Row */}
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => editor.chain().focus().addRowAfter().run()}
//               disabled={!editor.can().addRowAfter()}
//               title="Add Row"
//             >
//               ➕Row
//             </Button>

//             {/* Add Column */}
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => editor.chain().focus().addColumnAfter().run()}
//               disabled={!editor.can().addColumnAfter()}
//               title="Add Column"
//             >
//               ➕Col
//             </Button>

//             {/* Delete Row */}
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => editor.chain().focus().deleteRow().run()}
//               disabled={!editor.can().deleteRow()}
//               title="Delete Row"
//             >
//               ❌Row
//             </Button>

//             {/* Delete Column */}
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => editor.chain().focus().deleteColumn().run()}
//               disabled={!editor.can().deleteColumn()}
//               title="Delete Column"
//             >
//               ❌Col
//             </Button>

//             {/* Delete Table */}
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => editor.chain().focus().deleteTable().run()}
//               disabled={!editor.can().deleteTable()}
//               title="Delete Table"
//             >
//               🗑
//             </Button>
//           </div>
//         </div>

//         {/* Headings Dropdown */}
//         <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="sm" title="Headings">
//                 <Type className="h-4 w-4 mr-1" />
//                 <span className="text-xs">Heading</span>
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent>
//               <DropdownMenuLabel>Basic Headings</DropdownMenuLabel>
//               <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
//                 <Heading1 className="h-4 w-4 mr-2" /> Heading 1
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
//                 <Heading2 className="h-4 w-4 mr-2" /> Heading 2
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
//                 <Heading3 className="h-4 w-4 mr-2" /> Heading 3
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
//                 <Type className="h-4 w-4 mr-2" /> Paragraph
//               </DropdownMenuItem>
//               <DropdownMenuSeparator />
//               <DropdownMenuLabel>Styled Headings</DropdownMenuLabel>
//               <DropdownMenuItem onClick={() => insertStyledHeading('h2Blue', 2)}>
//                 <span className="w-3 h-3 bg-blue-500 rounded mr-2" /> H2 - Blue Accent
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => insertStyledHeading('h2Green', 2)}>
//                 <span className="w-3 h-3 bg-green-500 rounded mr-2" /> H2 - Green Accent
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => insertStyledHeading('h2Purple', 2)}>
//                 <span className="w-3 h-3 bg-purple-500 rounded mr-2" /> H2 - Purple Accent
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => insertStyledHeading('h2Orange', 2)}>
//                 <span className="w-3 h-3 bg-orange-500 rounded mr-2" /> H2 - Orange Accent
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>

//         {/* Lists */}
//         <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => editor.chain().focus().toggleBulletList().run()}
//             className={cn(editor.isActive('bulletList') && 'bg-muted')}
//             title="Bullet List"
//           >
//             <List className="h-4 w-4" />
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => editor.chain().focus().toggleOrderedList().run()}
//             className={cn(editor.isActive('orderedList') && 'bg-muted')}
//             title="Numbered List"
//           >
//             <ListOrdered className="h-4 w-4" />
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => editor.chain().focus().toggleBlockquote().run()}
//             className={cn(editor.isActive('blockquote') && 'bg-muted')}
//             title="Blockquote"
//           >
//             <Quote className="h-4 w-4" />
//           </Button>
//         </div>

//         {/* Alignment */}
//         <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => editor.chain().focus().setTextAlign('left').run()}
//             className={cn(editor.isActive({ textAlign: 'left' }) && 'bg-muted')}
//             title="Align Left"
//           >
//             <AlignLeft className="h-4 w-4" />
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => editor.chain().focus().setTextAlign('center').run()}
//             className={cn(editor.isActive({ textAlign: 'center' }) && 'bg-muted')}
//             title="Align Center"
//           >
//             <AlignCenter className="h-4 w-4" />
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => editor.chain().focus().setTextAlign('right').run()}
//             className={cn(editor.isActive({ textAlign: 'right' }) && 'bg-muted')}
//             title="Align Right"
//           >
//             <AlignRight className="h-4 w-4" />
//           </Button>
//         </div>

//         {/* Text Color */}
//         <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="sm" title="Text Color">
//                 <Palette className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent>
//               <DropdownMenuLabel>Text Color</DropdownMenuLabel>
//               {COLORS.map((color) => (
//                 <DropdownMenuItem
//                   key={color.name}
//                   onClick={() => color.value ? editor.chain().focus().setColor(color.value).run() : editor.chain().focus().unsetColor().run()}
//                 >
//                   <span 
//                     className="w-4 h-4 rounded border mr-2" 
//                     style={{ backgroundColor: color.value || '#000' }}
//                   />
//                   {color.name}
//                 </DropdownMenuItem>
//               ))}
//             </DropdownMenuContent>
//           </DropdownMenu>

//           {/* Highlight Color */}
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="sm" title="Highlight">
//                 <Highlighter className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent>
//               <DropdownMenuLabel>Highlight Color</DropdownMenuLabel>
//               {HIGHLIGHT_COLORS.map((color) => (
//                 <DropdownMenuItem
//                   key={color.name}
//                   onClick={() => editor.chain().focus().toggleHighlight({ color: color.value }).run()}
//                 >
//                   <span 
//                     className="w-4 h-4 rounded border mr-2" 
//                     style={{ backgroundColor: color.value }}
//                   />
//                   {color.name}
//                 </DropdownMenuItem>
//               ))}
//               <DropdownMenuSeparator />
//               <DropdownMenuItem onClick={() => editor.chain().focus().unsetHighlight().run()}>
//                 Remove Highlight
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>

//         {/* Callout Boxes */}
//         <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="sm" title="Callout Boxes">
//                 <Box className="h-4 w-4 mr-1" />
//                 <span className="text-xs">Callout</span>
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent>
//               <DropdownMenuLabel>Callout Boxes</DropdownMenuLabel>
//               {Object.entries(CALLOUT_TEMPLATES).map(([key, template]) => {
//                 const Icon = template.icon
//                 return (
//                   <DropdownMenuItem key={key} onClick={() => insertCallout(key)}>
//                     <Icon className="h-4 w-4 mr-2" />
//                     {template.label}
//                   </DropdownMenuItem>
//                 )
//               })}
//               <DropdownMenuSeparator />
//               <DropdownMenuLabel>Comparison Cards</DropdownMenuLabel>
//               <DropdownMenuItem onClick={insertComparisonBlock}>
//                 <Box className="h-4 w-4 mr-2" />
//                 Full Comparison Block
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => insertComparisonCard('generative')}>
//                 <span className="w-3 h-3 bg-blue-500 rounded mr-2" />
//                 Generative AI Card
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => insertComparisonCard('agentic')}>
//                 <span className="w-3 h-3 bg-green-500 rounded mr-2" />
//                 Agentic AI Card
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>

//         {/* Insert Elements */}
//         <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
//           {/* Horizontal Rule */}
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={insertHorizontalRule}
//             title="Horizontal Rule"
//           >
//             <Minus className="h-4 w-4" />
//           </Button>

//           {/* Link */}
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button variant="ghost" size="sm" title="Insert Link">
//                 <LinkIcon className="h-4 w-4" />
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-80">
//               <div className="space-y-3">
//                 <Label htmlFor="link-url">Link URL</Label>
//                 <Input
//                   id="link-url"
//                   value={linkUrl}
//                   onChange={(e) => setLinkUrl(e.target.value)}
//                   placeholder="https://example.com"
//                 />
//                 <div className="flex gap-2">
//                   <Button size="sm" onClick={setLink}>Add Link</Button>
//                   <Button 
//                     size="sm" 
//                     variant="outline"
//                     onClick={() => editor.chain().focus().unsetLink().run()}
//                   >
//                     Remove
//                   </Button>
//                 </div>
//               </div>
//             </PopoverContent>
//           </Popover>

//           {/* Image */}
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button variant="ghost" size="sm" title="Insert Image">
//                 <ImageIcon className="h-4 w-4" />
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-80">
//               <div className="space-y-3">
//                 <Label htmlFor="image-url">Image URL</Label>
//                 <Input
//                   id="image-url"
//                   value={imageUrl}
//                   onChange={(e) => setImageUrl(e.target.value)}
//                   placeholder="https://example.com/image.jpg"
//                 />
//                 <Button size="sm" onClick={addImage}>Insert Image</Button>
//               </div>
//             </PopoverContent>
//           </Popover>
//         </div>

//         {/* Undo/Redo */}
//         <div className="flex items-center gap-0.5">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => editor.chain().focus().undo().run()}
//             disabled={!editor.can().undo()}
//             title="Undo"
//           >
//             <Undo className="h-4 w-4" />
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => editor.chain().focus().redo().run()}
//             disabled={!editor.can().redo()}
//             title="Redo"
//           >
//             <Redo className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>

//       {/* Bubble Menu (appears on text selection) */}
//       {editor && (
//         <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
//           <div className="bg-background border rounded-lg shadow-lg flex gap-0.5 p-1">
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => editor.chain().focus().toggleBold().run()}
//               className={cn('h-8 w-8 p-0', editor.isActive('bold') && 'bg-muted')}
//             >
//               <Bold className="h-3 w-3" />
//             </Button>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => editor.chain().focus().toggleItalic().run()}
//               className={cn('h-8 w-8 p-0', editor.isActive('italic') && 'bg-muted')}
//             >
//               <Italic className="h-3 w-3" />
//             </Button>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => editor.chain().focus().toggleUnderline().run()}
//               className={cn('h-8 w-8 p-0', editor.isActive('underline') && 'bg-muted')}
//             >
//               <UnderlineIcon className="h-3 w-3" />
//             </Button>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()}
//               className={cn('h-8 w-8 p-0', editor.isActive('highlight') && 'bg-muted')}
//             >
//               <Highlighter className="h-3 w-3" />
//             </Button>
            
//             {/* Table Controls (only visible inside table) */}
//             {editor.isActive('table') && (
//               <>
//                 <Button
//                   size="sm"
//                   variant="ghost"
//                   onClick={() => editor.chain().focus().addRowAfter().run()}
//                 >
//                   +Row
//                 </Button>

//                 <Button
//                   size="sm"
//                   variant="ghost"
//                   onClick={() => editor.chain().focus().addColumnAfter().run()}
//                 >
//                   +Col
//                 </Button>

//                 <Button
//                   size="sm"
//                   variant="ghost"
//                   onClick={() => editor.chain().focus().deleteRow().run()}
//                 >
//                   Del Row
//                 </Button>

//                 <Button
//                   size="sm"
//                   variant="ghost"
//                   onClick={() => editor.chain().focus().deleteColumn().run()}
//                 >
//                   Del Col
//                 </Button>

//                 <Button
//                   size="sm"
//                   variant="ghost"
//                   onClick={() => editor.chain().focus().deleteTable().run()}
//                 >
//                   Delete Table
//                 </Button>
//               </>
//             )}
//           </div>
//         </BubbleMenu>
//       )}

//       {/* Editor Content */}
//       <EditorContent editor={editor} className="min-h-[400px]" />

//       {/* Footer with Word Count */}
//       <div className="border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground flex justify-between">
//         <span>
//           {editor.getText().length} characters
//         </span>
//         <span>
//           {editor.getText().split(/\s+/).filter(Boolean).length} words
//         </span>
//       </div>
//     </div>
//   )
// }



// // 'use client'

// // // import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
// // import { useEditor, EditorContent } from '@tiptap/react'
// // import { BubbleMenu } from '@tiptap/react/menus'
// // import StarterKit from '@tiptap/starter-kit'
// // import Underline from '@tiptap/extension-underline'
// // import TextAlign from '@tiptap/extension-text-align'
// // import Highlight from '@tiptap/extension-highlight'
// // import Link from '@tiptap/extension-link'
// // import Image from '@tiptap/extension-image'
// // import Placeholder from '@tiptap/extension-placeholder'
// // import { TextStyle } from '@tiptap/extension-text-style'
// // import { Color } from '@tiptap/extension-color'
// // import { useEffect, useCallback, useState } from 'react'
// // import {
// //   Bold,
// //   Italic,
// //   Underline as UnderlineIcon,
// //   Strikethrough,
// //   Code,
// //   Heading1,
// //   Heading2,
// //   Heading3,
// //   List,
// //   ListOrdered,
// //   Quote,
// //   Undo,
// //   Redo,
// //   AlignLeft,
// //   AlignCenter,
// //   AlignRight,
// //   Link as LinkIcon,
// //   Image as ImageIcon,
// //   Highlighter,
// //   Minus,
// //   Type,
// //   Palette,
// //   Box,
// //   AlertCircle,
// //   CheckCircle,
// //   Info,
// //   AlertTriangle,
// // } from 'lucide-react'
// // import { Button } from '@/components/ui/button'
// // import {
// //   DropdownMenu,
// //   DropdownMenuContent,
// //   DropdownMenuItem,
// //   DropdownMenuTrigger,
// //   DropdownMenuSeparator,
// //   DropdownMenuLabel,
// // } from '@/components/ui/dropdown-menu'
// // import {
// //   Popover,
// //   PopoverContent,
// //   PopoverTrigger,
// // } from '@/components/ui/popover'
// // import { Input } from '@/components/ui/input'
// // import { Label } from '@/components/ui/label'
// // import { cn } from '@/lib/utils'
// // import { Table } from '@tiptap/extension-table'
// // import { TableRow } from '@tiptap/extension-table-row'
// // import { TableHeader } from '@tiptap/extension-table-header'
// // import { TableCell } from '@tiptap/extension-table-cell'
// // import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
// // import { createLowlight } from 'lowlight'
// // import javascript from 'highlight.js/lib/languages/javascript'
// // import python from 'highlight.js/lib/languages/python'

// // const lowlight = createLowlight()
// // lowlight.register('javascript', javascript)
// // lowlight.register('python', python)


// // // Callout box templates
// // const CALLOUT_TEMPLATES = {
// //   info: {
// //     label: 'Info Box',
// //     icon: Info,
// //     style: 'background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 1.25em 1.5em; margin: 1.5em 0; border-radius: 0 8px 8px 0;',
// //     textColor: '#1e40af'
// //   },
// //   success: {
// //     label: 'Success Box',
// //     icon: CheckCircle,
// //     style: 'background-color: #d1fae5; border-left: 4px solid #10b981; padding: 1.25em 1.5em; margin: 1.5em 0; border-radius: 0 8px 8px 0;',
// //     textColor: '#065f46'
// //   },
// //   warning: {
// //     label: 'Warning Box',
// //     icon: AlertTriangle,
// //     style: 'background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 1.25em 1.5em; margin: 1.5em 0; border-radius: 0 8px 8px 0;',
// //     textColor: '#92400e'
// //   },
// //   error: {
// //     label: 'Error Box',
// //     icon: AlertCircle,
// //     style: 'background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 1.25em 1.5em; margin: 1.5em 0; border-radius: 0 8px 8px 0;',
// //     textColor: '#991b1b'
// //   },
// //   neutral: {
// //     label: 'Neutral Box',
// //     icon: Box,
// //     style: 'background-color: #f3f4f6; border-left: 4px solid #6b7280; padding: 1.25em 1.5em; margin: 1.5em 0; border-radius: 0 8px 8px 0;',
// //     textColor: '#374151'
// //   },
// // }

// // // Heading style templates
// // const HEADING_STYLES = {
// //   h2Blue: {
// //     label: 'H2 - Blue Accent',
// //     style: 'font-size: 1.75em; font-weight: 700; color: #1a1a1a; margin-top: 2em; margin-bottom: 1em; border-left: 4px solid #3b82f6; padding-left: 0.75em;'
// //   },
// //   h2Green: {
// //     label: 'H2 - Green Accent',
// //     style: 'font-size: 1.75em; font-weight: 700; color: #1a1a1a; margin-top: 2em; margin-bottom: 1em; border-left: 4px solid #10b981; padding-left: 0.75em;'
// //   },
// //   h2Purple: {
// //     label: 'H2 - Purple Accent',
// //     style: 'font-size: 1.75em; font-weight: 700; color: #1a1a1a; margin-top: 2em; margin-bottom: 1em; border-left: 4px solid #8b5cf6; padding-left: 0.75em;'
// //   },
// //   h2Orange: {
// //     label: 'H2 - Orange Accent',
// //     style: 'font-size: 1.75em; font-weight: 700; color: #1a1a1a; margin-top: 2em; margin-bottom: 1em; border-left: 4px solid #f59e0b; padding-left: 0.75em;'
// //   },
// //   h3Regular: {
// //     label: 'H3 - Regular',
// //     style: 'font-size: 1.25em; font-weight: 600; color: #374151; margin-top: 2em; margin-bottom: 1em;'
// //   },
// // }

// // // Color palette
// // const COLORS = [
// //   { name: 'Default', value: null },
// //   { name: 'Gray', value: '#6b7280' },
// //   { name: 'Red', value: '#ef4444' },
// //   { name: 'Orange', value: '#f97316' },
// //   { name: 'Yellow', value: '#eab308' },
// //   { name: 'Green', value: '#22c55e' },
// //   { name: 'Blue', value: '#3b82f6' },
// //   { name: 'Purple', value: '#8b5cf6' },
// //   { name: 'Pink', value: '#ec4899' },
// // ]

// // const HIGHLIGHT_COLORS = [
// //   { name: 'Yellow', value: '#fef08a' },
// //   { name: 'Green', value: '#bbf7d0' },
// //   { name: 'Blue', value: '#bfdbfe' },
// //   { name: 'Purple', value: '#e9d5ff' },
// //   { name: 'Pink', value: '#fbcfe8' },
// //   { name: 'Orange', value: '#fed7aa' },
// // ]

// // export default function TiptapEditor({ content, onChange, placeholder = 'Start writing your post...' }) {
// //   const [linkUrl, setLinkUrl] = useState('')
// //   const [imageUrl, setImageUrl] = useState('')

// //   const editor = useEditor({
// //     extensions: [
// //       StarterKit.configure({
// //         heading: {
// //           levels: [1, 2, 3, 4],
// //         },
// //       }),
// //       Underline,
// //       TextStyle,
// //       Color,
// //       Highlight.configure({
// //         multicolor: true,
// //       }),
// //       TextAlign.configure({
// //         types: ['heading', 'paragraph'],
// //       }),
// //       Link.configure({
// //         openOnClick: false,
// //         HTMLAttributes: {
// //           class: 'text-blue-600 underline hover:text-blue-800',
// //         },
// //       }),
// //       Image.configure({
// //         HTMLAttributes: {
// //           class: 'rounded-lg max-w-full h-auto my-4',
// //         },
// //       }),
// //       Placeholder.configure({
// //         placeholder,
// //       }),
// //       Table.configure({
// //         resizable: true,
// //       }),
// //       TableRow,
// //       TableHeader,
// //       TableCell,
// //       CodeBlockLowlight.configure({
// //         lowlight,
// //       }),
// //     ],
// //     content: content?.json || content || '',
// //     immediatelyRender: false,
// //     editorProps: {
// //       attributes: {
// //         // class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-4 py-3',
// //         class: 'max-w-none focus:outline-none min-h-[400px] px-4 py-3 text-black',
// //       },
// //     },
// //     onUpdate: ({ editor }) => {
// //       onChange({
// //         json: editor.getJSON(),
// //         html: editor.getHTML(),
// //       })
// //     },
// //   })

// //   useEffect(() => {
// //     if (!editor || !content) return

// //     const current = editor.getJSON()
// //     const incoming = content?.json || content

// //     if (JSON.stringify(current) !== JSON.stringify(incoming)) {
// //       editor.commands.setContent(incoming)
// //     }
// //   }, [content, editor])

// //   const insertCallout = useCallback((type) => {
// //     if (!editor) return
// //     const template = CALLOUT_TEMPLATES[type]
// //     const html = `<div style="${template.style}"><p style="line-height: 1.8; margin: 0; color: ${template.textColor};">Your content here...</p></div><p></p>`
// //     editor.chain().focus().insertContent(html).run()
// //   }, [editor])

// //   const insertStyledHeading = useCallback((type, level) => {
// //     if (!editor) return
// //     const template = HEADING_STYLES[type]
// //     const tag = `h${level}`
// //     const html = `<${tag} style="${template.style}">Your heading here</${tag}><p></p>`
// //     editor.chain().focus().insertContent(html).run()
// //   }, [editor])

// //   const setLink = useCallback(() => {
// //     if (!editor || !linkUrl) return
    
// //     if (linkUrl === '') {
// //       editor.chain().focus().extendMarkRange('link').unsetLink().run()
// //       return
// //     }

// //     editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
// //     setLinkUrl('')
// //   }, [editor, linkUrl])

// //   const addImage = useCallback(() => {
// //     if (!editor || !imageUrl) return
// //     editor.chain().focus().setImage({ src: imageUrl }).run()
// //     setImageUrl('')
// //   }, [editor, imageUrl])

// //   const insertComparisonCard = useCallback((type) => {
// //     if (!editor) return
    
// //     const styles = {
// //       generative: {
// //         bg: '#dbeafe',
// //         color: '#1e40af',
// //         label: 'Generative AI'
// //       },
// //       agentic: {
// //         bg: '#d1fae5',
// //         color: '#065f46',
// //         label: 'Agentic AI'
// //       }
// //     }
    
// //     const s = styles[type]
// //     const html = `<div style="background-color: ${s.bg}; padding: 0.75em 1em; border-radius: 6px; margin-bottom: 0.5em;"><strong style="color: ${s.color};">${s.label}:</strong> <span style="color: #374151;">Your description here...</span></div>`
// //     editor.chain().focus().insertContent(html).run()
// //   }, [editor])

// //   const insertComparisonBlock = useCallback(() => {
// //     if (!editor) return
    
// //     const html = `
// //       <div style="background-color: #f9fafb; padding: 1.5em; margin-bottom: 1.5em; border-radius: 8px; border: 1px solid #e5e7eb;">
// //         <h4 style="font-size: 1.1em; font-weight: 600; color: #1f2937; margin-top: 0; margin-bottom: 1em;">Comparison Title</h4>
// //         <div style="display: flex; flex-direction: column; gap: 0.75em;">
// //           <div style="background-color: #dbeafe; padding: 0.75em 1em; border-radius: 6px;">
// //             <strong style="color: #1e40af;">Generative AI:</strong> <span style="color: #374151;">Description here...</span>
// //           </div>
// //           <div style="background-color: #d1fae5; padding: 0.75em 1em; border-radius: 6px;">
// //             <strong style="color: #065f46;">Agentic AI:</strong> <span style="color: #374151;">Description here...</span>
// //           </div>
// //         </div>
// //       </div>
// //     `
// //     editor.chain().focus().insertContent(html).run()
// //   }, [editor])

// //   const insertHorizontalRule = useCallback(() => {
// //     if (!editor) return
// //     const html = `<hr style="border: none; border-top: 2px solid #e0e0e0; margin: 3em 0;">`
// //     editor.chain().focus().insertContent(html).run()
// //   }, [editor])

// //   if (!editor) {
// //     return (
// //       <div className="border rounded-lg p-4 min-h-[500px] flex items-center justify-center">
// //         <div className="text-muted-foreground">Loading editor...</div>
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className="border rounded-lg overflow-hidden">
// //       {/* Toolbar */}
// //       <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1">
        
// //         {/* Text Formatting */}
// //         <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
// //           <Button
// //             variant="ghost"
// //             size="sm"
// //             onClick={() => editor.chain().focus().toggleBold().run()}
// //             className={cn(editor.isActive('bold') && 'bg-muted')}
// //             title="Bold"
// //           >
// //             <Bold className="h-4 w-4" />
// //           </Button>
// //           <Button
// //             variant="ghost"
// //             size="sm"
// //             onClick={() => editor.chain().focus().toggleItalic().run()}
// //             className={cn(editor.isActive('italic') && 'bg-muted')}
// //             title="Italic"
// //           >
// //             <Italic className="h-4 w-4" />
// //           </Button>
// //           <Button
// //             variant="ghost"
// //             size="sm"
// //             onClick={() => editor.chain().focus().toggleUnderline().run()}
// //             className={cn(editor.isActive('underline') && 'bg-muted')}
// //             title="Underline"
// //           >
// //             <UnderlineIcon className="h-4 w-4" />
// //           </Button>
// //           <Button
// //             variant="ghost"
// //             size="sm"
// //             onClick={() => editor.chain().focus().toggleStrike().run()}
// //             className={cn(editor.isActive('strike') && 'bg-muted')}
// //             title="Strikethrough"
// //           >
// //             <Strikethrough className="h-4 w-4" />
// //           </Button>
// //           <Button
// //             variant="ghost"
// //             size="sm"
// //             onClick={() => editor.chain().focus().toggleCode().run()}
// //             className={cn(editor.isActive('code') && 'bg-muted')}
// //             title="Inline Code"
// //           >
// //             <Code className="h-4 w-4" />
// //           </Button>
// //           {/* Tables */}
// //           <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
// //             {/* Insert Table */}
// //             <Button
// //               variant="ghost"
// //               size="sm"
// //               onClick={() =>
// //                 editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
// //               }
// //               title="Insert Table"
// //             >
// //               📊
// //             </Button>

// //             {/* Add Row */}
// //             <Button
// //               variant="ghost"
// //               size="sm"
// //               onClick={() => editor.chain().focus().addRowAfter().run()}
// //               disabled={!editor.can().addRowAfter()}
// //               title="Add Row"
// //             >
// //               ➕Row
// //             </Button>

// //             {/* Add Column */}
// //             <Button
// //               variant="ghost"
// //               size="sm"
// //               onClick={() => editor.chain().focus().addColumnAfter().run()}
// //               disabled={!editor.can().addColumnAfter()}
// //               title="Add Column"
// //             >
// //               ➕Col
// //             </Button>

// //             {/* Delete Row */}
// //             <Button
// //               variant="ghost"
// //               size="sm"
// //               onClick={() => editor.chain().focus().deleteRow().run()}
// //               disabled={!editor.can().deleteRow()}
// //               title="Delete Row"
// //             >
// //               ❌Row
// //             </Button>

// //             {/* Delete Column */}
// //             <Button
// //               variant="ghost"
// //               size="sm"
// //               onClick={() => editor.chain().focus().deleteColumn().run()}
// //               disabled={!editor.can().deleteColumn()}
// //               title="Delete Column"
// //             >
// //               ❌Col
// //             </Button>

// //             {/* Delete Table */}
// //             <Button
// //               variant="ghost"
// //               size="sm"
// //               onClick={() => editor.chain().focus().deleteTable().run()}
// //               disabled={!editor.can().deleteTable()}
// //               title="Delete Table"
// //             >
// //               🗑
// //             </Button>
// //           </div>
// //         </div>

// //         {/* Headings Dropdown */}
// //         <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
// //           <DropdownMenu>
// //             <DropdownMenuTrigger asChild>
// //               <Button variant="ghost" size="sm" title="Headings">
// //                 <Type className="h-4 w-4 mr-1" />
// //                 <span className="text-xs">Heading</span>
// //               </Button>
// //             </DropdownMenuTrigger>
// //             <DropdownMenuContent>
// //               <DropdownMenuLabel>Basic Headings</DropdownMenuLabel>
// //               <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
// //                 <Heading1 className="h-4 w-4 mr-2" /> Heading 1
// //               </DropdownMenuItem>
// //               <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
// //                 <Heading2 className="h-4 w-4 mr-2" /> Heading 2
// //               </DropdownMenuItem>
// //               <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
// //                 <Heading3 className="h-4 w-4 mr-2" /> Heading 3
// //               </DropdownMenuItem>
// //               <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
// //                 <Type className="h-4 w-4 mr-2" /> Paragraph
// //               </DropdownMenuItem>
// //               <DropdownMenuSeparator />
// //               <DropdownMenuLabel>Styled Headings</DropdownMenuLabel>
// //               <DropdownMenuItem onClick={() => insertStyledHeading('h2Blue', 2)}>
// //                 <span className="w-3 h-3 bg-blue-500 rounded mr-2" /> H2 - Blue Accent
// //               </DropdownMenuItem>
// //               <DropdownMenuItem onClick={() => insertStyledHeading('h2Green', 2)}>
// //                 <span className="w-3 h-3 bg-green-500 rounded mr-2" /> H2 - Green Accent
// //               </DropdownMenuItem>
// //               <DropdownMenuItem onClick={() => insertStyledHeading('h2Purple', 2)}>
// //                 <span className="w-3 h-3 bg-purple-500 rounded mr-2" /> H2 - Purple Accent
// //               </DropdownMenuItem>
// //               <DropdownMenuItem onClick={() => insertStyledHeading('h2Orange', 2)}>
// //                 <span className="w-3 h-3 bg-orange-500 rounded mr-2" /> H2 - Orange Accent
// //               </DropdownMenuItem>
// //             </DropdownMenuContent>
// //           </DropdownMenu>
// //         </div>

// //         {/* Lists */}
// //         <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
// //           <Button
// //             variant="ghost"
// //             size="sm"
// //             onClick={() => editor.chain().focus().toggleBulletList().run()}
// //             className={cn(editor.isActive('bulletList') && 'bg-muted')}
// //             title="Bullet List"
// //           >
// //             <List className="h-4 w-4" />
// //           </Button>
// //           <Button
// //             variant="ghost"
// //             size="sm"
// //             onClick={() => editor.chain().focus().toggleOrderedList().run()}
// //             className={cn(editor.isActive('orderedList') && 'bg-muted')}
// //             title="Numbered List"
// //           >
// //             <ListOrdered className="h-4 w-4" />
// //           </Button>
// //           <Button
// //             variant="ghost"
// //             size="sm"
// //             onClick={() => editor.chain().focus().toggleBlockquote().run()}
// //             className={cn(editor.isActive('blockquote') && 'bg-muted')}
// //             title="Blockquote"
// //           >
// //             <Quote className="h-4 w-4" />
// //           </Button>
// //         </div>

// //         {/* Alignment */}
// //         <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
// //           <Button
// //             variant="ghost"
// //             size="sm"
// //             onClick={() => editor.chain().focus().setTextAlign('left').run()}
// //             className={cn(editor.isActive({ textAlign: 'left' }) && 'bg-muted')}
// //             title="Align Left"
// //           >
// //             <AlignLeft className="h-4 w-4" />
// //           </Button>
// //           <Button
// //             variant="ghost"
// //             size="sm"
// //             onClick={() => editor.chain().focus().setTextAlign('center').run()}
// //             className={cn(editor.isActive({ textAlign: 'center' }) && 'bg-muted')}
// //             title="Align Center"
// //           >
// //             <AlignCenter className="h-4 w-4" />
// //           </Button>
// //           <Button
// //             variant="ghost"
// //             size="sm"
// //             onClick={() => editor.chain().focus().setTextAlign('right').run()}
// //             className={cn(editor.isActive({ textAlign: 'right' }) && 'bg-muted')}
// //             title="Align Right"
// //           >
// //             <AlignRight className="h-4 w-4" />
// //           </Button>
// //         </div>

// //         {/* Text Color */}
// //         <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
// //           <DropdownMenu>
// //             <DropdownMenuTrigger asChild>
// //               <Button variant="ghost" size="sm" title="Text Color">
// //                 <Palette className="h-4 w-4" />
// //               </Button>
// //             </DropdownMenuTrigger>
// //             <DropdownMenuContent>
// //               <DropdownMenuLabel>Text Color</DropdownMenuLabel>
// //               {COLORS.map((color) => (
// //                 <DropdownMenuItem
// //                   key={color.name}
// //                   onClick={() => color.value ? editor.chain().focus().setColor(color.value).run() : editor.chain().focus().unsetColor().run()}
// //                 >
// //                   <span 
// //                     className="w-4 h-4 rounded border mr-2" 
// //                     style={{ backgroundColor: color.value || '#000' }}
// //                   />
// //                   {color.name}
// //                 </DropdownMenuItem>
// //               ))}
// //             </DropdownMenuContent>
// //           </DropdownMenu>

// //           {/* Highlight Color */}
// //           <DropdownMenu>
// //             <DropdownMenuTrigger asChild>
// //               <Button variant="ghost" size="sm" title="Highlight">
// //                 <Highlighter className="h-4 w-4" />
// //               </Button>
// //             </DropdownMenuTrigger>
// //             <DropdownMenuContent>
// //               <DropdownMenuLabel>Highlight Color</DropdownMenuLabel>
// //               {HIGHLIGHT_COLORS.map((color) => (
// //                 <DropdownMenuItem
// //                   key={color.name}
// //                   onClick={() => editor.chain().focus().toggleHighlight({ color: color.value }).run()}
// //                 >
// //                   <span 
// //                     className="w-4 h-4 rounded border mr-2" 
// //                     style={{ backgroundColor: color.value }}
// //                   />
// //                   {color.name}
// //                 </DropdownMenuItem>
// //               ))}
// //               <DropdownMenuSeparator />
// //               <DropdownMenuItem onClick={() => editor.chain().focus().unsetHighlight().run()}>
// //                 Remove Highlight
// //               </DropdownMenuItem>
// //             </DropdownMenuContent>
// //           </DropdownMenu>
// //         </div>

// //         {/* Callout Boxes */}
// //         <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
// //           <DropdownMenu>
// //             <DropdownMenuTrigger asChild>
// //               <Button variant="ghost" size="sm" title="Callout Boxes">
// //                 <Box className="h-4 w-4 mr-1" />
// //                 <span className="text-xs">Callout</span>
// //               </Button>
// //             </DropdownMenuTrigger>
// //             <DropdownMenuContent>
// //               <DropdownMenuLabel>Callout Boxes</DropdownMenuLabel>
// //               {Object.entries(CALLOUT_TEMPLATES).map(([key, template]) => {
// //                 const Icon = template.icon
// //                 return (
// //                   <DropdownMenuItem key={key} onClick={() => insertCallout(key)}>
// //                     <Icon className="h-4 w-4 mr-2" />
// //                     {template.label}
// //                   </DropdownMenuItem>
// //                 )
// //               })}
// //               <DropdownMenuSeparator />
// //               <DropdownMenuLabel>Comparison Cards</DropdownMenuLabel>
// //               <DropdownMenuItem onClick={insertComparisonBlock}>
// //                 <Box className="h-4 w-4 mr-2" />
// //                 Full Comparison Block
// //               </DropdownMenuItem>
// //               <DropdownMenuItem onClick={() => insertComparisonCard('generative')}>
// //                 <span className="w-3 h-3 bg-blue-500 rounded mr-2" />
// //                 Generative AI Card
// //               </DropdownMenuItem>
// //               <DropdownMenuItem onClick={() => insertComparisonCard('agentic')}>
// //                 <span className="w-3 h-3 bg-green-500 rounded mr-2" />
// //                 Agentic AI Card
// //               </DropdownMenuItem>
// //             </DropdownMenuContent>
// //           </DropdownMenu>
// //         </div>

// //         {/* Insert Elements */}
// //         <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
// //           {/* Horizontal Rule */}
// //           <Button
// //             variant="ghost"
// //             size="sm"
// //             onClick={insertHorizontalRule}
// //             title="Horizontal Rule"
// //           >
// //             <Minus className="h-4 w-4" />
// //           </Button>

// //           {/* Link */}
// //           <Popover>
// //             <PopoverTrigger asChild>
// //               <Button variant="ghost" size="sm" title="Insert Link">
// //                 <LinkIcon className="h-4 w-4" />
// //               </Button>
// //             </PopoverTrigger>
// //             <PopoverContent className="w-80">
// //               <div className="space-y-3">
// //                 <Label htmlFor="link-url">Link URL</Label>
// //                 <Input
// //                   id="link-url"
// //                   value={linkUrl}
// //                   onChange={(e) => setLinkUrl(e.target.value)}
// //                   placeholder="https://example.com"
// //                 />
// //                 <div className="flex gap-2">
// //                   <Button size="sm" onClick={setLink}>Add Link</Button>
// //                   <Button 
// //                     size="sm" 
// //                     variant="outline"
// //                     onClick={() => editor.chain().focus().unsetLink().run()}
// //                   >
// //                     Remove
// //                   </Button>
// //                 </div>
// //               </div>
// //             </PopoverContent>
// //           </Popover>

// //           {/* Image */}
// //           <Popover>
// //             <PopoverTrigger asChild>
// //               <Button variant="ghost" size="sm" title="Insert Image">
// //                 <ImageIcon className="h-4 w-4" />
// //               </Button>
// //             </PopoverTrigger>
// //             <PopoverContent className="w-80">
// //               <div className="space-y-3">
// //                 <Label htmlFor="image-url">Image URL</Label>
// //                 <Input
// //                   id="image-url"
// //                   value={imageUrl}
// //                   onChange={(e) => setImageUrl(e.target.value)}
// //                   placeholder="https://example.com/image.jpg"
// //                 />
// //                 <Button size="sm" onClick={addImage}>Insert Image</Button>
// //               </div>
// //             </PopoverContent>
// //           </Popover>
// //         </div>

// //         {/* Undo/Redo */}
// //         <div className="flex items-center gap-0.5">
// //           <Button
// //             variant="ghost"
// //             size="sm"
// //             onClick={() => editor.chain().focus().undo().run()}
// //             disabled={!editor.can().undo()}
// //             title="Undo"
// //           >
// //             <Undo className="h-4 w-4" />
// //           </Button>
// //           <Button
// //             variant="ghost"
// //             size="sm"
// //             onClick={() => editor.chain().focus().redo().run()}
// //             disabled={!editor.can().redo()}
// //             title="Redo"
// //           >
// //             <Redo className="h-4 w-4" />
// //           </Button>
// //         </div>
// //       </div>

// //       {/* Bubble Menu (appears on text selection) */}
// //       {editor && (
// //         <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
// //           <div className="bg-background border rounded-lg shadow-lg flex gap-0.5 p-1">
// //             <Button
// //               variant="ghost"
// //               size="sm"
// //               onClick={() => editor.chain().focus().toggleBold().run()}
// //               className={cn('h-8 w-8 p-0', editor.isActive('bold') && 'bg-muted')}
// //             >
// //               <Bold className="h-3 w-3" />
// //             </Button>
// //             <Button
// //               variant="ghost"
// //               size="sm"
// //               onClick={() => editor.chain().focus().toggleItalic().run()}
// //               className={cn('h-8 w-8 p-0', editor.isActive('italic') && 'bg-muted')}
// //             >
// //               <Italic className="h-3 w-3" />
// //             </Button>
// //             <Button
// //               variant="ghost"
// //               size="sm"
// //               onClick={() => editor.chain().focus().toggleUnderline().run()}
// //               className={cn('h-8 w-8 p-0', editor.isActive('underline') && 'bg-muted')}
// //             >
// //               <UnderlineIcon className="h-3 w-3" />
// //             </Button>
// //             <Button
// //               variant="ghost"
// //               size="sm"
// //               onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()}
// //               className={cn('h-8 w-8 p-0', editor.isActive('highlight') && 'bg-muted')}
// //             >
// //               <Highlighter className="h-3 w-3" />
// //             </Button>
            
// //             {/* Table Controls (only visible inside table) */}
// //             {editor.isActive('table') && (
// //               <>
// //                 <Button
// //                   size="sm"
// //                   variant="ghost"
// //                   onClick={() => editor.chain().focus().addRowAfter().run()}
// //                 >
// //                   +Row
// //                 </Button>

// //                 <Button
// //                   size="sm"
// //                   variant="ghost"
// //                   onClick={() => editor.chain().focus().addColumnAfter().run()}
// //                 >
// //                   +Col
// //                 </Button>

// //                 <Button
// //                   size="sm"
// //                   variant="ghost"
// //                   onClick={() => editor.chain().focus().deleteRow().run()}
// //                 >
// //                   Del Row
// //                 </Button>

// //                 <Button
// //                   size="sm"
// //                   variant="ghost"
// //                   onClick={() => editor.chain().focus().deleteColumn().run()}
// //                 >
// //                   Del Col
// //                 </Button>

// //                 <Button
// //                   size="sm"
// //                   variant="ghost"
// //                   onClick={() => editor.chain().focus().deleteTable().run()}
// //                 >
// //                   Delete Table
// //                 </Button>
// //               </>
// //             )}
// //           </div>
// //         </BubbleMenu>
// //       )}

// //       {/* Editor Content */}
// //       <EditorContent editor={editor} className="min-h-[400px]" />

// //       {/* Footer with Word Count */}
// //       <div className="border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground flex justify-between">
// //         <span>
// //           {editor.getText().length} characters
// //         </span>
// //         <span>
// //           {editor.getText().split(/\s+/).filter(Boolean).length} words
// //         </span>
// //       </div>
// //     </div>
// //   )
// // }