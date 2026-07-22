# Razor Wings

Razor Wings 是一个功能强大的 Bondage Club 模组，提供了一系列辅助工具和增强功能，用于改善游戏体验。包含翻译、隐私保护、外观编辑、脚本自动化等多种实用功能。

## 安装

### 方法一：使用 BC Mod Manager

参考 https://inkerbot.github.io/bc-mod-manager/

### 方式2️⃣：控制台

在浏览器控制台中执行以下代码：

```js
import(`https://inkerbot.github.io/razor-wings/assets/main.js?v=${(Date.now()/10000).toFixed(0)}`);
```

### 方式三：脚本管理器

安装 Tampermonkey 或类似的用户脚本管理器，然后安装以下脚本：

https://raw.githubusercontent.com/InkerBot/razor-wings/refs/heads/master/loader.user.js

## 功能模块

### 🌐 翻译 (Translation)
- 自动翻译发送和接收的聊天消息
- 支持多种语言互译
- 可配置源语言和目标语言
- 支持聊天、私聊和表情动作的翻译

> ⚠️ 使用第三方翻译API，请注意隐私

### 🔒 隐私设置 (Privacy)
- 阻止多种常见模组（WCE、BCX、Echo、LSCG、MPA）共享你的信息
- 阻止 BCX 发送你的设备指纹
- 支持设置白名单，仅向特定玩家发送扩展消息
- 隐藏特定模组，防止在 WCE 报告中暴露
- 禁用所有动作发送（用于RP等场景）

### 🚪 辅助工具

#### 退出房间 (Exit Room)
- 快速退出当前聊天室

#### 解锁 (Unlock)
- 一键解锁目标角色的所有拘束装备
- 支持触发文本配置

#### 上锁 (Lock)
- 快速给目标角色添加锁定装备
- 支持触发文本配置

#### 解除限制 (Remove Limit)
- 移除游戏中的在拘束中的各种限制，提升游戏自由度，便于设计服装

#### 移除奴隶 (Remove Submissive)
- 快速移除主仆关系（即使对方不在线）

### 🎨 外观编辑器 (Appearance Editor)
- 基于 Monaco Editor 的强大 JSON 编辑器，用于编辑角色外观代码
- 支持加载、格式化和应用外观

### 📜 地图脚本 (Map Script)
- 根据地图位置自动触发脚本
- 使用沙箱环境安全执行 JavaScript 代码
- 支持每个地图坐标配置独立脚本
- 适合自动化重复性操作

### 💬 聊天导出 (Chat Export)
- 导出聊天室的聊天记录，可选择是否包含私聊消息，用于方便保存重要对话。

### 📚 外观记录 (History)
- 自动记录角色外观变化历史，快速恢复之前的外观
- 方便管理和切换外观的版本

### 🎮 郊狼 (DG-Lab)
- 集成 DG-Lab 电击设备控制，支持多种连接方式，实时控制强度通道 A 和 B
- 将游戏内事件与真实硬件互动

### 🎁 作弊功能

#### 获得所有物品 (All Items)
- 解锁游戏中的所有物品
- 无需购买或解锁条件
