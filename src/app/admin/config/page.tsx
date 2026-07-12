'use client';

import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { SlidersHorizontal, Save, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface ConfigSection {
  id: string;
  label: string;
  fields: { key: string; label: string; value: string; type: 'text' | 'textarea' | 'number' | 'select'; options?: string[] }[];
}

const initialConfig: ConfigSection[] = [
  {
    id: 'primary-agent',
    label: 'Primary Agent',
    fields: [
      { key: 'persona_name', label: 'Persona name', value: 'Dhira', type: 'text' },
      { key: 'language_default', label: 'Default language', value: 'Hinglish', type: 'select', options: ['Hinglish', 'English', 'Hindi'] },
      { key: 'max_response_tokens', label: 'Max response tokens', value: '300', type: 'number' },
      { key: 'system_prompt_note', label: 'Persona note (appended to system prompt)', value: 'You are Dhira — a warm, anonymous listener. Never advise. Never diagnose. Always listen.', type: 'textarea' },
    ],
  },
  {
    id: 'safety-monitor',
    label: 'Safety & Persona Monitor',
    fields: [
      { key: 'risk_threshold', label: 'Risk threshold (0–1)', value: '0.7', type: 'number' },
      { key: 'handoff_trigger', label: 'Hand-off trigger level', value: 'high', type: 'select', options: ['high', 'medium', 'low'] },
      { key: 'crisis_resource', label: 'Primary crisis resource', value: 'Tele-MANAS 14416', type: 'text' },
    ],
  },
  {
    id: 'proactive-engine',
    label: 'Proactive Check-in Engine',
    fields: [
      { key: 'run_times', label: 'Run times (IST)', value: '08:00, 20:00', type: 'text' },
      { key: 'default_frequency', label: 'Default check-in frequency', value: 'daily', type: 'select', options: ['daily', 'every 2 days', 'weekly'] },
      { key: 'checkin_message', label: 'Default check-in message', value: 'Hey, just checking in — how are you feeling today?', type: 'textarea' },
    ],
  },
];

export default function AdminConfigPage() {
  const [config, setConfig] = useState(initialConfig);
  const [expanded, setExpanded] = useState<string[]>(['primary-agent']);
  const [saved, setSaved] = useState(false);

  const toggleSection = (id: string) => {
    setExpanded((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const updateField = (sectionId: string, key: string, value: string) => {
    setConfig((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, fields: s.fields.map((f) => (f.key === key ? { ...f, value } : f)) }
          : s
      )
    );
    setSaved(false);
  };

  const handleSave = async () => {
    await new Promise((r) => setTimeout(r, 600));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AdminLayout title="Prompt & Persona Config" subtitle="Tune agent prompts and guardrails without touching code">
      <div className="flex flex-col gap-4 mb-6">
        {config.map((section) => {
          const isOpen = expanded.includes(section.id);
          return (
            <div key={section.id} className="dhira-card overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 transition-colors duration-150"
                style={{ backgroundColor: isOpen ? 'var(--color-surface-alt)' : 'transparent' }}
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center gap-3">
                  <SlidersHorizontal size={16} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
                    {section.label}
                  </span>
                </div>
                {isOpen ? <ChevronUp size={16} style={{ color: 'var(--color-text-subtle)' }} /> : <ChevronDown size={16} style={{ color: 'var(--color-text-subtle)' }} />}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-2 flex flex-col gap-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                  {section.fields.map((field) => (
                    <div key={field.key} className="flex flex-col gap-1.5">
                      <label style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', fontWeight: 500, color: 'var(--color-text-muted)' }}>
                        {field.label}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={field.value}
                          onChange={(e) => updateField(section.id, field.key, e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 outline-none resize-none"
                          style={{
                            backgroundColor: 'var(--color-surface-alt)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-control)',
                            fontFamily: 'var(--font-ui)',
                            fontSize: '14px',
                            color: 'var(--color-text)',
                          }}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={field.value}
                          onChange={(e) => updateField(section.id, field.key, e.target.value)}
                          className="w-full px-4 py-3 outline-none"
                          style={{
                            backgroundColor: 'var(--color-surface-alt)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-control)',
                            fontFamily: 'var(--font-ui)',
                            fontSize: '14px',
                            color: 'var(--color-text)',
                          }}
                        >
                          {field.options?.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={field.value}
                          onChange={(e) => updateField(section.id, field.key, e.target.value)}
                          className="w-full px-4 py-3 outline-none"
                          style={{
                            backgroundColor: 'var(--color-surface-alt)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-control)',
                            fontFamily: 'var(--font-ui)',
                            fontSize: '14px',
                            color: 'var(--color-text)',
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} className="btn-primary">
          <Save size={15} />
          {saved ? 'Saved!' : 'Save changes'}
        </button>
        <button className="btn-ghost">
          <RotateCcw size={15} />
          Reset to defaults
        </button>
      </div>
    </AdminLayout>
  );
}
