'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileText, File } from 'lucide-react'
import { toast } from 'sonner'

interface ExportMenuProps {
  title: string
  content: string
}

export function ExportMenu({ title, content }: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToPDF = async () => {
    try {
      setIsExporting(true)
      const html2pdf = require('html2pdf.js')
      
      const element = document.createElement('div')
      element.innerHTML = `
        <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 20px;">${title}</h1>
        <div style="line-height: 1.6; color: #333;">${content}</div>
      `
      
      const options = {
        margin: 10,
        filename: `${title}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
      }
      
      html2pdf().set(options).from(element).save()
      toast.success('PDF exported successfully')
    } catch (err) {
      console.error('PDF export error:', err)
      toast.error('Failed to export PDF')
    } finally {
      setIsExporting(false)
    }
  }

  const exportToHTML = () => {
    try {
      setIsExporting(true)
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 40px;
      max-width: 900px;
    }
    h1 { font-size: 28px; font-weight: bold; margin-bottom: 20px; }
    h2 { font-size: 22px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; }
    h3 { font-size: 18px; font-weight: bold; margin-top: 15px; margin-bottom: 10px; }
    p { margin-bottom: 10px; }
    ul, ol { margin-left: 20px; margin-bottom: 10px; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New'; }
    a { color: #0066cc; text-decoration: none; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div>${content}</div>
</body>
</html>
      `
      
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('HTML exported successfully')
    } catch (err) {
      console.error('HTML export error:', err)
      toast.error('Failed to export HTML')
    } finally {
      setIsExporting(false)
    }
  }

  const exportToMarkdown = () => {
    try {
      setIsExporting(true)
      const markdownContent = htmlToMarkdown(content)
      const blob = new Blob([markdownContent], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Markdown exported successfully')
    } catch (err) {
      console.error('Markdown export error:', err)
      toast.error('Failed to export Markdown')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <div className="relative group">
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
        <div className="absolute hidden group-hover:flex flex-col gap-1 bg-card border border-border rounded-lg shadow-lg p-2 right-0 mt-1 z-50 w-40">
          <button
            onClick={exportToPDF}
            disabled={isExporting}
            className="text-left px-4 py-2 text-sm hover:bg-muted rounded flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Export as PDF
          </button>
          <button
            onClick={exportToHTML}
            disabled={isExporting}
            className="text-left px-4 py-2 text-sm hover:bg-muted rounded flex items-center gap-2"
          >
            <File className="h-4 w-4" />
            Export as HTML
          </button>
          <button
            onClick={exportToMarkdown}
            disabled={isExporting}
            className="text-left px-4 py-2 text-sm hover:bg-muted rounded flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Export as Markdown
          </button>
        </div>
      </div>
    </div>
  )
}

function htmlToMarkdown(html: string): string {
  let markdown = html
  
  // Headers
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/g, '# $1\n\n')
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/g, '## $1\n\n')
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1\n\n')
  
  // Bold
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**')
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/g, '**$1**')
  
  // Italic
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/g, '*$1*')
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/g, '*$1*')
  
  // Links
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g, '[$2]($1)')
  
  // Lists
  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/g, (match, content) => {
    return content.replace(/<li[^>]*>(.*?)<\/li>/g, '- $1\n') + '\n'
  })
  
  markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/g, (match, content) => {
    let counter = 1
    return content.replace(/<li[^>]*>(.*?)<\/li>/g, () => `${counter++}. $1\n`) + '\n'
  })
  
  // Paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n\n')
  
  // Code
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/g, '`$1`')
  
  // Line breaks
  markdown = markdown.replace(/<br\s*\/?>/g, '\n')
  
  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]*>/g, '')
  
  // Clean up multiple newlines
  markdown = markdown.replace(/\n\n\n+/g, '\n\n')
  
  return markdown.trim()
}
