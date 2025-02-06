import { useContext, useEffect } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

// Import css files
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "react-lazy-load-image-component/src/effects/blur.css";

import { ALL_PERMISSIONS } from "./components/admin/Access_Control/Permission/data/permissions";
import { callGetAccount } from "./services/api";
import { AuthContext } from "./components/share/Context";

import LayoutClient from "./components/client/LayoutClient";
import Home from "./pages/client/Home";
import AboutUs from "./pages/client/AboutUs";
import ContactUs from "./pages/client/ContactUs";
import Office from "./pages/client/Office";
import Detail from "./pages/client/Detail";
import NotFound from "./pages/client/NotFound";

import LayoutAdmin from "./components/admin/LayoutAdmin";
import Dashboard from "./pages/admin/Dashboard";
import User from "./pages/admin/User";
import Role from "./pages/admin/Role";
import Permission from "./pages/admin/Permission";

import Loading from "./components/share/Loading";
import Login from "./pages/Login";
import PrivateRoute from "./router/PrivateRoute";
import Customer from "./pages/admin/Customer";
import CustomerType from "./pages/admin/CustomerType";
import CustomerTypeDocument from "./pages/admin/CustomerTypeDocument";
import OfficeAdmin from "./pages/admin/Office";
import Contract from "./pages/admin/Contract";
import PaymentContract from "./pages/admin/PaymentContract";
import HandoverStatus from "./pages/admin/HandoverStatus";
import System from "./pages/admin/Systems";
import Subcontractor from "./pages/admin/Subcontractor";
import Quotation from "./pages/admin/Quotation";
import RepairProposal from "./pages/admin/RepairProposal";
import RiskAssessment from "./pages/admin/RiskAssessment";
import DeviceType from "./pages/admin/DeviceType";
import SystemMaintenanceService from "./pages/admin/SystemMaintenanceService";
import MaintenanceHistory from "./pages/admin/MaintenanceHistory";
import Device from "./pages/admin/Device";
import ElectricityUsage from "./pages/admin/ElectricityUsage";
import Meter from "./pages/admin/Meter";
import Task from "./pages/admin/Task";
import NotificationMaintenance from "./pages/admin/NotificationMaintenance";
import RepairRequest from "./pages/admin/RepairRequest";
import WorkRegistration from "./pages/admin/WorkRegistration";
import ItemCheck from "./pages/admin/ItemCheck";
import ResultCheck from "./pages/admin/ResultCheck";
import ElectricityRate from "./pages/admin/ElectricityRate";

