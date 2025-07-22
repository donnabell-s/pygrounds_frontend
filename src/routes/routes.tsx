import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import * as Views from "../views/containers";
import { PATHS } from "../constants";
import ProtectedRoute from "../routes/ProtectedRoute";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={PATHS.LANDING.path} />} />

        <Route path={PATHS.LANDING.path} element={<Views.Landing />} />
        
        <Route path={PATHS.LOGIN.path} element={<Views.Login />} />

        <Route path={PATHS.REGISTER.path} element={<Views.RegisterMain />}>
          <Route path={PATHS.REGISTER.USER_INFO.path} element={<Views.RegisterUserInfo />} />
          <Route path={PATHS.REGISTER.PRE_TEST.path} element={<Views.RegisterPreTest />} />
          <Route path={PATHS.REGISTER.TERMS_AND_CONDITIONS.path} element={<Views.RegisterTermsAndConditions />} />
          <Route index element={<Navigate to={PATHS.REGISTER.USER_INFO.path} replace />} />
        </Route>

        {/* ✅ Protected Routes */}
        <Route element={<ProtectedRoute roles={['learner']} />}>
          <Route path={PATHS.USER_MAIN.path} element={<Views.UserMain />}>
            <Route path={PATHS.USER_VIEW.HOME.path} element={<Views.Home />} />
            <Route path={PATHS.USER_VIEW.MY_PROFILE.path} element={<Views.MyProfile />} />
            <Route path={PATHS.USER_VIEW.PYTHON_LEARN.path} element={<Views.PythonLearn />} />
            <Route path={PATHS.USER_VIEW.LEADERBOARD.path} element={<Views.Leaderboard />} />
            <Route path=":game/preview" element={<Views.GamePreview />} />
            <Route path=":game/start" element={<Views.GameStart />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
