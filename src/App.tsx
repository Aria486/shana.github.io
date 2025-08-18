import { Routes, Route, Navigate } from 'react-router-dom';
import LangWrapper from './router';
import Home from './components/Home';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/zh-CN" />} />
      <Route path="/:lang" element={<LangWrapper />}>
        <Route index element={<Home />} />
      </Route>
      <Route path="*" element={<Navigate replace to="/zh-CN" />} />
    </Routes>
  );
}