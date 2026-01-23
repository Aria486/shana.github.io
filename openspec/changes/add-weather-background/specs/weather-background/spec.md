# Spec: 天气动态背景能力

**类型**: 功能规格增量 (Feature Spec Delta)  
**关联变更**: add-weather-background  
**版本**: 1.0.0  
**状态**: Draft

---

## ADDED Requirements

### Requirement: 天气数据自动获取

**ID**: `REQ-WB-001`  
**优先级**: P0 (必须有)  
**描述**: 系统能够自动获取用户所在位置的实时天气数据，并提供手动城市选择作为替代方案

#### Scenario: 自动定位获取天气

**Given**: 用户首次访问博客，未设置过位置偏好  
**When**: WeatherBackground 组件加载  
**Then**:

- 请求浏览器地理位置权限（Geolocation API）
- 显示权限请求提示："允许获取位置以显示本地天气背景"
- 如果用户允许，获取经纬度坐标（精度 ±100 米）
- 调用 OpenWeatherMap API 获取该坐标的天气数据
- 天气数据包含：温度、天气状态码、描述、城市名
- 数据缓存到 localStorage，有效期 1 小时

#### Scenario: 用户拒绝定位权限

**Given**: 用户点击浏览器权限提示的"拒绝"按钮  
**When**: 权限请求被拒绝  
**Then**:

- 不再请求定位权限（避免重复打扰）
- 使用默认城市（北京：39.9042°N, 116.4074°E）获取天气
- 在设置面板提示："位置权限已拒绝，使用默认城市北京"
- 提供"手动输入城市"选项

#### Scenario: 手动输入城市

**Given**: 用户打开天气设置面板  
**When**: 选择"手动输入城市"并输入"Shanghai"  
**Then**:

- 调用 OpenWeatherMap API 通过城市名查询天气
- 如果城市名有效，返回该城市天气数据
- 如果城市名无效，显示错误提示："未找到城市，请检查拼写"
- 保存城市偏好到 localStorage
- 后续访问直接使用该城市

#### Scenario: API 调用失败降级

**Given**: 网络断开或 API 服务不可用  
**When**: 调用 OpenWeatherMap API 超时（10 秒）  
**Then**:

- 捕获错误，不中断页面加载
- 返回默认天气数据（晴天，温度 20°C）
- 控制台输出警告："天气数据加载失败，使用默认场景"
- 用户界面显示降级提示（可选）
- 后台每 5 分钟重试一次

---

### Requirement: 多样化天气场景渲染

**ID**: `REQ-WB-002`  
**优先级**: P0 (必须有)  
**描述**: 根据天气数据渲染对应的海滩场景，支持至少 6 种天气状态的视觉差异

#### Scenario: 晴天场景渲染

**Given**: 天气 API 返回状态码 `800` (Clear)  
**When**: BeachScene 组件渲染  
**Then**:

- 天空颜色：顶部 `#87CEEB`（天蓝色），底部 `#E0F6FF`（浅蓝色），渐变平滑
- 显示太阳：位置右上角（canvas 宽度 80%, 高度 20%），半径 40px，颜色 `#FDB813`
- 太阳光晕：3 层渐变圆环，透明度递减（0.3 → 0.1）
- 海浪动画：振幅 5px，频率 0.02，相位每帧增加 0.05
- 海浪颜色：深蓝 `#1E90FF` (前景) → 浅蓝 `#87CEEB` (远景)
- 沙滩颜色：米黄色 `#F4E4C1`，高度占 canvas 20%
- 无云朵、无降水粒子

#### Scenario: 雨天场景渲染

**Given**: 天气 API 返回状态码 `500-531` (Rain)  
**When**: BeachScene 组件渲染  
**Then**:

