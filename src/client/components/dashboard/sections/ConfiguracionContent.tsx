"use client"

export default function ConfiguracionContent() {
  return (
    <div className="main-content">
      <h1>Configuración</h1>
      <p>Ajusta las preferencias y configuraciones del sistema.</p>
      <div className="config-sections">
        <div className="config-card">
          <h3>Configuración General</h3>
          <div className="config-item">
            <label>Nombre de la aplicación</label>
            <input type="text" defaultValue="Mi Dashboard" />
          </div>
          <div className="config-item">
            <label>Idioma</label>
            <select>
              <option>Español</option>
              <option>Inglés</option>
            </select>
          </div>
        </div>
        <div className="config-card">
          <h3>Notificaciones</h3>
          <div className="config-item">
            <label>
              <input type="checkbox" defaultChecked /> Email notifications
            </label>
          </div>
          <div className="config-item">
            <label>
              <input type="checkbox" defaultChecked /> Push notifications
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
