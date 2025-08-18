import './i18n';
import { useTranslation } from 'react-i18next';

function App() {
  const { t } = useTranslation();

  return (
    <div className="App">
      <h1>{t('common.welcome')}</h1>
      <button>{t('common.login')}</button>
    </div>
  );
}

export default App;