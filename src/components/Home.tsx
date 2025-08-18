import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState('');

  const locales = ['zh-CN', 'en', 'ja'];

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', textAlign: 'center' }}>
      <h1>{t('title')}</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        style={{ padding: '.5rem', width: '80%', marginBottom: '1rem' }}
      />

      <p>{t('greeting', { name })}</p>

      <div>
        {locales.map((loc) => (
          <a
            key={loc}
            href={`/${loc}`}
            style={{
              margin: '0 .25rem',
              padding: '.3rem .6rem',
              background: i18n.language === loc ? '#007bff' : '#eee',
              color: i18n.language === loc ? 'white' : 'inherit',
              textDecoration: 'none'
            }}
          >
            {loc}
          </a>
        ))}
      </div>
    </div>
  );
}