- 天空颜色：顶部 `#4A5568`（深灰），底部 `#6B7280`（中灰）
- 显示云朵：15-20 个，灰色 `rgba(100,100,100,0.7)`，水平移动速度 0.5-2 px/frame
- 海浪动画：振幅 15px（比晴天增加 3 倍），频率 0.03
- 雨滴粒子：高质量 500 个，中质量 300 个，低质量 150 个
- 雨滴外观：长度 12-18px，宽度 1px，颜色 `rgba(174,194,224,0.6)`
- 雨滴速度：垂直下落 8-12 px/frame，轻微斜角（模拟风向）
- 雨滴落到海面产生小涟漪（可选）

#### Scenario: 雪天场景渲染

**Given**: 天气 API 返回状态码 `600-622` (Snow)  
**When**: BeachScene 组件渲染  
**Then**:

- 天空颜色：顶部 `#CBD5E0`（浅灰），底部 `#E2E8F0`（白灰）
- 雪花粒子：高质量 400 个，中质量 250 个，低质量 120 个
- 雪花外观：圆形（半径 2-4px）或六边形，颜色 `rgba(255,255,255,0.9)`
- 雪花速度：垂直下落 2-4 px/frame（比雨慢 70%）
- 雪花摇摆：使用正弦波，`x += sin(time) * 2`
- 海浪动画：振幅 3px（平静），频率 0.015
- 海面颜色：深灰蓝 `#4A5568`（冷色调）

#### Scenario: 多云场景渲染

**Given**: 天气 API 返回状态码 `801-804` (Clouds)  
**When**: BeachScene 组件渲染  
**Then**:

- 天空颜色：顶部 `#A9B7C0`（灰蓝），底部 `#D3D3D3`（浅灰）
- 云朵数量：10-15 个
- 云朵层次：3 层（远景、中景、近景），速度分别为 0.3x, 0.6x, 1x
- 云朵形状：由 3-5 个椭圆组合，宽度 80-150px，高度 40-70px
- 云朵颜色：白色 `rgba(255,255,255,0.8)` (亮云) 或 灰色 `rgba(150,150,150,0.6)` (暗云)
- 海浪动画：振幅 8px，频率 0.025

#### Scenario: 雷暴场景渲染

**Given**: 天气 API 返回状态码 `200-232` (Thunderstorm)  
**When**: BeachScene 组件渲染  
**Then**:

- 天空颜色：顶部 `#2D3748`（暗灰），底部 `#4A5568`（深灰）
- 包含雨天所有元素（云朵、雨滴、激烈海浪）
- 额外显示闪电：每 2-5 秒随机触发一次
- 闪电外观：锯齿线条，起点云层，终点海面或地面，宽度 2-3px，颜色 `rgba(255,255,255,0.9)`
- 闪电持续时间：150-250 毫秒
- 闪电时天空闪光：整个 canvas 叠加白色 `rgba(255,255,255,0.3)`，持续 100 毫秒
- 海浪振幅：25px（最激烈）

#### Scenario: 雾天场景渲染

**Given**: 天气 API 返回状态码 `701-781` (Mist/Fog)  
**When**: BeachScene 组件渲染  
**Then**:

- 天空颜色：顶部 `#9CA3AF`（中灰），底部 `#D1D5DB`（浅灰）
- 雾气效果：整个 canvas 叠加半透明白色层 `rgba(255,255,255,0.5)`
- 海平线模糊：使用 canvas `filter: blur(5px)` 或渐变遮罩
- 能见度降低：远景元素（云朵、远处海浪）透明度降低 50%
- 海浪动画：振幅 4px（平静），频率 0.018
- 无降水粒子，无太阳

---

### Requirement: 流畅动画性能

**ID**: `REQ-WB-003`  
**优先级**: P0 (必须有)  
**描述**: 动画在目标设备上保持流畅，不影响页面主要功能的响应速度

#### Scenario: 桌面端高质量动画

**Given**: 用户使用桌面浏览器（屏幕宽度 >= 1024px，CPU 核心 >= 4）  
**When**: WeatherBackground 组件以 `quality='high'` 渲染  
**Then**:

