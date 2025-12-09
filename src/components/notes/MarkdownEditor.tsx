'use client';

import { useState, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useTranslations } from 'next-intl';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
}

type TabType = 'write' | 'preview';

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  minHeight = '200px',
  disabled = false,
}: MarkdownEditorProps) {
  const t = useTranslations('notes');
  const [activeTab, setActiveTab] = useState<TabType>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = useCallback(
    (before: string, after: string = '') => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);

      const newValue =
        value.substring(0, start) +
        before +
        selectedText +
        after +
        value.substring(end);

      onChange(newValue);

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        const newPosition = start + before.length + selectedText.length + after.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }, 0);
    },
    [value, onChange]
  );

  const handleBold = () => insertText('**', '**');
  const handleItalic = () => insertText('*', '*');
  const handleCode = () => insertText('`', '`');
  const handleCodeBlock = () => insertText('\n```\n', '\n```\n');
  const handleLink = () => insertText('[', '](url)');
  const handleList = () => insertText('\n- ');
  const handleOrderedList = () => insertText('\n1. ');
  const handleQuote = () => insertText('\n> ');
  const handleHeading = () => insertText('\n## ');

  const toolbarButtons = [
    { icon: 'B', action: handleBold, title: t('toolbar.bold'), className: 'font-bold' },
    { icon: 'I', action: handleItalic, title: t('toolbar.italic'), className: 'italic' },
    { icon: '<>', action: handleCode, title: t('toolbar.code'), className: 'font-mono text-xs' },
    { icon: '{ }', action: handleCodeBlock, title: t('toolbar.codeBlock'), className: 'font-mono text-xs' },
    { icon: '#', action: handleHeading, title: t('toolbar.heading'), className: '' },
    { icon: '""', action: handleQuote, title: t('toolbar.quote'), className: '' },
    { icon: '[-]', action: handleList, title: t('toolbar.list'), className: 'text-xs' },
    { icon: '[1]', action: handleOrderedList, title: t('toolbar.orderedList'), className: 'text-xs' },
    { icon: 'url', action: handleLink, title: t('toolbar.link'), className: 'text-xs underline' },
  ];

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab('write')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'write'
              ? 'text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('tabs.write')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'preview'
              ? 'text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('tabs.preview')}
        </button>
      </div>

      {/* Toolbar */}
      {activeTab === 'write' && !disabled && (
        <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/30">
          {toolbarButtons.map((btn, idx) => (
            <button
              key={idx}
              type="button"
              onClick={btn.action}
              title={btn.title}
              className={`w-8 h-8 flex items-center justify-center rounded hover:bg-muted transition-colors ${btn.className}`}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div style={{ minHeight }}>
        {activeTab === 'write' ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || t('placeholder')}
            disabled={disabled}
            className="w-full h-full p-4 bg-transparent resize-none focus:outline-none font-mono text-sm"
            style={{ minHeight }}
          />
        ) : (
          <div
            className="prose prose-sm dark:prose-invert max-w-none p-4 overflow-auto"
            style={{ minHeight }}
          >
            {value ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-muted-foreground italic">{t('emptyPreview')}</p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
        <span>{t('supportMarkdown')}</span>
        <span>
          {value.length} {t('characters')} | {value.split(/\s+/).filter(Boolean).length} {t('words')}
        </span>
      </div>
    </div>
  );
}
