import { Refine, Authenticated } from "@refinedev/core";
import { DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import { BrowserRouter, Route, Routes, Outlet } from "react-router";
import routerProvider, {
  NavigateToResource,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { dataProvider } from "./providers/data";
import { authProvider } from "./providers/auth";
import { SubjectList } from "./pages/subjects/list";
import { SubjectCreate } from "./pages/subjects/create";
import { DepartmentList } from "./pages/departments/list";
import { DepartmentCreate } from "./pages/departments/create";
import { ClassList } from "./pages/classes/list";
import { ClassShow } from "./pages/classes/show";
import { ClassCreate } from "./pages/classes/create";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { DepartmentEdit } from "./pages/departments/edit";
import { SubjectEdit } from "./pages/subjects/edit";
import { ClassEdit } from "./pages/classes/edit";
import { JoinClass } from "./pages/enrollments/join";
import { MyClasses } from "./pages/enrollments/list";
import { UserList } from "./pages/users/list";

import { ErrorComponent } from "./components/refine-ui/layout/error-component";
import { Layout } from "./components/refine-ui/layout/layout";
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
                {
                  name: "departments",
                  list: "/departments",
                  create: "/departments/create",
                  edit: "/departments/:id/edit",
                },
                {
                  name: "subjects",
                  list: "/subjects",
                  create: "/subjects/create",
                  edit: "/subjects/:id/edit",
                },
                {
                  name: "classes",
                  list: "/classes",
                  show: "/classes/:id",
                  create: "/classes/create",
                  edit: "/classes/:id/edit",
                },
                {
                  name: "enrollments",
                  list: "/my-classes",
                  create: "/join",
                  meta: { label: "My Classes" },
                },
                {
                  name: "users",
                  list: "/users",
                  meta: { label: "Users" },
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
                  <Route index element={<NavigateToResource resource="subjects" />} />
                  <Route path="/subjects" element={<SubjectList />} />
                  <Route path="/subjects/create" element={<SubjectCreate />} />
                  <Route path="/subjects/:id/edit" element={<SubjectEdit />} />
                  <Route path="/departments" element={<DepartmentList />} />
                  <Route path="/departments/create" element={<DepartmentCreate />} />
                  <Route path="/departments/:id/edit" element={<DepartmentEdit />} />
                  <Route path="/classes" element={<ClassList />} />
                  <Route path="/classes/create" element={<ClassCreate />} />
                  <Route path="/classes/:id" element={<ClassShow />} />
                  <Route path="/classes/:id/edit" element={<ClassEdit />} />
                  <Route path="/my-classes" element={<MyClasses />} />
                  <Route path="/join" element={<JoinClass />} />
                  <Route path="/users" element={<UserList />} />
                </Route>

                <Route path="*" element={<ErrorComponent />} />
              </Routes>
              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
          </DevtoolsProvider>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;