- 动画帧率 >= 60 FPS（通过 requestAnimationFrame 测量）
- 雨滴粒子数 500 个
- 云朵数量 15-20 个
- 海浪层数 3 层（前景、中景、远景）
- Canvas 分层渲染：静态层（沙滩、天空）缓存，仅动态层每帧重绘
- CPU 占用率 < 30%（通过浏览器性能监视器测量）
- 内存占用 < 50MB

#### Scenario: 移动端低质量动画

**Given**: 用户使用手机浏览器（iOS Safari 或 Android Chrome）  
**When**: WeatherBackground 组件自动检测到移动设备  
**Then**:

- 自动降级到 `quality='low'`
- 动画帧率 >= 30 FPS
- 雨滴粒子数 150 个（比桌面端减少 70%）
- 云朵数量 5-10 个
- 海浪层数 1 层（仅前景）
- 粒子更新频率降低（每 2 帧更新一次位置）
- 手机发热控制：持续 5 分钟后自动暂停动画，显示静态背景

#### Scenario: 动态帧率降级

**Given**: 动画运行中，检测到帧率持续低于阈值  
**When**: 连续 60 帧平均 FPS < 45（高质量）或 < 25（中质量）  
**Then**:

- 自动降低质量等级（high → medium → low）
- 控制台输出警告："检测到性能不足，降低动画质量"
- 减少粒子数量（立即释放部分粒子到对象池）
- 降低更新频率（云朵从每帧更新改为每 3 帧更新）
- 如果降至 low 仍低于 25 FPS，完全禁用动画

#### Scenario: 首屏加载性能

**Given**: 用户首次访问博客  
**When**: 页面加载，WeatherBackground 组件懒加载  
**Then**:

- WeatherBackground 代码分割为独立 chunk，不阻塞首屏渲染
- 组件代码大小 < 50KB (gzip 压缩后)
- 首屏 Largest Contentful Paint (LCP) 增加 < 500 毫秒
- 主线程阻塞时间 (TBT) 增加 < 100 毫秒
- 天气 API 调用异步进行，不阻塞 DOM 渲染

---

### Requirement: 用户控制与偏好

**ID**: `REQ-WB-004`  
**优先级**: P1 (应该有)  
**描述**: 用户能够控制背景动画的启用/禁用、质量级别、城市选择等设置

#### Scenario: 开关背景动画

**Given**: 用户打开天气设置面板  
**When**: 点击"启用背景动画"开关  
**Then**:

- 开关状态从 ON 切换到 OFF（或反之）
- 设置立即保存到 localStorage（键名 `weather_settings`）
- 如果关闭，Canvas 元素隐藏（`display: none`），动画循环停止
- 如果开启，Canvas 元素显示，重新初始化动画
- 页面刷新后设置保持

#### Scenario: 选择动画质量

**Given**: 用户打开天气设置面板  
**When**: 选择动画质量为"中等"  
**Then**:

- 质量设置从"高"切换到"中"
- 粒子数量从 500 调整到 300
- 云朵数量从 20 调整到 15
- 海浪层数从 3 调整到 2
- 变更立即生效，无需刷新页面
- 设置保存到 localStorage

#### Scenario: 手动刷新天气

**Given**: 用户打开天气设置面板  
**When**: 点击"刷新天气"按钮  
**Then**:

- 清除 localStorage 中的天气缓存
- 立即重新调用天气 API
- 显示加载指示器（按钮文字变为"加载中..."，禁用按钮）
- 加载成功后更新场景渲染
- 按钮恢复可用状态
- 新数据重新缓存 1 小时

#### Scenario: 响应系统动画偏好

**Given**: 用户在操作系统设置中启用"减少动画"（Accessibility 设置）  
**When**: 浏览器检测到 `prefers-reduced-motion: reduce`  
**Then**:

- 自动禁用背景动画（无论用户设置）
- 显示静态海滩背景图片（或纯色背景）
- 设置面板中显示提示："系统已启用减少动画，背景动画已禁用"
- "启用背景动画"开关变为不可用（灰色）
- 如果用户关闭系统设置，自动恢复动画

#### Scenario: 设置面板可访问性

