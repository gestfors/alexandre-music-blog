import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import useScrollToTop from "../hooks/useScrollToTop.js";

const AdminDashboard = lazy(() => import("../pages/Admin/AdminDashboard.jsx"));
const AdminLogin = lazy(() => import("../pages/Admin/AdminLogin.jsx"));
const ProtectedAdminRoute = lazy(() => import("../pages/Admin/ProtectedAdminRoute.jsx"));
const Blog = lazy(() => import("../pages/Blog/Blog.jsx"));
const BlogPost = lazy(() => import("../pages/Blog/BlogPost.jsx"));
const NotFound = lazy(() => import("../pages/NotFound/NotFound.jsx"));

function ScrollToTop() {
  useScrollToTop();
  return null;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Navigate to="/blog" replace />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
