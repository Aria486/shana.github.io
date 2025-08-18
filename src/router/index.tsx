import { useEffect } from 'react';
import { useParams, Outlet, Navigate } from 'react-router-dom';
import i18n from '../i18n';

const supported = ['zh-CN', 'en', 'ja'];

export default function LangWrapper() {
  const params = useParams<{ lang: string }>();

  useEffect(() => {
    if (params.lang && supported.includes(params.lang)) {
      i18n.changeLanguage(params.lang);
    } else {
      console.log('不切换语言，因为参数无效或为空');
    }
  }, [params.lang]);


  if (!params.lang || !supported.includes(params.lang)) {
    return <Navigate replace to="/zh-CN" />;
  }
  return <Outlet />;
}