**Given**: 用户使用键盘导航  
**When**: 按 Tab 键浏览设置面板  
**Then**:

- 焦点顺序合理：开关 → 质量选择 → 城市输入 → 刷新按钮 → 保存按钮
- 焦点状态清晰可见（蓝色轮廓，`outline: 2px solid #1890ff`）
- 按 Enter 键可激活按钮
- 按空格键可切换开关状态
- 所有控件有 `aria-label` 属性

---

### Requirement: 响应式设计适配

**ID**: `REQ-WB-005`  
**优先级**: P0 (必须有)  
**描述**: 背景动画在不同屏幕尺寸和设备方向上正确显示，不影响内容可读性

#### Scenario: 桌面端显示

**Given**: 用户使用桌面浏览器（分辨率 1920x1080）  
**When**: 查看博客页面  
**Then**:

- Canvas 尺寸 100vw x 100vh（全屏）
- 背景不透明度 0.6（确保前景文字可读）
- 所有动画元素正确缩放（太阳、云朵、海浪）
- 粒子分布均匀覆盖整个屏幕
- z-index: -1（背景层，不遮挡前景内容）
- 不影响鼠标事件（`pointer-events: none`）

#### Scenario: 平板端显示

**Given**: 用户使用 iPad（分辨率 768x1024）  
**When**: 查看博客页面  
**Then**:

- Canvas 尺寸自适应（768x1024）
- 自动切换到中等质量（粒子数 300）
- 云朵大小缩小 20%（适应小屏幕）
- 太阳位置调整到右上角（margin: 5% 5%）
- 沙滩高度占比 15%（桌面端为 20%）

#### Scenario: 手机端显示

**Given**: 用户使用 iPhone（分辨率 375x667）  
**When**: 查看博客页面  
**Then**:

- Canvas 尺寸 375x667
- 自动切换到低质量（粒子数 150）
- 云朵数量减少到 5-8 个
- 海浪振幅减半（避免视觉混乱）
- 背景不透明度降低到 0.4（移动端屏幕小，需更透明）

#### Scenario: 屏幕旋转适配

**Given**: 用户使用手机横屏浏览（667x375）  
**When**: 屏幕从竖屏旋转到横屏  
**Then**:

- Canvas 尺寸实时调整为 667x375
- 太阳位置重新计算（保持在右上角）
- 云朵和粒子位置重新分布（避免堆积）
- 动画不中断，平滑过渡
- 设置面板适配横屏布局（如果打开）

#### Scenario: 超宽屏显示

**Given**: 用户使用超宽屏显示器（3440x1440，21:9）  
**When**: 查看博客页面  
**Then**:

- Canvas 尺寸 3440x1440
- 粒子数量不超过上限（避免性能问题）
- 云朵水平分布更广（利用宽屏空间）
- 海浪波长拉长（适应宽屏比例）
- 中心内容区域保持可读（背景两侧扩展）

---

### Requirement: 数据缓存与优化

**ID**: `REQ-WB-006`  
**优先级**: P0 (必须有)  
**描述**: 天气数据缓存到本地存储，减少 API 调用次数，节省配额

#### Scenario: 缓存有效期内复用数据

**Given**: 用户 30 分钟前访问过博客，天气数据已缓存  
**When**: 用户再次访问博客  
**Then**:

- 检查 localStorage 中的 `weather_cache_v1` 键
- 读取缓存数据和时间戳
- 计算缓存年龄：`Date.now() - timestamp`
- 如果年龄 < 1 小时（3600000 毫秒），使用缓存数据
- 不调用天气 API
- 控制台输出："Using cached weather data (age: 30 min)"

#### Scenario: 缓存过期后更新

**Given**: 用户 2 小时前访问过博客，缓存已过期  
**When**: 用户再次访问博客  
**Then**:

- 检查缓存，发现年龄 > 1 小时
- 删除旧缓存数据
- 调用天气 API 获取新数据
- 保存新数据到 localStorage，附带新时间戳
- 控制台输出："Cache expired, fetching new data"

