const n=`# Python 模块与包管理

## 基本概念

| 概念           | 说明                    | 例子          |
| -------------- | ----------------------- | ------------- |
| 模块（module） | 一个 \`.py\` 文件         | \`utils.py\`    |
| 包（package）  | 含 \`__init__.py\` 的目录 | \`models/\`     |
| 子包           | 包里面的包              | \`models/cnn/\` |

## 项目结构示例

\`\`\`
my_project/
├── __init__.py          ← 根包
├── pyproject.toml
├── ch01/
│   ├── __init__.py      ← 导出 tokenize、clean_text
│   ├── tokenizer.py
│   └── cleaner.py
├── ch02/
│   ├── __init__.py      ← 导出 Dataset、DataLoader
│   ├── dataset.py
│   └── dataloader.py
└── ch03/
    ├── __init__.py      ← 导出 Linear、Attention
    ├── linear.py
    └── attention.py
\`\`\`

## 导入方式

### 绝对导入

从项目根目录出发，写完整路径：

\`\`\`python
from ch01.tokenizer import tokenize
from ch02 import Dataset
\`\`\`

### 相对导入

用 \`.\` 表示当前包，\`..\` 表示上级包，**只能在包内部使用**：

\`\`\`python
# 在 ch02/dataloader.py 中
from .dataset import Dataset          # 同级的 dataset.py

# 在 ch03/attention.py 中
from ..ch01 import tokenize           # 上级的 ch01 包
\`\`\`

### 对比

|          | 绝对导入                              | 相对导入                          |
| -------- | ------------------------------------- | --------------------------------- |
| 写法     | \`from ch01.tokenizer import tokenize\` | \`from .tokenizer import tokenize\` |
| 适用     | 任何地方                              | 只能在包内部                      |
| 重构影响 | 包名改了要全改                        | 相对位置不变就不用改              |

## \`__init__.py\` 的作用

让目录变成一个包，同时控制**对外暴露什么**：

\`\`\`python
# ch02/__init__.py
from .dataset import Dataset
from .dataloader import DataLoader

__all__ = ["Dataset", "DataLoader"]
\`\`\`

配置后外部可以直接：

\`\`\`python
from ch02 import Dataset      # 不需要知道 Dataset 在哪个子文件里
from ch02 import DataLoader
\`\`\`

\`__all__\` 控制 \`from ch02 import *\` 时导出哪些名字。

## 运行方式

包内的文件**不能直接 \`python file.py\` 运行**（相对导入会报错），必须用 \`-m\`：

\`\`\`bash
# ❌ 错误
python ch02/dataloader.py

# ✅ 正确（从项目根目录执行）
python -m ch02.dataloader
\`\`\`

## \`if __name__ == "__main__"\` 守卫

模块顶层的代码在被 \`import\` 时会立即执行，应用守卫隔离测试代码：

\`\`\`python
# ch01/tokenizer.py

def tokenize(text):
    return text.split()

# ✅ 只有直接运行时才执行，import 时不会执行
if __name__ == "__main__":
    print(tokenize("hello world"))
\`\`\`

## 常见报错

### \`ModuleNotFoundError: No module named 'ch01'\`

原因：直接运行 \`.py\` 文件，Python 找不到同级的包。  
解决：从项目根目录用 \`python -m\` 运行。

### \`ImportError: attempted relative import with no known parent package\`

原因：在包外部使用了相对导入，或者直接运行了包内的文件。  
解决：改用绝对导入，或用 \`python -m\` 方式运行。

### \`cannot import name 'X' from 'Y'\`

原因：\`__init__.py\` 没有导出该名字，或拼写错误。  
解决：检查对应包的 \`__init__.py\` 是否有 \`from .xxx import X\`。
`;export{n as default};
