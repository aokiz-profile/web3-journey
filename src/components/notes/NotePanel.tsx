'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { MarkdownEditor } from './MarkdownEditor';
import { useAuthContext } from '@/components/auth/AuthProvider';
import type { NoteReferenceType, LearningNote } from '@/lib/supabase/types';

interface NotePanelProps {
  referenceType: NoteReferenceType;
  referenceId: string;
  parentId?: string;
  title?: string;
  onNoteChange?: (note: LearningNote | null) => void;
}

export function NotePanel({
  referenceType,
  referenceId,
  parentId,
  title,
  onNoteChange,
}: NotePanelProps) {
  const t = useTranslations('notes');
  const { user } = useAuthContext();
  const [note, setNote] = useState<LearningNote | null>(null);
  const [content, setContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load note from Supabase
  const loadNote = useCallback(async () => {
    if (!user) return;

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('learning_notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('reference_type', referenceType)
        .eq('reference_id', referenceId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading note:', error);
        return;
      }

      if (data) {
        const loadedNote = data as unknown as LearningNote;
        setNote(loadedNote);
        setContent(loadedNote.content);
        setNoteTitle(loadedNote.title);
        setTags(loadedNote.tags);
        setIsPinned(loadedNote.is_pinned);
        onNoteChange?.(loadedNote);
      }
    } catch (error) {
      console.error('Error loading note:', error);
    }
  }, [user, referenceType, referenceId, onNoteChange]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  // Track unsaved changes
  useEffect(() => {
    if (!note) {
      setHasUnsavedChanges(content.length > 0 || noteTitle.length > 0);
    } else {
      setHasUnsavedChanges(
        content !== note.content ||
        noteTitle !== note.title ||
        JSON.stringify(tags) !== JSON.stringify(note.tags) ||
        isPinned !== note.is_pinned
      );
    }
  }, [content, noteTitle, tags, isPinned, note]);

  // Save note to Supabase
  const saveNote = useCallback(async () => {
    if (!user || isSaving) return;

    setIsSaving(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const wordCount = content.split(/\s+/).filter(Boolean).length;

      const noteData = {
        user_id: user.id,
        reference_type: referenceType,
        reference_id: referenceId,
        parent_id: parentId || null,
        title: noteTitle,
        content,
        tags,
        is_pinned: isPinned,
        word_count: wordCount,
        updated_at: new Date().toISOString(),
      };

      if (note) {
        // Update existing note
        const { error } = await supabase
          .from('learning_notes')
          .update(noteData as unknown as Record<string, unknown>)
          .eq('id', note.id);

        if (error) throw error;
      } else {
        // Create new note
        const { data, error } = await supabase
          .from('learning_notes')
          .insert(noteData as unknown as Record<string, unknown>)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setNote(data as unknown as LearningNote);
          onNoteChange?.(data as unknown as LearningNote);
        }
      }

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  }, [user, isSaving, note, content, noteTitle, tags, isPinned, referenceType, referenceId, parentId, onNoteChange]);

  // Auto-save after 2 seconds of inactivity
  useEffect(() => {
    if (!hasUnsavedChanges || !user) return;

    const timer = setTimeout(() => {
      saveNote();
    }, 2000);

    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, saveNote, user]);

  // Add tag
  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Delete note
  const deleteNote = async () => {
    if (!user || !note) return;

    if (!confirm(t('confirmDelete'))) return;

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { error } = await supabase
        .from('learning_notes')
        .delete()
        .eq('id', note.id);

      if (error) throw error;

      setNote(null);
      setContent('');
      setNoteTitle('');
      setTags([]);
      setIsPinned(false);
      setLastSaved(null);
      onNoteChange?.(null);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-muted/30 rounded-xl text-center text-muted-foreground">
        {t('loginToNote')}
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          <span className="font-medium">{title || t('myNotes')}</span>
          {hasUnsavedChanges && (
            <span className="text-xs text-yellow-500">{t('unsaved')}</span>
          )}
          {note && !hasUnsavedChanges && (
            <span className="text-xs text-green-500">{t('saved')}</span>
          )}
          {isPinned && (
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          )}
        </div>
        <svg
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 border-t border-border space-y-4">
          {/* Note Title */}
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder={t('titlePlaceholder')}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />

          {/* Markdown Editor */}
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder={t('contentPlaceholder')}
            minHeight="250px"
          />

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t('tags')}</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder={t('addTag')}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm"
              >
                {t('add')}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsPinned(!isPinned)}
                className={`flex items-center gap-1 text-sm ${
                  isPinned ? 'text-yellow-500' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <svg className="w-4 h-4" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                {isPinned ? t('pinned') : t('pin')}
              </button>
              {note && (
                <button
                  type="button"
                  onClick={deleteNote}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {t('delete')}
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              {lastSaved && (
                <span className="text-xs text-muted-foreground">
                  {t('lastSaved')}: {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <button
                type="button"
                onClick={saveNote}
                disabled={isSaving || !hasUnsavedChanges}
                className="px-4 py-2 rounded-lg gradient-bg text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? t('saving') : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
