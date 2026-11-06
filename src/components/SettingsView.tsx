import { useState } from 'react';
import { loadSettings, saveSettings, loadSessions, saveSessions, type Settings, type Session } from '../lib/storage';

interface Props {
  onExit: () => void;
  onSettingsChange: (s: Settings) => void;
}

export function SettingsView({ onExit, onSettingsChange }: Props) {
  const [settings, setSettings] = useState<Settings>(loadSettings());

  function update(patch: Partial<Settings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
    onSettingsChange(next);
  }

  function exportData() {
    const data = {
      settings: loadSettings(),
      sessions: loadSessions(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gym-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (Array.isArray(data.sessions)) {
          saveSessions(data.sessions as Session[]);
        }
        if (data.settings) {
          saveSettings(data.settings);
          setSettings(data.settings);
          onSettingsChange(data.settings);
        }
        alert('Datos importados correctamente.');
      } catch {
        alert('Archivo inválido.');
      }
    };
    reader.readAsText(file);
  }

  function clearAll() {
    if (!confirm('¿Borrar TODAS las sesiones y notas? Esta acción no se puede deshacer.')) return;
    saveSessions([]);
    alert('Borrado.');
  }

  return (
    <div className="settings">
      <header className="session-header">
        <button className="back" onClick={onExit}>‹</button>
        <div>
          <h1>Ajustes</h1>
        </div>
      </header>

      <section className="settings-card">
        <label>
          Descanso por defecto (segundos)
          <input
            type="number"
            min={0}
            value={settings.restSeconds}
            onChange={(e) => update({ restSeconds: Math.max(0, parseInt(e.target.value) || 0) })}
          />
        </label>
        <label>
          Peso corporal (kg) — referencia
          <input
            type="number"
            min={0}
            value={settings.bodyweight}
            onChange={(e) => update({ bodyweight: Math.max(0, parseFloat(e.target.value) || 0) })}
          />
        </label>
      </section>

      <section className="settings-card">
        <h3>Respaldo de datos</h3>
        <p className="hint">Como todo se guarda en el dispositivo, exportá tu data de vez en cuando por si cambias de celular.</p>
        <button className="primary" onClick={exportData}>Exportar JSON</button>
        <label className="file-btn">
          Importar JSON
          <input type="file" accept="application/json" onChange={importData} hidden />
        </label>
      </section>

      <section className="settings-card danger">
        <h3>Zona peligrosa</h3>
        <button className="danger-btn" onClick={clearAll}>Borrar todas las sesiones</button>
      </section>

      <section className="about">
        <p>Gym App · Rutina Personalizada 95kg</p>
        <p className="hint">App local sin servidor. Tus datos viven solo en este dispositivo.</p>
      </section>
    </div>
  );
}
