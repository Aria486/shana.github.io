import React from 'react';
import { Modal, Switch, Select, Space, Typography, Segmented } from 'antd';
import { CloudOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useGlobalData } from '@/context';
import { useClsAddPrefix } from '@/hooks';
import { useTranslation } from 'react-i18next';
import type { WeatherCondition } from '../WeatherBackground/types';
import './style.scss';

const { Title, Text } = Typography;
const { Option } = Select;

interface IWeatherSettingsProps {
  open: boolean;
  onClose: () => void;
}

const weatherOptions: Array<{ value: WeatherCondition; labelKey: string; icon: string }> = [
  { value: 'Clear', labelKey: 'clear', icon: '☀️' },
  { value: 'Clouds', labelKey: 'clouds', icon: '☁️' },
  { value: 'Rain', labelKey: 'rain', icon: '🌧️' },
  { value: 'Thunderstorm', labelKey: 'thunderstorm', icon: '⛈️' },
  { value: 'Snow', labelKey: 'snow', icon: '❄️' },
  { value: 'Mist', labelKey: 'mist', icon: '🌫️' },
];

export const WeatherSettings: React.FC<IWeatherSettingsProps> = ({ open, onClose }) => {
  const prefixCls = useClsAddPrefix('weather-settings');
  const { globalData, update } = useGlobalData();
  const { t } = useTranslation();

  const useWeatherBackground = globalData.useWeatherBackground === true;
  const weatherCondition = (globalData.weatherCondition as WeatherCondition) || 'Clear';
  const themeType = globalData.themeType || 'light';

  const handleBackgroundModeChange = (checked: boolean) => {
    update('useWeatherBackground', checked);
  };

  const handleWeatherChange = (value: WeatherCondition) => {
    update('weatherCondition', value);
  };

  const handleThemeChange = (value: string | number) => {
    update('themeType', value);
  };

  return (
    <Modal
      title={
        <Space>
          <CloudOutlined />
          <span>{t('weatherSettings.title')}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      className={prefixCls}
      width={400}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div className={`${prefixCls}-item`}>
          <div className={`${prefixCls}-item-label`}>
            <Text strong>{t('weatherSettings.backgroundMode')}</Text>
            <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
              {t('weatherSettings.backgroundModeDesc')}
            </Text>
          </div>
          <Switch
            checked={useWeatherBackground}
            onChange={handleBackgroundModeChange}
            checkedChildren={t('coming soon')}
            unCheckedChildren={t('weatherSettings.theme')}
          />
        </div>

        {!useWeatherBackground && (
          <div className={`${prefixCls}-item`}>
            <div className={`${prefixCls}-item-label`}>
              <Text strong>{t('weatherSettings.themeMode')}</Text>
            </div>
            <Segmented
              value={themeType}
              onChange={handleThemeChange}
              options={[
                {
                  label: (
                    <Space>
                      <SunOutlined />
                      <span>{t('weatherSettings.lightTheme')}</span>
                    </Space>
                  ),
                  value: 'light',
                },
                {
                  label: (
                    <Space>
                      <MoonOutlined />
                      <span>{t('weatherSettings.darkTheme')}</span>
                    </Space>
                  ),
                  value: 'dark',
                },
              ]}
              style={{ width: '100%' }}
            />
          </div>
        )}

        {useWeatherBackground && (
          <div className={`${prefixCls}-item`}>
            <div className={`${prefixCls}-item-label`}>
              <Text strong>{t('weatherSettings.weatherType')}</Text>
              <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
                {t('weatherSettings.weatherTypeDesc')}
              </Text>
            </div>
            <Select
              value={weatherCondition}
              onChange={handleWeatherChange}
              style={{ width: '100%' }}
            >
              {weatherOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  <Space>
                    <span>{option.icon}</span>
                    <span>{t(`weatherSettings.weather.${option.labelKey}`)}</span>
                  </Space>
                </Option>
              ))}
            </Select>
          </div>
        )}

        <div className={`${prefixCls}-tip`}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {useWeatherBackground
              ? t('weatherSettings.tip')
              : t('weatherSettings.themeTip')
            }
          </Text>
        </div>
      </Space>
    </Modal>
  );
};
