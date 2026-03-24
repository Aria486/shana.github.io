const n=`# pyproject.toml

## 是什么

\`pyproject.toml\` 是 Python 项目的**统一配置文件**（PEP 517/518），用于描述项目元信息、依赖、构建方式和工具配置，替代旧的 \`setup.py\` + \`setup.cfg\` + \`requirements.txt\` 分散管理的方式。

## 完整结构

\`\`\`toml
[build-system]
requires = ["setuptools>=68", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "my-project"
version = "0.1.0"
description = "项目描述"
readme = "README.md"
requires-python = ">=3.10"
license = { text = "MIT" }

# 运行时必须安装的依赖
dependencies = [
    "torch>=2.2.2",
    "tiktoken>=0.11.0",
    "numpy>=1.26.4",
]

# 可选依赖（开发工具等）
[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "ruff>=0.4",
    "mypy>=1.10",
]

# 自动发现包（含 __init__.py 的目录）
[tool.setuptools.packages.find]
where = ["."]
include = ["ch02*", "ch03*", "ch04*"]

# 非 .py 文件（数据文件）需要单独声明才会被打包
[tool.setuptools.package-data]
"ch02" = ["*.txt"]

# 代码风格检查工具配置
[tool.ruff]
line-length = 100
target-version = "py310"

[tool.ruff.lint]
select = ["E", "F", "W"]
ignore = ["E501"]

# 类型检查工具配置
[tool.mypy]
python_version = "3.10"
ignore_missing_imports = true

# 测试工具配置
[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-v --tb=short"
\`\`\`

## 各块说明

### \`[build-system]\`

声明用什么工具来构建这个包。\`setuptools\` 是最常用的构建后端。

### \`[project]\`

项目元信息，\`pip install\` 时展示的信息都来自这里。

### \`dependencies\` vs \`optional-dependencies\`

- \`dependencies\`：装项目就必须装，\`pip install .\` 自动安装
- \`optional-dependencies\`：按需安装，\`pip install ".[dev]"\` 才会安装

### \`[tool.setuptools.packages.find]\`

告诉 setuptools 去哪里找 Python 包（含 \`__init__.py\` 的目录）。

- \`where\`：从哪个目录开始扫描
- \`include\`：只打包哪些包，支持通配符 \`*\`

### \`[tool.setuptools.package-data]\`

Python 打包默认只包含 \`.py\` 文件，其他文件（\`.txt\`、\`.json\`、\`.yaml\` 等）需要在这里声明。

## 常用命令

\`\`\`bash
# 以可编辑模式安装（开发推荐）
pip install -e .

# 安装含开发工具
pip install -e ".[dev]"

# 构建发布包
pip install build
python -m build
# 生成 dist/xxx.whl 和 dist/xxx.tar.gz
\`\`\`

## 可编辑模式（-e）

\`\`\`bash
pip install -e .
\`\`\`

代码直接链接到当前目录，**修改代码后无需重新安装**立即生效。适合开发阶段使用。
`;export{n as default};
