# 星云答题 — nebula_quiz_frontend

星云大数据·职工AI知识答题小程序前端，基于 uni-app + Vue 3 构建。

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 框架 | uni-app 3.x + Vue 3 (Composition API) |
| 状态管理 | Pinia |
| 样式 | SCSS + 设计令牌系统 |
| 构建 | Vite |
| 目标平台 | 微信小程序 / H5 |

## 项目结构

```
nebula_quiz_frontend/
├── api/                    # API 模块
│   ├── request.js          # 请求封装（拦截器、Token 刷新）
│   ├── auth.js             # 登录/注册/登出
│   ├── quiz.js             # 答题相关
│   ├── training.js         # 培训确认
│   ├── user.js             # 用户信息
│   └── admin.js            # 管理员统计
├── components/             # 公共组件
│   ├── n-navbar/           # 自定义导航栏
│   ├── n-question-card/    # 题目卡片（含选项）
│   ├── n-quiz-timer/       # 答题倒计时
│   ├── n-progress-ring/    # 环形进度条
│   ├── n-empty-state/      # 空状态占位
│   └── n-skeleton/         # 骨架屏加载
├── pages/                  # 页面
│   ├── index/              # 首页
│   ├── login/              # 微信登录
│   ├── register/           # 实名注册
│   ├── training/           # 培训确认
│   ├── quiz/               # 答题页
│   ├── result/             # 答题结果
│   ├── history/            # 答题历史
│   ├── mine/               # 个人中心
│   └── admin/              # 管理端数据统计
├── store/                  # Pinia 状态管理
│   ├── user.js             # 用户 Store
│   └── quiz.js             # 答题 Store
├── utils/                  # 工具函数
│   ├── constants.js        # 常量定义
│   └── index.js            # 格式化/工具函数
├── static/                 # 静态资源
│   ├── logo.png            # 应用图标
│   └── tab/                # TabBar 图标
├── App.vue                 # 根组件
├── main.js                 # 入口
├── pages.json              # 路由 & TabBar 配置
├── manifest.json           # uni-app 配置
├── uni.scss                # 设计令牌（CSS 变量）
└── vite.config.js          # Vite 构建配置
```

## 设计系统

所有视觉设计遵循 `uni.scss` 中定义的设计令牌系统：

- **品牌色**: `#0B1D3A` (深蓝), `#0EA5E9` (青蓝), `#14B8A6` (青绿)
- **字体**: 系统字体栈，标题使用 `letter-spacing: -0.03em`，正文 `line-height: 1.7`
- **阴影**: 分层着色阴影（`$shadow-soft`, `$shadow-card`, `$shadow-elevated`）
- **动画**: 仅对 `transform` 和 `opacity` 设置过渡，使用弹性缓动函数
- **间距**: 基于 8rpx 倍数的统一间距尺度

详见 `uni.scss` 和项目 CLAUDE.md 中的设计规范。

## 开发

```bash
# 安装依赖
npm install

# 微信小程序开发
npm run dev:mp-weixin

# 微信小程序构建
npm run build:mp-weixin

# H5 开发
npm run dev:h5

# H5 构建
npm run build:h5
```

## 后端 API

后端地址配置在 `utils/constants.js` 的 `BASE_URL` 中。

### API 端点

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/v1/auth/wechat-login` | 微信登录 |
| POST | `/api/v1/auth/register` | 实名注册 |
| POST | `/api/v1/auth/refresh` | 刷新 Token |
| POST | `/api/v1/auth/logout` | 登出 |
| GET | `/api/v1/metadata/departments` | 部门列表 |
| GET | `/api/v1/users/me` | 当前用户信息 |
| GET | `/api/v1/training/current` | 培训材料 |
| POST | `/api/v1/training/confirm` | 培训确认 |
| GET | `/api/v1/quiz/today` | 今日答题状态 |
| POST | `/api/v1/quiz/sessions` | 开始答题 |
| GET | `/api/v1/quiz/sessions/{id}` | 获取会话 |
| PUT | `/api/v1/quiz/sessions/{id}/answers/{qid}` | 保存答案 |
| POST | `/api/v1/quiz/sessions/{id}/submit` | 交卷 |
| GET | `/api/v1/quiz/sessions/{id}/result` | 答题结果 |
| GET | `/api/v1/quiz/history` | 历史记录 |
| GET | `/api/v1/admin/statistics/dashboard` | 数据统计（管理员） |

## 页面路由

| 路径 | 页面 | TabBar |
| --- | --- | --- |
| `pages/index/index` | 首页 | ✓ |
| `pages/history/history` | 记录 | ✓ |
| `pages/mine/mine` | 我的 | ✓ |
| `pages/login/login` | 登录 | - |
| `pages/register/register` | 注册 | - |
| `pages/training/training` | 培训确认 | - |
| `pages/quiz/quiz` | 答题 | - |
| `pages/result/result` | 结果 | - |
| `pages/admin/dashboard` | 数据统计 | - |

## 部署前检查

1. 在 `manifest.json` 中填写微信小程序 `appid`
2. 在 `utils/constants.js` 中修改 `BASE_URL` 为生产环境地址
3. 替换 `static/logo.png` 和 `static/tab/` 下的图标为正式设计稿
4. 配置微信小程序合法域名（request 域名）
