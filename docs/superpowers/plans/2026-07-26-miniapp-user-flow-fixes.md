# Miniapp User Flow Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复商品编辑提交、审核后角色切换、11 位手机号校验和统一地区选择器。

**Architecture:** 保持现有 Prisma 地址结构兼容历史数据，在 DTO、服务层和页面交互层分别修复真实数据契约。可复用的手机号规则放入 shared 包，角色授权以服务端为准，页面只呈现服务端返回的已授权角色。

**Tech Stack:** Vue 3、uni-app、Pinia、NestJS、class-validator、Prisma、Jest

## Global Constraints

- 不删除地址表已有的 `province`、`city`、`district` 字段。
- 中国大陆手机号必须匹配 `^1[3-9]\d{9}$`。
- 角色切换失败时不得修改本地当前角色。
- 商品提交必须显示 loading 和失败原因。

---

### Task 1: 修复商品更新契约与提交反馈

**Files:**
- Modify: `packages/server/src/product/dto/create-product.dto.ts`
- Create: `packages/server/src/product/dto/create-product.dto.spec.ts`
- Modify: `packages/miniapp/src/api/request.ts`
- Modify: `packages/miniapp/src/pages/supplier/product-edit.vue`

**Interfaces:**
- Consumes: 商品页提交的 `attrValues: Record<string, unknown>`。
- Produces: 能接受对象属性值的 DTO，以及可见的提交状态和错误提示。

- [ ] 写 DTO 校验测试，断言对象形式 `attrValues` 校验通过。
- [ ] 运行测试并确认旧 `@IsArray()` 实现失败。
- [ ] 改为 `@IsObject()`，运行测试确认通过。
- [ ] 为请求层补充 PATCH 类型与非 2xx 后端消息提示。
- [ ] 为商品提交增加 `submitting` 防重、按钮文案和 catch 提示。

### Task 2: 收紧审核与角色切换

**Files:**
- Create: `packages/server/src/user/user.service.spec.ts`
- Modify: `packages/server/src/user/user.service.ts`
- Modify: `packages/miniapp/src/pages/mine/index.vue`
- Modify: `packages/miniapp/src/store/user.ts`

**Interfaces:**
- Consumes: 运营审核结果和用户 `roles`。
- Produces: 审核通过即持久化角色；小程序只显示已授权角色。

- [ ] 写审核通过添加角色、拒绝不添加角色的服务测试并确认失败。
- [ ] 在审核事务中更新 profile 和去重后的用户角色。
- [ ] 将角色列表改为从 `userInfo.roles` 计算。
- [ ] 删除切换接口失败后的本地强制切换，并在成功后刷新用户资料。

### Task 3: 统一 11 位手机号规则

**Files:**
- Create: `packages/shared/src/validation/phone.ts`
- Create: `packages/shared/src/validation/phone.spec.ts`
- Modify: `packages/shared/src/index.ts`
- Modify: `packages/server/src/auth/dto/login.dto.ts`
- Modify: `packages/server/src/auth/dto/register.dto.ts`
- Modify: `packages/server/src/address/dto/create-address.dto.ts`
- Modify: `packages/server/src/user/user.service.ts`
- Modify: `packages/miniapp/src/pages/login/index.vue`
- Modify: `packages/miniapp/src/pages/apply/supplier.vue`
- Modify: `packages/miniapp/src/pages/apply/driver.vue`
- Modify: `packages/miniapp/src/pages/address/edit.vue`
- Modify: `packages/admin/src/views/user/list.vue`

**Interfaces:**
- Produces: `CHINA_MOBILE_PATTERN` 与 `isChinaMobile(phone)`。

- [ ] 写手机号有效/无效边界测试并确认缺少实现时失败。
- [ ] 实现共享规则并导出。
- [ ] 后端 DTO 使用 `@Matches(CHINA_MOBILE_PATTERN)`，运营创建用户额外校验。
- [ ] 所有手机号输入设置最大长度并在提交前调用统一规则。

### Task 4: 合并省市区选择

**Files:**
- Modify: `packages/miniapp/src/pages/address/edit.vue`

**Interfaces:**
- Consumes: uni-app `picker mode="region"` 的 `[province, city, district]`。
- Produces: 原有 API 所需的三个字段和统一显示文本。

- [ ] 用单个地区 picker 替换三个文本框。
- [ ] 未完成三级选择时阻止保存并显示提示。
- [ ] 验证新增、编辑回显和提交 payload 保持兼容。

### Task 5: 回归验证

**Files:**
- Verify only.

- [ ] 运行新增 Jest 测试。
- [ ] 运行 server build、miniapp typecheck/H5 build、admin build。
- [ ] 检查 git diff，确认无凭证和无关改动。

