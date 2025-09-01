"use client"

export default function InicioContent() {
  return (
    <div className="main-content">
      <h1>Bienvenido al Dashboard</h1>
      <p>Panel de control principal con información general del sistema.</p>
      <div className="content-cards">
        <div className="card">
          <h3>Usuarios Activos</h3>
          <div className="stat-number">1,234</div>
          <p>Usuarios conectados en las últimas 24 horas</p>
        </div>
        <div className="card">
          <h3>Ventas del Mes</h3>
          <div className="stat-number">$45,678</div>
          <p>Ingresos generados este mes</p>
        </div>
        <div className="card">
          <h3>Pedidos Pendientes</h3>
          <div className="stat-number">89</div>
          <p>Pedidos esperando procesamiento</p>
        </div>
        <div className="card">
          <h3>Satisfacción</h3>
          <div className="stat-number">98%</div>
          <p>Índice de satisfacción del cliente</p>
        </div>
      </div>
    </div>
  )
}
