"use client"

export default function ReportesContent() {
  return (
    <div className="main-content">
      <h1>Reportes</h1>
      <p>Genera y descarga reportes detallados del sistema.</p>
      <div className="content-cards">
        <div className="card">
          <h3>Reporte de Ventas</h3>
          <p>Análisis completo de ventas por período</p>
          <button className="report-btn">Generar Reporte</button>
        </div>
        <div className="card">
          <h3>Reporte de Usuarios</h3>
          <p>Estadísticas de actividad de usuarios</p>
          <button className="report-btn">Generar Reporte</button>
        </div>
        <div className="card">
          <h3>Reporte Financiero</h3>
          <p>Estado financiero y balance general</p>
          <button className="report-btn">Generar Reporte</button>
        </div>
      </div>
    </div>
  )
}
