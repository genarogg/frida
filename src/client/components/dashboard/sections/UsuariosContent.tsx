"use client"

export default function UsuariosContent() {
  return (
    <div className="main-content">
      <h1>Gestión de Usuarios</h1>
      <p>Administra y supervisa las cuentas de usuario del sistema.</p>
      <div className="user-table">
        <div className="table-header">
          <div>Nombre</div>
          <div>Email</div>
          <div>Rol</div>
          <div>Estado</div>
        </div>
        <div className="table-row">
          <div>Juan Pérez</div>
          <div>juan@email.com</div>
          <div>Admin</div>
          <div className="status active">Activo</div>
        </div>
        <div className="table-row">
          <div>María García</div>
          <div>maria@email.com</div>
          <div>Usuario</div>
          <div className="status active">Activo</div>
        </div>
        <div className="table-row">
          <div>Carlos López</div>
          <div>carlos@email.com</div>
          <div>Usuario</div>
          <div className="status inactive">Inactivo</div>
        </div>
      </div>
    </div>
  )
}
