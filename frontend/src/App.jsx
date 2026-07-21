import { BrowserRouter, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import AnalyzePage from "./pages/AnalyzePage";
import ResultsPage from "./pages/ResultsPage";
import HistoryPage from "./pages/HistoryPage";
import NotFoundPage from "./pages/NotFoundPage";

import ResumeBuilderLandingPage from "./pages/resume-builder/ResumeBuilderLandingPage";
import TemplateSelectionPage from "./pages/resume-builder/TemplateSelectionPage";
import ResumeBuilderUploadPage from "./pages/resume-builder/ResumeBuilderUploadPage";
import ResumeBuilderEditPage from "./pages/resume-builder/ResumeBuilderEditPage";
import ResumeReviewPage from "./pages/resume-builder/ResumeReviewPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />

          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analyze" element={<AnalyzePage />} />

          <Route path="/resume-builder" element={<ResumeBuilderLandingPage />} />
          <Route
            path="/resume-builder/templates"
            element={<TemplateSelectionPage />}
          />
          <Route
            path="/resume-builder/upload"
            element={<ResumeBuilderUploadPage />}
          />
          <Route
            path="/resume-builder/edit"
            element={<ResumeBuilderEditPage />}
          />
          <Route
            path="/resume-builder/review"
            element={<ResumeReviewPage />}
          />

          <Route path="/results/:id" element={<ResultsPage />} />
          <Route path="/history" element={<HistoryPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;