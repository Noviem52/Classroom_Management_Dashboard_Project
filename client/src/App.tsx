import {
  Refine,
  WelcomePage,
  Authenticated,
} from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import { BrowserRouter, Route, Routes, Outlet } from "react-router";
import routerProvider, {
  NavigateToResource,
  CatchAllNavigate,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { dataProvider } from "./providers/data";
import { authProvider } from "./providers/auth";
import { SubjectList } from "./pages/subjects/list";
import { DepartmentList } from "./pages/departments/list";
import { ClassList } from "./pages/classes/list";
import { ClassShow } from "./pages/classes/show";
import { ClassCreate } from "./pages/classes/create";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { ErrorComponent } from "./components/refine-ui/layout/error-component";
import { Layout } from "./components/refine-ui/layout/layout";
import { Header } from "./components/refine-ui/layout/header";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider>
          <DevtoolsProvider>
            <Refine
              dataProvider={dataProvider}
              authProvider={authProvider}
              notificationProvider={useNotificationProvider()}
              routerProvider={routerProvider}
              resources={[
                { name: "departments", list: "/departments" },
                { name: "subjects", list: "/subjects" },
                {
                  name: "classes",
                  list: "/classes",
                  show: "/classes/:id",
                  create: "/classes/create",
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "AmKgZW-XGf0oB-Goxm3u",
                title: {
                  text: "Classroom",
                  icon: <span style={{ fontSize: "1.1rem" }}>🎓</span>,
                },
              }}
            >
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                  element={
                    <Authenticated key="protected" redirectOnFail="/login">
                      <Layout>
                        <Outlet />
                      </Layout>
                    </Authenticated>
                  }
                >
                  <Route
                    index
                    element={<NavigateToResource resource="subjects" />}
                  />
                  <Route path="/subjects" element={<SubjectList />} />
                  <Route path="/departments" element={<DepartmentList />} />
                  <Route path="/classes" element={<ClassList />} />
                  <Route path="/classes/create" element={<ClassCreate />} />
                  <Route path="/classes/:id" element={<ClassShow />} />
                </Route>

                <Route path="*" element={<ErrorComponent />} />
              </Routes>
              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
            <DevtoolsPanel />
          </DevtoolsProvider>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;