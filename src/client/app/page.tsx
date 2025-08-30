import { Helmet } from "react-helmet"
import { useState } from "react"
import { ExternalLink, Server, Database, FileText, Zap, Github, Globe } from "lucide-react"

import reactLogo from "../img/logo/react.svg"
import viteLogo from "../img/logo/vite.svg"
import isotipo from "../img/logo/isotipo.svg"
import fastifyLogo from "../img/logo/fastify.svg"
import "../css/app.css"

function App() {
  const [count, setCount] = useState(0)

  const services = [
    {
      name: "Servidor",
      url: `/`,
      icon: Server,
      status: "active",
      description: "Servidor principal ejecutándose"
    },
    {
      name: "GraphQL",
      url: `/graphql`,
      icon: Zap,
      status: "active",
      description: "API GraphQL disponible"
    },
    {
      name: "Documentación",
      url: `/docs`,
      icon: FileText,
      status: "active",
      description: "Documentación de la API"
    },
    {
      name: "Base de Datos",
      url: "#",
      icon: Database,
      status: "connected",
      statusText: "Conectada exitosamente",
      description: "Estado de la conexión a BD"
    },
  ]

  return (
    <>
      <Helmet>
        <title>Dashboard Fastify + Vite + React</title>
        <meta name="description" content="Dashboard de desarrollo con servicios integrados y monitoreo en tiempo real" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700/20 via-gray-900 to-black"></div>
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-600/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gray-600/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500"></div>

        <div className="relative z-10">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="flex justify-center items-center gap-8 mb-8">
                <a href="https://vite.dev" target="_blank" className="group" rel="noreferrer">
                  <img
                    src={fastifyLogo || "/placeholder.svg"}
                    className="h-20 p-3 transition-all duration-300 group-hover:drop-shadow-[0_0_2em_#646cffaa] group-hover:scale-110 filter brightness-110"
                    alt="Vite logo"
                  />
                </a>
                <a href="https://vite.dev" target="_blank" className="group" rel="noreferrer">
                  <img
                    src={viteLogo || "/placeholder.svg"}
                    className="h-20 p-3 transition-all duration-300 group-hover:drop-shadow-[0_0_2em_#646cffaa] group-hover:scale-110 filter brightness-110"
                    alt="Vite logo"
                  />
                </a>
                <a href="https://react.dev" target="_blank" className="group" rel="noreferrer">
                  <img
                    src={reactLogo || "/placeholder.svg"}
                    className="h-20 p-3 transition-all duration-300 group-hover:drop-shadow-[0_0_2em_#61dafbaa] group-hover:scale-110 animate-spin-slow filter brightness-110"
                    alt="React logo"
                  />
                </a>
                <a href="https://github.com/genarogg/my-server-fastify" target="_blank" className="group" rel="noreferrer">
                  <img
                    src={isotipo || "/placeholder.svg"}
                    className="h-20 p-3 transition-all duration-300 group-hover:drop-shadow-[0_0_2em_#ffffff44] group-hover:scale-110 filter brightness-110"
                    alt="logo genarogg"
                  />
                </a>
              </div>

              <h1 className="text-6xl font-black text-white mb-6 bg-gradient-to-r from-gray-100 via-gray-300 to-gray-500 bg-clip-text text-transparent tracking-tight">
                Fastify + Vite + React
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                Dashboard de desarrollo con servicios integrados y monitoreo en tiempo real
              </p>
            </div>

            {/* Services Grid */}
            <div className="max-w-6xl mx-auto mb-16">
              <div className="flex items-center justify-center mb-12">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
                <h2 className="text-3xl font-bold text-white px-8 bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Servicios Disponibles
                </h2>
                <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {services.map((service, index) => {
                  const IconComponent = service.icon
                  return (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-gray-800/50 to-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-gray-600/50 hover:from-gray-800/60 hover:to-gray-900/90 transition-all duration-500 group shadow-2xl shadow-black/20"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl shadow-lg group-hover:from-gray-600 group-hover:to-gray-500 transition-all duration-300">
                            <IconComponent className="w-6 h-6 text-gray-100" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white group-hover:text-gray-100 transition-colors">
                              {service.name}
                            </h3>
                            <p className="text-gray-400 text-sm mt-1">{service.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full shadow-lg ${service.status === "active" || service.status === "connected"
                              ? "bg-emerald-400 shadow-emerald-400/50"
                              : "bg-red-400 shadow-red-400/50"
                              } animate-pulse`}
                          />
                          <span className="text-sm text-gray-300 font-medium">
                            {service.status === "connected" ? "Conectada" : "Activo"}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-gray-700/30 pt-4">
                        {service.statusText ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                            <p className="text-emerald-400 font-semibold">{service.statusText}</p>
                          </div>
                        ) : (
                          <a
                            href={service.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 text-gray-300 hover:text-white transition-all duration-300 group/link"
                          >
                            <Globe className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover/link:text-gray-300" />
                            <span className="font-mono text-sm break-all group-hover/link:underline decoration-gray-500">
                              {service.url}
                            </span>
                            <ExternalLink className="w-4 h-4 flex-shrink-0 transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform duration-200" />
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <footer className="text-center py-12 border-t border-gray-800/50">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent flex-1 max-w-32"></div>
                <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-full border border-gray-700/30">
                  <Github className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300 font-medium">Desarrollado por</span>
                  <span className="text-white font-bold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
                    Genaro González
                  </span>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent flex-1 max-w-32"></div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  )
}

export default App