#### Scenario: 不同位置独立缓存

**Given**: 用户在北京访问博客，缓存了北京天气  
**When**: 用户切换到上海（手动输入城市或移动到上海）  
**Then**:

- 缓存键格式：`weather_cache_v1_39.90_116.40`（北京坐标）
- 上海使用独立缓存键：`weather_cache_v1_31.23_121.47`
- 两个城市的天气数据互不干扰
- 切换回北京时，如果缓存未过期，直接使用北京缓存

#### Scenario: localStorage 容量不足

**Given**: 用户浏览器 localStorage 已满（通常 5-10MB 限制）  
**When**: 尝试保存天气数据到 localStorage  
**Then**:

- 捕获 `QuotaExceededError` 异常
- 降级到内存缓存（sessionStorage 或 JavaScript 变量）
- 控制台输出警告："localStorage full, using session cache"
- 内存缓存仅在当前会话有效，刷新页面后失效
- 功能正常使用，不报错

#### Scenario: 缓存数据损坏

**Given**: localStorage 中的天气数据被恶意脚本或浏览器 bug 损坏  
**When**: 读取缓存数据并尝试 JSON.parse  
**Then**:

- 捕获 `SyntaxError` 异常
- 删除损坏的缓存数据
- 重新调用 API 获取新数据
- 控制台输出警告："Cache corrupted, re-fetching data"
- 不影响用户体验（自动恢复）

---

### Requirement: 错误处理与降级

**ID**: `REQ-WB-007`  
**优先级**: P0 (必须有)  
**描述**: 天气 API 或浏览器 API 失败时，系统优雅降级，不影响博客核心功能

#### Scenario: 天气 API 超时

**Given**: 网络不稳定或 API 服务器响应慢  
**When**: 天气 API 调用超过 10 秒未响应  
**Then**:

- 中止请求（使用 `AbortController`）
- 返回默认天气数据（晴天，20°C，城市名"Default"）
- 控制台输出错误："Weather API timeout, using default"
- 渲染默认晴天场景
- 后台每 5 分钟重试一次（最多 3 次）

#### Scenario: 天气 API 返回错误状态码

**Given**: API 返回 401 (未授权) 或 429 (请求过多)  
**When**: 解析 API 响应  
**Then**:

- 检查 `response.status`
- 如果 401，输出错误："Invalid API key"，禁用背景（避免配额浪费）
- 如果 429，输出警告："Rate limit exceeded, retry in 1 hour"
- 返回默认天气数据
- 标记 API 不可用，1 小时内不再尝试

#### Scenario: Geolocation API 不可用

**Given**: 用户浏览器不支持 Geolocation API（旧版 IE）  
**When**: 检测 `navigator.geolocation`  
**Then**:

- 检测到 `undefined`
- 跳过定位步骤
- 直接使用默认城市（北京）
- 控制台输出："Geolocation not supported, using default city"
- 设置面板显示提示："浏览器不支持定位，请手动输入城市"

#### Scenario: Canvas API 不可用

**Given**: 用户浏览器不支持 Canvas 2D（极少见）  
**When**: 检测 `typeof HTMLCanvasElement`  
**Then**:

- 检测到 `undefined`
- 完全禁用背景组件（不渲染 Canvas）
- 显示静态背景色（`background: linear-gradient(#87CEEB, #E0F6FF)`）
- 控制台输出："Canvas not supported, using static background"

#### Scenario: JavaScript 错误不影响页面

**Given**: WeatherBackground 组件内部抛出未捕获的异常  
**When**: 渲染或动画循环中发生错误  
**Then**:

- 使用 React Error Boundary 捕获错误
- 显示降级 UI（纯色背景或静态图片）
- 错误日志发送到控制台（不显示给用户）
- 博客其他功能（笔记列表、搜索、主题切换）完全正常

---

## MODIFIED Requirements

无修改现有规格。本变更为新增能力。

---

## REMOVED Requirements

无移除规格。本变更为新增能力。

---

