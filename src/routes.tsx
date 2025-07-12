import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import * as Views from "./views/containers";
import { PATHS } from "./constants";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
        <Routes>
          
          <Route path="/" element={<Navigate to={PATHS.LOGIN.path} />} />
          
          <Route path={PATHS.LOGIN.path} element={<Views.Login />} />

          <Route path={PATHS.REGISTER.path} element={<Views.RegisterMain />}>
            <Route path={PATHS.REGISTER.USER_INFO.path} element={<Views.RegisterUserInfo />} />
            <Route path={PATHS.REGISTER.PRE_TEST.path} element={<Views.RegisterPreTest />} />
            <Route path={PATHS.REGISTER.TERMS_AND_CONDITIONS.path} element={<Views.RegisterTermsAndConditions />} />
            <Route index element={<Navigate to={PATHS.REGISTER.USER_INFO.path} replace />} />
          </Route>

          <Route path={PATHS.USER_MAIN.path} element={<Views.UserMain />}>
              <Route path={PATHS.USER_VIEW.HOME.path} element={<Views.Home />} />
              <Route path={PATHS.USER_VIEW.MY_SKILLS.path} element={<Views.MySkills />} />
              <Route path={PATHS.USER_VIEW.LEADERBOARD.path} element={<Views.Leaderboard />} />
      
              <Route path=":game/preview" element={<Views.GamePreview />} />
              <Route path=":game/start" element={<Views.GameStart />} />
      
              {/* <Route path="*" element={<Navigate to={PATHS.USER_MAIN.path} replace />} /> */}
          </Route>

        </Routes>
    </BrowserRouter>
  )
}