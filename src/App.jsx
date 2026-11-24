import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./components/AdminLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import AdminResourcePage from "./pages/AdminResourcePage.jsx";
import ClientPage from "./pages/ClientPage.jsx";
import HomePage from "./pages/HomePage.jsx";

function NotFoundPage() {
  return <main className="not-found"><p className="eyebrow eyebrow-dark">404</p><h1>Esta página não foi encontrada.</h1><a className="text-button" href="/">Voltar ao início</a></main>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/cliente" element={<ClientPage />} />
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboardPage />} />
        <Route path=":resource" element={<AdminResourcePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/inicio" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
