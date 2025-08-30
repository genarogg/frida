import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Helmet } from "react-helmet"
import App from './app/page'
import favico  from "./img/logo/isotipo.svg"


ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<BrowserRouter>
		<Helmet>
			<link rel="shortcut icon" href={favico} type="image/x-icon" />
		</Helmet>
			<Routes>
				<Route path="/" element={<App />} />
				<Route path="/headcheck" element={<p>headcheck</p>} />
			</Routes>
		</BrowserRouter>
	</React.StrictMode>
)
