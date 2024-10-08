# 1. 八大知识域了解
|序号| 知识域     | 思维视角  | 进一步解释              |
|---------|---------|-------|--------------------|
|1| 安全与风险管理 | 顶层思维  | 安全需求，安全规划，顶层设计     |
|2| 资产安全    | 业务思维  | 资产分类分级防护           |
|3| 安全工程与架构 | 设计思维  | 安全机制的设计与选择         |
|4| 身份与访问管理 | 设计思维  | 攻防围绕身份和权限展开        |
|5| 通信与网络安全 | 设计思维  | 分层，协议与设备安全         |
|6| 软件开发安全  | 设计思维  | 安全内生长              |
|7| 安全运营    | 运营思维  | 持续的保障安全攻防围绕身份和权限展开 |
|8| 安全与评估测试 | 第三方思维 | 验证，测试安全的有效性        |


## 1.1 安全与风险管理 - 顶层思维
** 1) 如何归纳总结企业自身的安全需求，需求决定一切，合规需求，安全需求，业务连续性续期，风险评估结果等。** 

** 2) 有了需求，就要去满足需求，安全规划，安全顶层设计，包括安全组织的设置，定义安全角色，明确安全策略目标等。**  

### ** 获得高层承诺 **

## 1.2 资产安全 - 业务思维

帮助我们更好的去理解安全对于业务的这种价值作用，进一步明确我们得安全保护对象。企业在安全的投入资源是有限的，区分对待也是必然。

** 例） 硬盘 ----> 数据 **

## 1.3 安全架构与工程 - 设计思维

1） 如何设计一种安全的机制，保障资产获得适当的保护。

2） 身份与访问管理围绕身份和权限去展开。

3） 通信与网络安全主要讲述网络分层，协议的安全和设备的安全。

4） 软件开发安全是从安全的内生长角度来看，系统自身具备基本的安全措施，比如登录身份验证，防 SQL 注入等。

## 1.4 安全运营 - 运营思维

设计，部署完成之后，安全运营，保证安全制度能够被有效的执行，持续安全的保障。

1） 日志管理与审计  
2） 补丁与漏洞管理  
3） 变更与配置管理  
4） 安全检测与响应   
5） 安全流程闭环管理 

## 1.5 安全与评估测试 - 第三方思维

安全工作做的如何，不能自说自话，需要及时的第三方的客观评价。


# 2. 教材

CISSP OSG

# 3. 安全与风险管理

## 3.1 理解和应用机密性，完整性和可用性的概念 (CIA)

[CMD5](https://www.cmd5.com/)  彩虹表攻击

** “site:.cn hacked by” **是一个搜索查询，意思是在谷歌中查找所有以.cn结尾的网站，这些网站可能被黑客攻击。这个查询会显示相关的页面和信息，通常用于寻找被黑客入侵的迹象或报告。

- **信息安全的定义:** 

  保护信息系统不会由于偶然的，蓄意的原因造成破坏。

- **信息安全的核心原则:**

  CIA，不可否认性，真实性。5A

- **其他相关安全概念**

### 3.1.1 完整的安全计划

- **安全的存在是为了支持组织的目标，使命和宗旨**

- **安全应具有成本效益**

- 安全首先是合规

- **安全是动态的**

### 3.1.2 什么是信息

**信息是用来消除不确定性的内容，具有价值的信息资产面临诸多威胁，需要妥善保护（和氏无罪，怀璧有罪）**

- **信息本身是无形的，借助于信息媒体以多种形式存在或者传播:**
  - 存储在计算机，磁带，纸张等介质，或者人的大脑里（入职保密协议）
  - 通过网络，打印机，等方式传播

- **信息借助于媒体而存在，因为具有价值，就成为了信息资产:**
  - 计算机和网络中的数据
  - 硬件，软件，文档等资料
  - 关键人员
  - 组织提供的服务

### 3.1.3 信息的生命周期
- 创建：手动或自动
- 使用：避免内存泄露
- 存储：对数据加密
- 传递：加密协议传输
- 更改：严格按照变更管理流程
- 销毁：防止发生泄露

### 3.1.4 基本目标

