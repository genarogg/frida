"use client"

export default function AyudaContent() {
  return (
    <div className="main-content">
      <h1>Centro de Ayuda</h1>
      <p>Encuentra respuestas a tus preguntas y obtén soporte técnico.</p>
      <div className="help-sections">
        <div className="help-card">
          <h3>❓ Preguntas Frecuentes</h3>
          <ul>
            <li>¿Cómo cambio mi contraseña?</li>
            <li>¿Cómo genero un reporte?</li>
            <li>¿Cómo agrego nuevos usuarios?</li>
          </ul>
        </div>
        <div className="help-card">
          <h3>📞 Contacto</h3>
          <p>Email: soporte@dashboard.com</p>
          <p>Teléfono: +1 234 567 8900</p>
          <p>Horario: Lun-Vie 9:00-18:00</p>
        </div>
        <div className="help-card">
          <h3>📚 Documentación</h3>
          <p>Accede a la documentación completa y guías de usuario.</p>
          <button className="help-btn">Ver Documentación</button>
        </div>
      </div>
    </div>
  )
}
