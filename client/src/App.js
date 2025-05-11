import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { AuthContextProvider } from "./Context";
import NavBar from "./components/NavBar";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ForgetPassword from "./components/ForgetPassword";
import ResetPassword from "./components/ResetPassword";
import ViewFilePage from "./pages/ViewFilePage";
import UploadFilePage from "./pages/UploadFilePage";
import UserProfilePage from "./pages/UserProfilePage";
import DocumentListPage from "./pages/DocumentListPage";
import ViewDepartments from "./pages/ViewDepartments";
import ViewPdf from "./components/ViewPdf";
import UserFilePage from "./pages/UserFilePage";
import DocumentsToSignPage from "./pages/DocumentsToSignPage";
import DisplayAllUsers from "./pages/DisplayAllUsers";
import CreateDepartment from "./pages/CreateDepartment";
import EditDepartmentPage from "./pages/EditDepartmentPage";
import CreateVoucher from "./pages/CreateVoucher";
import DisplayAllVouchers from "./pages/DisplayAllVouchers";
import EditVoucherPage from "./pages/EditVoucherPage";

function App() {
  return (
    <div>
      <AuthContextProvider>
        <NavBar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgetPassword />} />
          <Route
            path="/reset-password/:resetToken"
            element={<ResetPassword />}
          />
          <Route path="/" element={<HomePage />} />
          <Route path="/allfiles" element={<ViewFilePage />} />
          <Route path="/upload" element={<UploadFilePage />} />
          <Route path="/documentlist/:id" element={<DocumentListPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/viewpdf/:id" element={<ViewPdf />} />
          <Route path="/files" element={<UserFilePage />} />
          <Route path="/signfiles" element={<DocumentsToSignPage />} />
          <Route path="/allemployees" element={<DisplayAllUsers />} />
          <Route path="/add-department" element={<CreateDepartment />} />
          <Route path="/departments" element={<ViewDepartments />} />
          <Route
            path="/edit-department/:departmentId"
            element={<EditDepartmentPage />}
          />
          <Route path="/add-voucher" element={<CreateVoucher />} />
          <Route path="/vouchers" element={<DisplayAllVouchers />} />
          <Route
            path="/edit-voucher/:voucherId"
            element={<EditVoucherPage />}
          />
        </Routes>
      </AuthContextProvider>
    </div>
  );
}

export default App;
