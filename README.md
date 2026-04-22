
# 🟦 Kivotos Gobang (基沃托斯五子棋) - Tactical Simulation

> **"Welcome to Schale. Establishing connection... System Stable."**

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![React](https://img.shields.io/badge/React-18-cyan) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![PeerJS](https://img.shields.io/badge/P2P-PeerJS-orange)

## 📖 项目概述 (Project Overview)

**Kivotos Gobang** 是一款基于 React 开发的现代 Web 五子棋游戏，深受二次元手游《Blue Archive》的美术风格启发。它不仅仅是一个传统的五子棋，更结合了**角色技能系统 (RPG Elements)**、**经济系统 (SP Points)** 和 **P2P 联机功能**。

本项目旨在探索：
1.  **高动态 UI/UX**: 如何在 Web 端实现手游级别的转场与交互动画。
2.  **轻量级 AI**: 在前端实现具备“性格”和“战术”的博弈 AI。
3.  **无后端联机**: 利用 WebRTC (PeerJS) 实现低延迟的实时对战。

---

## 🧠 AI 设计思路 (AI Design Strategy)

本游戏的 AI (`services/aiLogic.ts`) 并非基于深度学习，而是采用**启发式评估函数 (Heuristic Evaluation Function)** 结合 **基于规则的决策树 (Rule-based Decision Tree)**。这种设计保证了在纯前端环境下（无 GPU 加速）的极速响应。

### 1. 核心博弈算法 (The Brain)
AI 通过扫描棋盘上的每一个空位，计算其“分数”来决定落子：

*   **攻防加权 (Attack & Defense)**:
    *   `Score = AttackScore + (DefenseScore * Weight)`
    *   AI 同时评估“这一步对我有多大好处”和“这一步对敌人有多大阻碍”。防御权重通常略低，但在紧急情况（如敌方活三）下，防御分值会呈指数级爆炸，强制 AI 堵棋。
*   **棋型识别**:
    *   系统识别 `活四` (必胜), `冲四`, `活三` (威胁), `眠三`, `活二` 等棋型。
    *   **位权法**: 越靠近棋盘中心或已有棋子集群的区域，基础分越高。

### 2. 技能决策系统 (Skill System Logic)
AI 不仅会下棋，还会使用角色技能。这是一个简单的状态机：
*   **资源检查**: SP 是否足够？
*   **收益预判**:
    *   *Aris*: 如果 SP >= 1，立即觉醒（低成本高收益）。
    *   *Yuuka*: 只有当检测到敌方落子形成高威胁棋型（如活三）时，才触发“悔棋/阻断”技能进行防御。
    *   *Sensei*: 当局势判定为“大劣”且 SP 足够时，发动“大人的卡片”试图翻盘。

### 3. 情感引擎 (Emotional Engine)
为了让 AI 更像玩家，我们引入了情感反馈系统：
*   **优势/劣势感知**: 每次计算最佳移动时，AI 会得出当前局面的最高分。
*   **Emoji 交互**:
    *   `Score > Threshold`: 发送 😎 (自信) 或 🔥 (挑衅)。
    *   `Score < Critical`: 发送 😭 (慌张) 或 💦 (流汗)。
    *   `Thinking`: 发送 🤔。

---

## 🎨 网页设计思路 (Web Design Philosophy)

### 1. 视觉语言：Schale Aesthetic
*   **配色**: 以 `Cyan-500` (青色) 和 `Slate-50` (白/灰) 为主调，辅以 `Pink-500` 作为 P2/敌对色。
*   **几何元素**: 大量使用光环 (Halos)、六边形 (Hexagons)、斜切线条 (Skewed Lines) 和细边框。
*   **玻璃拟态 (Glassmorphism)**: 棋盘和 UI 面板采用高斯模糊背景 (`backdrop-blur`)，营造通透的未来感。

### 2. 交互体验 (UX)
*   **场景化管理**: 游戏被拆分为不同的 `Scene` (Menu, CharacterSelect, Playing, Victory)，利用 `Framer Motion` 的 `<AnimatePresence>` 实现无缝路由转场。
*   **音效反馈**: 每一个交互（Hover, Click, Place, Skill）都有独立的合成音效（基于 `Web Audio API` 实时生成，无静态资源加载，极速响应）。
*   **响应式布局**:
    *   **Desktop**: 宽屏布局，侧边栏展示角色立绘，沉浸感强。
    *   **Mobile**: 紧凑布局，立绘隐藏或虚化，UI 元素堆叠，保证可玩性。

---

## 🏗️ 架构设计图 (Architecture)

系统采用单向数据流架构，状态中心化管理。

```mermaid
graph TD
    subgraph View [React UI Layer]
        App --> SceneManager
        SceneManager --> Board[棋盘组件]
        SceneManager --> Sidebar[状态栏]
        SceneManager --> Overlay[技能/弹窗]
    end

    subgraph State [Game State]
        Logic[useRef / useState] --> BoardState[棋盘数据]
        Logic --> PlayerState[SP/时间/角色]
        Logic --> MetaState[胜负/历史记录]
    end

    subgraph Service [Core Services]
        GameLogic[gameLogic.ts (规则判定)]
        AILogic[aiLogic.ts (人机算法)]
        Sound[sound.ts (音频合成)]
        Network[PeerJS (WebRTC)]
    end

    %% Interactions
    View -- Action (Click) --> State
    State -- Update --> View
    
    %% Logic Flow
    State -- Check Win/Points --> GameLogic
    State -- Get Best Move --> AILogic
    State -- Play SFX --> Sound
    
    %% Network Flow
    State -- Sync Data --> Network
    Network -- Remote Action --> State
```

---

## 🔌 接口使用说明 (Interface & Protocols)

本项目主要涉及两类接口：**内部逻辑接口** 和 **网络通信协议**。

### 1. 内部逻辑接口 (`services/gameLogic.ts`)

#### `checkWin(board, player)`
*   **功能**: 检测是否有五连珠。
*   **输入**: 当前棋盘数组, 当前玩家。
*   **输出**: `Position[] | null` (胜利连线的坐标数组，无则返回 null)。

#### `checkPointsAndMark(board, markedGrid, ...)`
*   **功能**: 检测是否形成 3连 或 4连 以获取 SP 点数。
*   **机制**: 遍历棋盘，比对 `markedGrid` 确保同一颗棋子不会重复贡献 SP。
*   **输出**: `{ pointsGained: number, newMarkedGrid: boolean[][] }`。

### 2. 网络通信协议 (PeerJS JSON Payloads)

P2P 联机时，双方通过发送 JSON 对象进行状态同步。

| 动作类型 (Type) | 参数 (Payload) | 说明 |
| :--- | :--- | :--- |
| `HANDSHAKE` | `{ name: string }` | 建立连接后交换昵称 |
| `CONFIG` | `{ p1: CharType, p2: CharType }` | 房主同步双方选择的角色 |
| `READY` | `{ player: 'p1' \| 'p2' }` | 玩家确认准备就绪 |
| `START_GAME` | `{ startPlayer: 1 \| 2 }` | 房主触发游戏开始 |
| `MOVE` | `{ pos: {x, y} }` | **核心**: 发送落子坐标 |
| `SKILL` | `{ player: 1 \| 2 }` | 触发技能过场动画 |
| `SYNC_STATE` | `{ state: GameStateData }` | **关键**: 发送完整游戏状态快照（用于技能产生的复杂状态改变，如移除棋子） |
| `EMOJI` | `{ emoji: string }` | 发送表情包 |

---

## 📂 目录结构 (Directory Structure)

```text
src/
├── components/         # React UI 组件
│   ├── Board.tsx       # 棋盘核心渲染
│   ├── CharacterSelect # 选人界面
│   ├── GeometricBackground # 动态背景
│   └── ...
├── services/           # 纯逻辑层 (无状态)
│   ├── gameLogic.ts    # 输赢/计分规则
│   ├── aiLogic.ts      # AI 评估算法
│   └── sound.ts        # Web Audio API 合成器
├── types.ts            # TypeScript 类型定义
├── constants.tsx       # 游戏常量 (角色配置、棋子皮肤)
├── App.tsx             # 主入口 & 状态控制器
└── index.tsx           # React DOM 挂载
```

---

## 🚀 快速开始 (Setup)

1.  **安装依赖**:
    ```bash
    npm install
    ```

2.  **启动开发服务器**:
    ```bash
    npm start
    ```

3.  **构建部署**:
    ```bash
    npm run build
    ```

---

*Designed & Developed by [Your Name/Sensei]. Kivotos needs you!*
