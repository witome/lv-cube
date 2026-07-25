# 绿立方农批交易平台

现代化的农产品批发交易平台，致力于为农产品批发商、采购商提供高效、透明、便捷的线上交易服务。

## 技术栈

- **Monorepo**: pnpm workspaces
- **语言**: TypeScript 5.x (strict 模式)
- **代码规范**: ESLint 9.x + Prettier 3.x
- **包管理**: pnpm 9.x

## 目录结构

```
green-cube/
├── packages/              # 子包目录
│   ├── <app-or-lib>/     # 各个应用或共享库
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
├── docs/                  # 项目文档
├── package.json           # 根 package.json
├── pnpm-workspace.yaml    # pnpm workspace 配置
├── tsconfig.base.json     # 共享 TypeScript 配置
├── eslint.config.js       # ESLint 配置 (flat config)
├── .prettierrc            # Prettier 配置
├── .editorconfig          # 编辑器配置
├── .gitignore
└── README.md
```

## 快速开始

### 前置要求

- Node.js >= 18
- pnpm >= 9

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建

```bash
pnpm build
```

### 代码检查与格式化

```bash
pnpm lint
pnpm format
```

## License

Private