## 关联能力

- **依赖**: `ui-components/layout`（BlogLayout 集成）
- **依赖**: `theme-switching`（明暗主题适配）
- **依赖**: `global-settings`（天气设置存储到 GlobalDataProvider）
- **关联**: `performance-optimization`（Canvas 分层、代码分割）
- **关联**: `accessibility`（prefers-reduced-motion 支持）

---

## 验收检查清单

### 功能验收

- [ ] **天气数据集成**:
  - [ ] 自动定位获取天气成功
  - [ ] 手动输入城市获取天气成功
  - [ ] 天气数据缓存 1 小时有效
  - [ ] 缓存过期后自动更新
  - [ ] API 失败时降级到默认晴天

- [ ] **场景渲染**:
  - [ ] 晴天场景：蓝天 + 太阳 + 平缓海浪
  - [ ] 多云场景：灰天 + 15 个云朵 + 中等海浪
  - [ ] 雨天场景：深灰天 + 300-500 雨滴 + 激烈海浪
  - [ ] 雪天场景：白灰天 + 250-400 雪花 + 平静海浪
  - [ ] 雷暴场景：暗天 + 雨滴 + 闪电（2-5 秒间隔）
  - [ ] 雾天场景：朦胧天 + 模糊海平线

- [ ] **动画性能**:
  - [ ] 桌面端高质量 >= 60 FPS
  - [ ] 移动端低质量 >= 30 FPS
  - [ ] 帧率低于阈值自动降级
  - [ ] 首屏加载时间增加 < 500ms
  - [ ] 内存占用 < 50MB

- [ ] **用户控制**:
  - [ ] 设置面板可开关动画
  - [ ] 可选择质量（高/中/低）
  - [ ] 可手动输入城市
  - [ ] 可手动刷新天气
  - [ ] 设置保存到 localStorage

- [ ] **响应式设计**:
  - [ ] 桌面端（1920x1080）正常显示
  - [ ] 平板端（768x1024）正常显示
  - [ ] 手机端（375x667）正常显示
  - [ ] 屏幕旋转自动适配
  - [ ] 超宽屏（21:9）正常显示

### 技术验收

- [ ] **代码质量**:
  - [ ] TypeScript 类型安全（无 `any`）
  - [ ] ESLint 无错误/警告
  - [ ] 组件符合项目规范（独立文件夹 + 样式 + 测试）
  - [ ] 样式使用 SCSS 模块化

- [ ] **测试覆盖**:
  - [ ] WeatherService 单元测试覆盖率 >= 80%
  - [ ] BeachScene 组件测试覆盖率 >= 70%
  - [ ] 缓存逻辑测试通过
  - [ ] 错误处理测试通过

- [ ] **性能优化**:
  - [ ] Canvas 分层渲染生效
  - [ ] 静态层缓存正确
  - [ ] 代码分割成功（独立 chunk）
  - [ ] 懒加载生效

- [ ] **无障碍性**:
  - [ ] 支持 `prefers-reduced-motion`
  - [ ] 键盘导航流畅
  - [ ] 焦点状态清晰
  - [ ] 所有控件有 ARIA 标签

### 浏览器兼容性

- [ ] Chrome 90+ 测试通过
- [ ] Firefox 88+ 测试通过
- [ ] Safari 14+ 测试通过
- [ ] Edge 90+ 测试通过
- [ ] iOS Safari 14+ 测试通过
- [ ] Android Chrome 90+ 测试通过

### 安全性验收

- [ ] API Key 不暴露在代码中（环境变量）
- [ ] 请求频率限制（客户端）
- [ ] 城市名输入 XSS 防护
- [ ] 错误消息不泄露敏感信息

---

## 参考资料

- [OpenWeatherMap Current Weather API](https://openweathermap.org/current)
- [MDN Canvas API Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [MDN Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Web Animations Performance Best Practices](https://developer.mozilla.org/en-US/docs/Web/Performance/Animation_performance_and_frame_rate)
- [WCAG 2.1 Animation Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions)