function App() {
  const { user, setUser, loading, setLoading } = useContext(AuthContext);

  const delay = (milSeconds) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, milSeconds);
    });
  };

  useEffect(() => {
    const fetchAccount = async () => {
      setLoading(true);

      const res = await callGetAccount();
      await delay(3000);

      if (res?.data) {
        setUser(res.data);
      }

      setLoading(false);
    };

    fetchAccount();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: <LayoutClient />,
      errorElement: <NotFound />,
      children: [
        { index: true, element: <Home /> },
        { path: "gioi-thieu", element: <AboutUs /> },
        { path: "lien-he", element: <ContactUs /> },
        { path: "van-phong", element: <Office /> },
        { path: "van-phong/:id", element: <Detail /> },
      ],
    },
    {
      path: "/dashboard",
      element: (
        <PrivateRoute>
          <LayoutAdmin />
        </PrivateRoute>
      ),
      children: [
        { index: true, element: <Dashboard /> },
        {
          path: "users",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath === ALL_PERMISSIONS.USERS.GET_PAGINATE.apiPath
          ) ? (
            <User />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "roles",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath === ALL_PERMISSIONS.ROLES.GET_PAGINATE.apiPath
          ) ? (
            <Role />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "permissions",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath === ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE.apiPath
          ) ? (
            <Permission />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "customers",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath === ALL_PERMISSIONS.CUSTOMERS.GET_PAGINATE.apiPath
          ) ? (
            <Customer />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "customer-type-documents",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath ===
              ALL_PERMISSIONS.CUSTOMER_TYPE_DOCUMENTS.GET_PAGINATE.apiPath
          ) ? (
            <CustomerTypeDocument />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "customer-types",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath ===
              ALL_PERMISSIONS.CUSTOMER_TYPES.GET_PAGINATE.apiPath
          ) ? (
            <CustomerType />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "offices",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath === ALL_PERMISSIONS.OFFICES.GET_PAGINATE.apiPath
          ) ? (
            <OfficeAdmin />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "contracts",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath === ALL_PERMISSIONS.CONTRACTS.GET_PAGINATE.apiPath
          ) ? (
            <Contract />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "payment-contracts",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath ===
              ALL_PERMISSIONS.PAYMENT_CONTRACTS.GET_PAGINATE.apiPath
          ) ? (
            <PaymentContract />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "handover-status",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath ===
              ALL_PERMISSIONS.HANDOVER_STATUS.GET_PAGINATE.apiPath
          ) ? (
            <HandoverStatus />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "systems",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath === ALL_PERMISSIONS.SYSTEMS.GET_PAGINATE.apiPath
          ) ? (
            <System />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "subcontracts",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath === ALL_PERMISSIONS.SUBCONTRACTS.GET_PAGINATE.apiPath
          ) ? (
            <Subcontractor />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "maintenance-services",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath ===
              ALL_PERMISSIONS.SYSTEM_MAINTENANCE_SERVICES.GET_PAGINATE.apiPath
          ) ? (
            <SystemMaintenanceService />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "maintenance-histories",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath ===
              ALL_PERMISSIONS.MAINTENANCE_HISTORIES.GET_PAGINATE.apiPath
          ) ? (
            <MaintenanceHistory />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "devices",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath === ALL_PERMISSIONS.DEVICES.GET_PAGINATE.apiPath
          ) ? (
            <Device />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "device-types",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath === ALL_PERMISSIONS.DEVICE_TYPES.GET_PAGINATE.apiPath
          ) ? (
            <DeviceType />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "electricity-usages",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath ===
              ALL_PERMISSIONS.ELECTRICITY_USAGES.GET_PAGINATE.apiPath
          ) ? (
            <ElectricityUsage />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "meters",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath === ALL_PERMISSIONS.METERS.GET_PAGINATE.apiPath
          ) ? (
            <Meter />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "quotations",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath === ALL_PERMISSIONS.QUOTATIONS.GET_PAGINATE.apiPath
          ) ? (
            <Quotation />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "repair-proposals",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath ===
              ALL_PERMISSIONS.REPAIR_PROPOSALS.GET_PAGINATE.apiPath
          ) ? (
            <RepairProposal />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "risk-assessments",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath ===
              ALL_PERMISSIONS.RISK_ASSESSMENTS.GET_PAGINATE.apiPath
          ) ? (
            <RiskAssessment />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "risk-assessments",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath ===
              ALL_PERMISSIONS.RISK_ASSESSMENTS.GET_PAGINATE.apiPath
          ) ? (
            <RiskAssessment />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "notifications",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath ===
              ALL_PERMISSIONS.NOTIFICATION_MAINTENANCES.GET_PAGINATE.apiPath
          ) ? (
            <NotificationMaintenance />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "tasks",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath === ALL_PERMISSIONS.TASKS.GET_PAGINATE.apiPath
          ) ? (
            <Task />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "work-registrations",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath ===
              ALL_PERMISSIONS.WORK_REGISTRATIONS.GET_PAGINATE.apiPath
          ) ? (
            <WorkRegistration />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "repair-requests",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath ===
              ALL_PERMISSIONS.REPAIR_REQUEST.GET_PAGINATE.apiPath
          ) ? (
            <RepairRequest />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "item-checks",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath === ALL_PERMISSIONS.ITEM_CHECKS.GET_PAGINATE.apiPath
          ) ? (
            <ItemCheck />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },
        {
          path: "electricity-rates",
          element: user?.role?.permissions?.some(
            (perm) =>
              perm.apiPath ===
              ALL_PERMISSIONS.ELECTRICITY_RATES.GET_PAGINATE.apiPath
          ) ? (
            <ElectricityRate />
          ) : (
            <Navigate to="/dashboard" />
          ),
        },

      ],
    },
    {
      path: "login",
      element: localStorage.getItem("access_token") ? (
        <Navigate to="/dashboard" />
      ) : (
        <Login />
      ),
    },
    {
      path: "forgot-password",
      element: localStorage.getItem("access_token") ? (
        <Navigate to="/dashboard" />
      ) : (
        <Login />
      ),
    },
    {
      path: "reset-password",
      element: localStorage.getItem("access_token") ? (
        <Navigate to="/dashboard" />
      ) : (
        <Login />
      ),
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
