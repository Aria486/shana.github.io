# .envrc 与 direnv

## 是什么

`direnv` 是一个 shell 扩展工具，当你 `cd` 进一个目录时，自动执行该目录下的 `.envrc` 文件；离开目录时自动撤销。常用于为不同项目自动切换环境变量、Python 环境等。

## 安装

```bash
brew install direnv
```

安装后需要把 hook 写入 shell 配置文件，**只需执行一次**：

```bash
# bash 用户
echo 'eval "$(direnv hook bash)"' >> ~/.bash_profile
source ~/.bash_profile

# zsh 用户
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc
source ~/.zshrc
```

## 基本用法

在项目根目录创建 `.envrc`，写入想自动执行的命令：

```bash
# 激活 conda 环境
source /usr/local/Caskroom/miniconda/base/etc/profile.d/conda.sh
conda activate /usr/local/Caskroom/miniconda/base/envs/python312
```

首次创建或修改 `.envrc` 后，需要手动授权一次：

```bash
direnv allow
```

之后每次 `cd` 进该目录，环境自动切换。

## 常用场景

| 场景            | `.envrc` 写法                  |
| --------------- | ------------------------------ |
| 激活 conda 环境 | `conda activate <env>`         |
| 激活 venv       | `source venv/bin/activate`     |
| 设置环境变量    | `export API_KEY=xxx`           |
| 添加 PATH       | `export PATH="$PWD/bin:$PATH"` |

## 注意事项

- `.envrc` 修改后必须重新执行 `direnv allow` 才能生效
- `.envrc` 通常加入 `.gitignore`，避免把本地环境路径提交到仓库
