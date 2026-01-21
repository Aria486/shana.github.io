const n=`# Session Cookie 安全策略

## 1. 什么是 Session Cookie

Session Cookie 是服务器用来跟踪用户会话状态的重要机制。当用户登录后,服务器会创建一个 Session,并将 Session ID 通过 Cookie 发送给客户端浏览器。后续请求中,浏览器会自动携带这个 Cookie,服务器通过 Session ID 识别用户身份。

## 2. 主要安全威胁

### 2.1 会话劫持 (Session Hijacking)

攻击者通过窃取用户的 Session Cookie,冒充合法用户进行操作。

### 2.2 跨站脚本攻击 (XSS)

通过注入恶意脚本窃取 Cookie 信息。

### 2.3 跨站请求伪造 (CSRF)

利用用户已登录的会话,诱导用户执行非预期的操作。

### 2.4 会话固定攻击 (Session Fixation)

攻击者诱导用户使用指定的 Session ID,从而劫持会话。

## 3. 核心安全属性

### 3.1 HttpOnly 属性

\`\`\`http
Set-Cookie: sessionId=abc123; HttpOnly
\`\`\`

**作用:**

- 防止 JavaScript 通过 \`document.cookie\` 访问 Cookie
- 有效防御 XSS 攻击窃取 Session Cookie

**最佳实践:**

- 所有包含敏感信息的 Cookie 都应设置 HttpOnly
- 特别是 Session Cookie 必须启用此属性

### 3.2 Secure 属性

\`\`\`http
Set-Cookie: sessionId=abc123; Secure
\`\`\`

**作用:**

- 仅在 HTTPS 连接中传输 Cookie
- 防止中间人攻击(MITM)窃取 Cookie

**最佳实践:**

- 生产环境必须使用 HTTPS
- 所有 Session Cookie 必须设置 Secure 属性

### 3.3 SameSite 属性

\`\`\`http
Set-Cookie: sessionId=abc123; SameSite=Strict
Set-Cookie: sessionId=abc123; SameSite=Lax
Set-Cookie: sessionId=abc123; SameSite=None; Secure
\`\`\`

**三种模式:**

| 模式     | 说明                                       | 使用场景                    |
| -------- | ------------------------------------------ | --------------------------- |
| \`Strict\` | 完全禁止第三方 Cookie,只有同站请求才发送   | 高安全需求场景              |
| \`Lax\`    | 允许部分第三方请求携带 Cookie(如 GET 导航) | 默认推荐,平衡安全性和可用性 |
| \`None\`   | 允许跨站发送 Cookie,必须配合 Secure        | 需要跨站传递 Cookie 的场景  |

**防御效果:**

- 有效防御 CSRF 攻击
- Chrome 80+ 默认为 \`Lax\`

#### 详细场景示例

**Strict 模式示例:**

\`\`\`javascript
// 适用场景:银行系统、后台管理系统
app.use(
  session({
    cookie: {
      sameSite: "strict",
      // 其他安全配置...
    },
  }),
);
\`\`\`

场景说明:

- ✅ 用户在 \`bank.com\` 点击内部链接 → Cookie 正常发送
- ❌ 用户从 \`evil.com\` 点击链接到 \`bank.com/transfer\` → Cookie 不发送,需要重新登录
- ❌ 用户从邮件点击 \`bank.com\` 链接 → Cookie 不发送
- **优点**: 最高安全性,完全防御 CSRF
- **缺点**: 用户体验较差,从外部链接访问需要重新登录

**Lax 模式示例:**

\`\`\`javascript
// 适用场景:电商网站、新闻网站、社交媒体
app.use(
  session({
    cookie: {
      sameSite: "lax",
      // 其他安全配置...
    },
  }),
);
\`\`\`

场景说明:

- ✅ 用户在 \`shop.com\` 点击内部链接 → Cookie 正常发送
- ✅ 用户从邮件点击 \`shop.com/products\` (GET 导航) → Cookie 发送
- ❌ 恶意网站通过 POST 请求 \`shop.com/buy\` → Cookie 不发送
- ❌ 恶意网站通过 \`<img>\` 或 \`fetch()\` 请求 → Cookie 不发送
- **优点**: 平衡安全性和可用性
- **缺点**: GET 导航可能仍有风险(需配合其他措施)

**None 模式示例:**

\`\`\`javascript
// 适用场景:第三方支付、单点登录(SSO)、嵌入式应用
app.use(
  session({
    cookie: {
      sameSite: "none",
      secure: true, // 必须设置!
      // 其他安全配置...
    },
  }),
);
\`\`\`

场景说明:

- ✅ \`partner.com\` 的 iframe 中嵌入 \`payment.com\` 支付组件 → Cookie 发送
- ✅ 从 \`app-a.com\` 跳转到 \`sso.com\` 再返回 \`app-b.com\` → Cookie 发送
- ⚠️ 任何跨站请求都会携带 Cookie → 需要额外安全措施

#### SameSite=None 时提高安全性的方法

当业务需求必须使用 \`SameSite=None\` 时,可以通过以下措施提高安全性:

**1. 强制 HTTPS + Secure 属性**

\`\`\`javascript
// 必须同时设置 Secure
app.use(
  session({
    cookie: {
      sameSite: "none",
      secure: true, // 强制 HTTPS
      httpOnly: true,
    },
  }),
);

// 中间件强制 HTTPS
app.use((req, res, next) => {
  if (
    req.header("x-forwarded-proto") !== "https" &&
    process.env.NODE_ENV === "production"
  ) {
    return res.redirect(\`https://\${req.header("host")}\${req.url}\`);
  }
  next();
});
\`\`\`

**2. CSRF Token 双重验证**

\`\`\`javascript
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: false });

// 所有状态修改操作都需要 CSRF Token
app.post("/api/transfer", csrfProtection, (req, res) => {
  // 验证 CSRF Token
  // 执行转账操作
});

// 前端发送请求时携带 Token
fetch("/api/transfer", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-CSRF-Token": csrfToken, // 从页面获取
  },
  credentials: "include", // 发送 Cookie
  body: JSON.stringify(data),
});
\`\`\`

**3. Origin 和 Referer 检查**

\`\`\`javascript
// 验证请求来源
app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    const origin = req.headers.origin || req.headers.referer;
    const allowedOrigins = [
      "https://trusted-partner.com",
      "https://main-app.com",
    ];

    if (
      !origin ||
      !allowedOrigins.some((allowed) => origin.startsWith(allowed))
    ) {
      return res.status(403).json({ error: "Forbidden: Invalid origin" });
    }
  }
  next();
});
\`\`\`

**4. 自定义请求头验证**

\`\`\`javascript
// 服务端验证自定义请求头
app.use((req, res, next) => {
  const customHeader = req.headers["x-requested-with"];

  if (req.path.startsWith("/api/") && customHeader !== "XMLHttpRequest") {
    return res.status(403).json({ error: "Invalid request header" });
  }
  next();
});

// 前端所有 API 请求添加自定义头
fetch("/api/data", {
  method: "POST",
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/json",
  },
  credentials: "include",
});
\`\`\`

**5. 请求签名验证**

\`\`\`javascript
const crypto = require("crypto");

// 生成请求签名
function generateSignature(data, secret) {
  const timestamp = Date.now();
  const payload = JSON.stringify(data) + timestamp;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return { signature, timestamp };
}

// 服务端验证签名
app.post("/api/sensitive", (req, res) => {
  const { signature, timestamp } = req.headers;
  const data = req.body;

  // 验证时间戳(防重放攻击)
  if (Date.now() - timestamp > 5000) {
    return res.status(403).json({ error: "Request expired" });
  }

  // 验证签名
  const payload = JSON.stringify(data) + timestamp;
  const expectedSig = crypto
    .createHmac("sha256", process.env.API_SECRET)
    .update(payload)
    .digest("hex");

  if (signature !== expectedSig) {
    return res.status(403).json({ error: "Invalid signature" });
  }

  // 处理请求...
});
\`\`\`

**6. IP 白名单限制**

\`\`\`javascript
// 限制特定 IP 或 IP 段访问
const ipWhitelist = ["192.168.1.0/24", "10.0.0.1"];

app.use((req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;

  if (!isIPAllowed(clientIP, ipWhitelist)) {
    return res.status(403).json({ error: "IP not allowed" });
  }
  next();
});
\`\`\`

**7. 内容安全策略 (CSP)**

\`\`\`javascript
// 设置严格的 CSP 头
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "frame-ancestors 'self' https://trusted-partner.com; " +
      "connect-src 'self' https://api.trusted.com;",
  );
  next();
});
\`\`\`

**8. 双因素认证 (2FA)**

\`\`\`javascript
// 敏感操作需要二次验证
app.post("/api/critical-action", async (req, res) => {
  const { userId, otpCode } = req.body;

  // 验证 OTP 代码
  const isValidOTP = await verifyOTP(userId, otpCode);

  if (!isValidOTP) {
    return res.status(401).json({ error: "Invalid OTP" });
  }

  // 执行关键操作...
});
\`\`\`

**9. 限流和频率控制**

\`\`\`javascript
const rateLimit = require("express-rate-limit");

// 针对敏感接口限流
const sensitiveApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 10, // 最多10次请求
  message: "Too many requests from this IP",
  standardHeaders: true,
  legacyHeaders: false,
});

app.post("/api/transfer", sensitiveApiLimiter, (req, res) => {
  // 处理转账请求
});
\`\`\`

**10. 完整的安全配置示例**

\`\`\`javascript
// 综合使用多种安全措施
const express = require("express");
const session = require("express-session");
const csrf = require("csurf");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

// 安全头
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        frameAncestors: ["'self'", "https://trusted-partner.com"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);

// Session 配置 (SameSite=None)
app.use(
  session({
    name: "__Host-sessionId", // 使用 __Host- 前缀增加安全性
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
      maxAge: 1800000,
      domain: undefined, // 不设置 domain
    },
    rolling: true, // 每次请求刷新过期时间
  }),
);

// CSRF 保护
const csrfProtection = csrf({ cookie: false });

// 限流
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// Origin 验证
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://main-app.com",
    "https://trusted-partner.com",
  ];

  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  next();
});

// API 路由
app.post("/api/sensitive", apiLimiter, csrfProtection, async (req, res) => {
  // 额外的业务逻辑验证
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // 执行敏感操作...
  res.json({ success: true });
});

app.listen(3000);
\`\`\`

**安全检查清单 (SameSite=None 场景):**

- [ ] 必须使用 HTTPS 并设置 \`Secure\` 属性
- [ ] 实现 CSRF Token 验证
- [ ] 验证请求的 Origin/Referer 头
- [ ] 使用自定义请求头或签名
- [ ] 限制允许的跨域来源(白名单)
- [ ] 实施限流和频率控制
- [ ] 敏感操作需要二次验证
- [ ] 设置严格的 CSP 策略
- [ ] 监控异常访问模式
- [ ] 定期安全审计和测试

### 3.4 Domain 和 Path 属性

\`\`\`http
Set-Cookie: sessionId=abc123; Domain=example.com; Path=/
\`\`\`

**Domain:**

- 限制 Cookie 的有效域名范围
- 不设置则默认为当前域名(不包含子域)
- 设置为 \`.example.com\` 则所有子域名都可访问

**Path:**

- 限制 Cookie 的有效路径
- 只有匹配路径的请求才会携带 Cookie
- 默认为当前路径

**安全建议:**

- Domain 尽量限制为最小范围
- Path 根据应用结构合理设置

### 3.5 Expires 和 Max-Age 属性

\`\`\`http
Set-Cookie: sessionId=abc123; Max-Age=3600
Set-Cookie: sessionId=abc123; Expires=Wed, 21 Jan 2026 12:00:00 GMT
\`\`\`

**Session Cookie vs Persistent Cookie:**

- 不设置过期时间 = Session Cookie(浏览器关闭即失效)
- 设置过期时间 = Persistent Cookie(持久化到硬盘)

**安全建议:**

- 敏感会话使用 Session Cookie
- 设置合理的过期时间(如 15-30 分钟)
- 实现绝对超时和空闲超时机制

## 4. 额外的安全措施

### 4.1 Session ID 生成

\`\`\`javascript
// 使用强随机数生成器
const crypto = require("crypto");
const sessionId = crypto.randomBytes(32).toString("hex");
\`\`\`

**要求:**

- 使用加密安全的随机数生成器(CSPRNG)
- Session ID 长度至少 128 位
- 不可预测、不可猜测

### 4.2 登录后重新生成 Session ID

\`\`\`javascript
// Express 示例
app.post("/login", (req, res) => {
  // 验证用户身份
  if (authenticated) {
    req.session.regenerate((err) => {
      if (err) return res.status(500).send("Error");
      req.session.userId = user.id;
      res.redirect("/dashboard");
    });
  }
});
\`\`\`

**作用:**

- 防止 Session Fixation 攻击
- 每次权限变更都应重新生成

### 4.3 Session 超时管理

\`\`\`javascript
// 实现双重超时机制
const SESSION_ABSOLUTE_TIMEOUT = 2 * 60 * 60 * 1000; // 2小时绝对超时
const SESSION_IDLE_TIMEOUT = 30 * 60 * 1000; // 30分钟空闲超时

app.use((req, res, next) => {
  if (req.session.userId) {
    const now = Date.now();

    // 检查绝对超时
    if (now - req.session.createdAt > SESSION_ABSOLUTE_TIMEOUT) {
      return req.session.destroy(() => res.redirect("/login"));
    }

    // 检查空闲超时
    if (now - req.session.lastActivity > SESSION_IDLE_TIMEOUT) {
      return req.session.destroy(() => res.redirect("/login"));
    }

    // 更新最后活动时间
    req.session.lastActivity = now;
  }
  next();
});
\`\`\`

### 4.4 IP 地址和 User-Agent 绑定

\`\`\`javascript
app.use((req, res, next) => {
  if (req.session.userId) {
    // 检查 IP 地址
    if (req.session.ip && req.session.ip !== req.ip) {
      return req.session.destroy(() => res.status(401).send("Unauthorized"));
    }

    // 检查 User-Agent
    if (req.session.ua && req.session.ua !== req.headers["user-agent"]) {
      return req.session.destroy(() => res.status(401).send("Unauthorized"));
    }
  }
  next();
});
\`\`\`

**注意:**

- IP 绑定可能影响使用代理或移动网络的用户
- 需要权衡安全性和用户体验

### 4.5 CSRF Token

\`\`\`javascript
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: false }); // 使用 session 存储

app.get("/form", csrfProtection, (req, res) => {
  res.render("form", { csrfToken: req.csrfToken() });
});

app.post("/submit", csrfProtection, (req, res) => {
  // CSRF token 验证通过
  res.send("Data processed");
});
\`\`\`

### 4.6 退出登录清理

\`\`\`javascript
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Error");
    res.clearCookie("sessionId");
    res.redirect("/login");
  });
});
\`\`\`

## 5. 安全检查清单

### 5.1 配置检查

- [ ] 所有 Session Cookie 设置了 \`HttpOnly\`
- [ ] 生产环境使用 HTTPS,所有 Cookie 设置了 \`Secure\`
- [ ] 设置了合适的 \`SameSite\` 策略
- [ ] 设置了合理的过期时间
- [ ] 使用了强随机数生成 Session ID
- [ ] Session 密钥使用环境变量,不硬编码

### 5.2 逻辑检查

- [ ] 登录后重新生成 Session ID
- [ ] 权限变更后重新生成 Session ID
- [ ] 实现了 Session 超时机制
- [ ] 退出登录正确销毁 Session
- [ ] 实现了 CSRF 防护
- [ ] 敏感操作需要二次验证

### 5.3 存储检查

- [ ] Session 存储使用了安全的方案(如 Redis)
- [ ] Session 数据库连接使用了加密
- [ ] Session 存储设置了访问控制
- [ ] 定期清理过期 Session
- [ ] 敏感数据在 Session 中加密存储

## 6. 常见安全漏洞和修复

### 6.1 Session Fixation

**漏洞代码:**

\`\`\`javascript
app.post("/login", (req, res) => {
  // 直接使用现有 Session
  req.session.userId = user.id;
  res.redirect("/dashboard");
});
\`\`\`

**修复方案:**

\`\`\`javascript
app.post("/login", (req, res) => {
  // 登录后重新生成 Session ID
  const oldSession = req.session;
  req.session.regenerate((err) => {
    Object.assign(req.session, oldSession);
    req.session.userId = user.id;
    res.redirect("/dashboard");
  });
});
\`\`\`

### 6.2 弱 Session ID

**漏洞代码:**

\`\`\`javascript
// 使用时间戳或自增 ID
const sessionId = Date.now().toString();
\`\`\`

**修复方案:**

\`\`\`javascript
const crypto = require("crypto");
const sessionId = crypto.randomBytes(32).toString("hex");
\`\`\`

### 6.3 未设置超时

**漏洞代码:**

\`\`\`javascript
app.use(
  session({
    cookie: {
      // 未设置 maxAge,Session 永不过期
    },
  }),
);
\`\`\`

**修复方案:**

\`\`\`javascript
app.use(
  session({
    cookie: {
      maxAge: 30 * 60 * 1000, // 30分钟
    },
    rolling: true, // 每次请求刷新过期时间
  }),
);
\`\`\`

## 7. 监控和日志

### 7.1 Session 异常监控

\`\`\`javascript
// 监控 Session 异常访问
app.use((req, res, next) => {
  if (req.session.userId) {
    const anomalies = [];

    // IP 变化
    if (req.session.ip && req.session.ip !== req.ip) {
      anomalies.push("IP_CHANGE");
    }

    // User-Agent 变化
    if (req.session.ua && req.session.ua !== req.headers["user-agent"]) {
      anomalies.push("UA_CHANGE");
    }

    // 地理位置异常变化
    if (req.session.country && req.session.country !== req.geoip.country) {
      anomalies.push("GEO_CHANGE");
    }

    if (anomalies.length > 0) {
      logger.warn("Session anomaly detected", {
        userId: req.session.userId,
        sessionId: req.sessionID,
        anomalies,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });

      // 可以选择销毁 Session 或要求重新认证
    }
  }
  next();
});
\`\`\`

### 7.2 安全事件日志

\`\`\`javascript
const logger = require("winston");

// 记录安全相关事件
function logSecurityEvent(event, data) {
  logger.info("Security Event", {
    event,
    timestamp: new Date().toISOString(),
    ...data,
  });
}

// 使用示例
app.post("/login", (req, res) => {
  if (authenticated) {
    logSecurityEvent("USER_LOGIN", {
      userId: user.id,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
  } else {
    logSecurityEvent("LOGIN_FAILED", {
      username: req.body.username,
      ip: req.ip,
    });
  }
});

app.post("/logout", (req, res) => {
  logSecurityEvent("USER_LOGOUT", {
    userId: req.session.userId,
    sessionDuration: Date.now() - req.session.createdAt,
  });
});
\`\`\`

## 8. 参考资源

### 8.1 官方文档

- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [MDN HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [RFC 6265 - HTTP State Management Mechanism](https://tools.ietf.org/html/rfc6265)

### 8.2 安全标准

- OWASP Top 10
- PCI DSS (支付卡行业数据安全标准)
- GDPR (通用数据保护条例)

### 8.3 测试工具

- OWASP ZAP - 自动化安全测试
- Burp Suite - Web 应用安全测试
- Cookie-Editor - 浏览器扩展,查看和编辑 Cookie

## 总结

Session Cookie 安全是 Web 应用安全的基础。核心安全措施包括:

1. **必须设置的属性**: \`HttpOnly\`, \`Secure\`, \`SameSite\`
2. **强 Session ID**: 使用加密安全的随机数生成器
3. **生命周期管理**: 合理的超时设置,登录后重新生成
4. **安全存储**: 使用 Redis 等可靠存储,加密敏感数据
5. **防御措施**: CSRF Token, IP/UA 验证, 异常监控
6. **安全退出**: 正确销毁 Session 和清理 Cookie

记住:**安全是一个持续的过程,需要定期审计和更新安全策略。**
`;export{n as default};
