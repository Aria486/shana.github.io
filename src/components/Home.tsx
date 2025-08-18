import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

export default function Home() {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState('');
  const params = useParams<{ lang: string }>();

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
          <Link
            key={loc}
            to={`/${loc}`}
            style={{
              margin: '0 .25rem',
              padding: '.3rem .6rem',
              background: params.lang === loc ? '#007bff' : '#eee',
              color: params.lang === loc ? 'white' : 'inherit',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            {loc}
          </Link>
        ))}
      </div>

      <p>当前语言: {i18n.language}</p>
      <p>URL参数: {params.lang}</p>
    </div>
  );
}