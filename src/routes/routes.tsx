import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import * as Views from "../views/containers";
import { PATHS } from "../constants";
import ProtectedRoute from "../routes/ProtectedRoute";
import ProtectedGameRoute from "../routes/ProtectedGameRoute";
import ProtectedAdminRoute from "../routes/ProtectedAdminRoute";

export const AppRoutes = () => {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={PATHS.LANDING.path} />} />

        <Route path={PATHS.LANDING.path} element={<Views.Landing />} />
      
        
        <Route path={PATHS.LOGIN.path} element={<Views.Login />} />
        
        <Route path={PATHS.ADMIN_LOGIN.path} element={<Views.AdminLogin />} />

        
        <Route path={PATHS.REGISTER.path} element={<Views.RegisterMain />}>
          <Route path={PATHS.REGISTER.USER_INFO.path} element={<Views.RegisterUserInfo />} />
          <Route path={PATHS.REGISTER.PRE_TEST.path} element={<Views.RegisterPreTest />} />
          <Route path={PATHS.REGISTER.TERMS_AND_CONDITIONS.path} element={<Views.RegisterTermsAndConditions />} />
          <Route index element={<Navigate to={PATHS.REGISTER.USER_INFO.path} replace />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path={PATHS.USER_MAIN.path} element={<Views.UserMain />}>
            <Route path={PATHS.USER_VIEW.HOME.path} element={<Views.Home />} />
            <Route path={PATHS.USER_VIEW.USER_PROFILE.path} element={<Views.UserProfile />} />
            <Route path={PATHS.USER_VIEW.PYTHON_LEARN.path} element={<Views.PythonLearn />} />
            <Route path={PATHS.USER_VIEW.LEADERBOARD.path} element={<Views.Leaderboard />} />
            <Route path={PATHS.GAME_VIEW.GAME_PREVIEW.path} element={<Views.GamePreview />} />
            <Route path={PATHS.GAME_VIEW.GAME_START.path} element={<ProtectedGameRoute><Views.GameStart /></ProtectedGameRoute>}/>
            <Route path={PATHS.USER_VIEW.SETTINGS.path} element={<Views.Settings />} />
          </Route>
        </Route>

        <Route element={<ProtectedAdminRoute />}>
          <Route path={PATHS.ADMIN_MAIN.path} element={<Views.AdminMain />}>
            <Route index element={<Navigate to={PATHS.ADMIN_VIEW.ADMIN_VIEWS.DASHBOARD.path} replace />} />
            <Route path={PATHS.ADMIN_VIEW.ADMIN_VIEWS.DASHBOARD.path} element={<Views.Dashboard />} />
            <Route path={PATHS.ADMIN_VIEW.ADMIN_VIEWS.NOTIFICATIONS.path} element={<Views.Notifications />} />
            <Route path={PATHS.ADMIN_VIEW.TOPIC_MANAGEMENT.ZONE.path} element={<Views.ViewZone />} />
            <Route path={PATHS.ADMIN_VIEW.TOPIC_MANAGEMENT.TOPIC.path} element={<Views.ViewTopic />} />
            <Route path={PATHS.ADMIN_VIEW.TOPIC_MANAGEMENT.SUBTOPIC.path} element={<Views.ViewSubtopic />} />
            <Route path={PATHS.ADMIN_VIEW.CONTENT_UPLOAD.path} element={<Views.ContentUpload />} />
            <Route path={PATHS.ADMIN_VIEW.USER_MANAGEMENT.VIEW_USERS.path} element={<Views.ViewUsers />} />
            <Route path={PATHS.ADMIN_VIEW.QUESTION_MANAGEMENT.VIEW_QUESTIONS.path} element={<Views.QuestionBank />} />
          </Route>
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
};
