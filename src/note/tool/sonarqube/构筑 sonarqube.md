# SonarQube 社区版在 AWS Linux 2023 上的安装手册

## 前提条件: 查看是否有 java，版本是多少

```bash
java -version
javac -version

```

### 准备工作

#### 更新系统

```bash
sudo dnf update -y
```

#### 如果没有 java,安装必要的软件包

```bash
sudo dnf install -y --allowerasing wget curl unzip java-17-amazon-corretto java-17-amazon-corretto-devel
```

#### 验证 Java 版本

```bash
java -version
javac -version
```

## 第一步：安装和配置 PostgreSQL

### 1.1 安装 PostgreSQL

```bash
sudo dnf install -y postgresql15-server postgresql15
```

### 1.2 初始化数据库

```bash
sudo postgresql-setup --initdb
```

### 1.3 启动并启用 PostgreSQL 服务

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 1.4 配置 PostgreSQL 用户和数据库

```bash
sudo -u postgres psql

-- PostgreSQL 命令行中执行：
CREATE USER sonar WITH ENCRYPTED PASSWORD 'sonar123';
CREATE DATABASE sonarqube OWNER sonar;
GRANT ALL PRIVILEGES ON DATABASE sonarqube TO sonar;
\q
```

### 1.5 配置 PostgreSQL 认证（SCRAM-SHA-256）

```bash
sudo vim /var/lib/pgsql/data/pg_hba.conf
```

- 将 `peer` 验证修改为 `scram-sha-256`

- 重启 PostgreSQL 服务：

```bash
sudo systemctl restart postgresql
```

### 1.6 配置 PostgreSQL 使用 SCRAM-SHA-256

```bash
sudo vim /var/lib/pgsql/data/postgresql.conf
```

- 找到或添加：

```text
password_encryption = 'scram-sha-256'
```

---

## 第二步：创建 SonarQube 用户

```bash
sudo useradd -r -m -U -d /opt/sonarqube -s /bin/bash sonar
```

---

## 第三步：下载和安装 SonarQube

### 3.1 下载 SonarQube 社区版最新版本

```bash
cd /tmp
export SONAR_VERSION=25.9.0.112764
wget "https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-${SONAR_VERSION}.zip"
```

### 3.2 解压并移动到目标目录

```bash
unzip "sonarqube-${SONAR_VERSION}.zip"
sudo mv "sonarqube-${SONAR_VERSION}.zip" /opt/sonarqube
sudo chown -R sonar:sonar /opt/sonarqube
ls -la /opt/sonarqube/
```

### 3.3 配置 SonarQube

```bash
sudo vim /opt/sonarqube/conf/sonar.properties
```

添加或修改：

```properties
sonar.jdbc.username=sonar
sonar.jdbc.password=sonar123
sonar.jdbc.url=jdbc:postgresql://localhost:5432/sonarqube
sonar.web.host=0.0.0.0
sonar.web.port=9000
sonar.search.javaOpts=-Xmx512m -Xms512m -XX:MaxDirectMemorySize=256m -XX:+HeapDumpOnOutOfMemoryError
sonar.log.level=INFO
```

---

## 第四步：安装 sonarqube-community-branch-plugin 插件

### 4.1 下载插件

```bash
cd /tmp
export PLUGIN_VERSION=25.7.0
wget "https://github.com/mc1arke/sonarqube-community-branch-plugin/releases/download/${PLUGIN_VERSION}/sonarqube-community-branch-plugin-${PLUGIN_VERSION}.jar"
```

### 4.2 安装插件

```bash
sudo cp "sonarqube-community-branch-plugin-${PLUGIN_VERSION}.jar" /opt/sonarqube/extensions/plugins/
sudo chown sonar:sonar /opt/sonarqube/extensions/plugins/sonarqube-community-branch-plugin-25.7.0.jar
```

### 4.3 配置插件

```bash
sudo vim /opt/sonarqube/conf/sonar.properties
```

添加：

```properties
sonar.web.javaAdditionalOpts=-javaagent:/opt/sonarqube/extensions/plugins/sonarqube-community-branch-plugin-25.7.0.jar=web
sonar.ce.javaAdditionalOpts=-javaagent:/opt/sonarqube/extensions/plugins/sonarqube-community-branch-plugin-25.7.0.jar=ce
```

---

## 第五步：配置系统限制

### 5.1 配置内核参数

```bash
sudo vim /etc/sysctl.conf
```

添加：

```text
vm.max_map_count=524288
fs.file-max=131072
```

### 5.2 配置用户限制

```bash
sudo vim /etc/security/limits.conf
```

添加：

```text
sonar   -   nofile   131072
sonar   -   nproc    8192
```

### 5.3 应用配置

```bash
sudo sysctl -p
```

---

## 第六步：创建 systemd 服务

### 6.1 创建服务文件

```bash
sudo vim /etc/systemd/system/sonarqube.service
```

内容：

```ini
[Unit]
Description=SonarQube service
After=syslog.target network.target postgresql.service
Wants=postgresql.service

[Service]
Type=forking
ExecStart=/opt/sonarqube/bin/linux-x86-64/sonar.sh start
ExecStop=/opt/sonarqube/bin/linux-x86-64/sonar.sh stop
ExecReload=/opt/sonarqube/bin/linux-x86-64/sonar.sh restart
User=sonar
Group=sonar
Restart=always
LimitNOFILE=131072
LimitNPROC=8192
TimeoutStartSec=5

[Install]
WantedBy=multi-user.target
```

### 6.2 重载 systemd 配置

```bash
sudo systemctl daemon-reload
```

---

## 第七步：启动和测试 SonarQube

### 7.1 启动服务

```bash
sudo systemctl start sonarqube
sudo systemctl enable sonarqube
```

### 7.2 检查服务状态

```bash
sudo systemctl status sonarqube
```

### 7.3 查看日志

```bash
sudo tail -f /opt/sonarqube/logs/sonar.log
```

### 7.4 检查端口

```bash
sudo netstat -tlnp | grep :9000
```

---

## 第八步：访问和初始配置

### 8.1 访问 Web 界面

打开浏览器访问：

```
http://your-server-ip:9000
```

### 8.2 默认登录信息

- 用户名：admin
- 密码：admin

### 9.3 首次登录后的设置

- 系统会要求更改默认密码
- 配置您的项目
- 验证社区分支插件是否正常工作

---

## 维护命令

```bash
sudo systemctl start sonarqube
sudo systemctl stop sonarqube
sudo systemctl restart sonarqube
sudo systemctl status sonarqube
sudo journalctl -u sonarqube -f
```
