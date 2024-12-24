import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Header } from './components/layout/Header/Header';
import { Sidebar } from './components/layout/Sidebar/Sidebar';
import { Footer } from './components/layout/Footer/Footer';

import OverviewView from './views/Overview/OverviewView';
import AnalysisView from './views/Analysis/AnalysisView';
import OpportunitiesView from './views/Opportunities/OpportunitiesView';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark">
        <div className="flex">
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 w-64">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="ml-64 flex-1 min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 p-6">
              <Routes>
                <Route path="/" element={<OverviewView />} />
                <Route path="/analysis" element={<AnalysisView />} />
                <Route path="/opportunities" element={<OpportunitiesView />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;