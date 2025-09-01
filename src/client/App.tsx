import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Helmet } from "react-helmet"
import App from './app/page'
import Dashboard from './app/dashboard/page'
import favico from "./img/logo/isotipo.svg"

import { Toaster } from 'sonner';
import 'sonner/dist/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<BrowserRouter>
			<Helmet>
				<title>React Scan</title>
				<link rel="shortcut icon" href={favico} type="image/x-icon" />
				{/* <script src="https://unpkg.com/react-scan/dist/auto.global.js"></script> */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;800"
					rel="stylesheet"
				/>
			</Helmet>
			<Toaster
				position="bottom-center"
				richColors
				closeButton
				expand={false}
				visibleToasts={5}
				duration={5000}
			/>
			<Routes>
				<Route path="/s" element={<App />} />
				<Route path="/" element={<Dashboard />} />
				<Route path="/headcheck" element={<p>headcheck</p>} />
			</Routes>
		</BrowserRouter>
	</React.StrictMode>
)
