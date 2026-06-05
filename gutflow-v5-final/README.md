# GutFlow - 肠胃健康追踪

## 用 GitHub Actions 自动编译 APK（无需 Android Studio）

### 前提条件
- 一个 GitHub 账号（免费即可）
- 能访问 github.com

---

### 第一步：创建 GitHub 仓库（2分钟）

1. 打开 [github.com/new](https://github.com/new)
2. Repository name 填 `gutflow`
3. 选择 **Public**（免费）
4. 勾选 **Add a README file**
5. 点击 **Create repository**

**预期结果**：你看到了一个新仓库页面，地址是 `github.com/你的用户名/gutflow`

---

### 第二步：上传代码（3分钟）

#### 方法 A：网页上传（推荐，最简单）

1. 在你的 GutFlow 仓库页面，点击 **Add file** → **Upload files**
2. 把本项目的所有文件拖进去（或者点 **choose your files** 选择）
3. 等文件上传完
4. Commit changes 标题填 `Initial commit`
5. 点击 **Commit changes**

#### 方法 B：命令行（如果你会用git）

```bash
git init
git add -A
git commit -m "init"
git remote add origin https://github.com/你的用户名/gutflow.git
git push -u origin main
```

**预期结果**：仓库里有了所有代码文件，包括 `src/`、`android/`、`.github/workflows/` 等目录

---

### 第三步：触发自动编译（1分钟）

1. 在你的仓库页面，点击顶部的 **Actions** 标签
2. 你会看到 **Build APK** 工作流
3. 点击 **Run workflow** → **Run workflow**（绿色按钮）

**预期结果**：页面显示一个黄色的进度条，表示正在编译

---

### 第四步：等待编译完成（5-10分钟）

- 黄色 = 进行中
- 绿色 ✓ = 成功
- 红色 ✗ = 失败（如果失败，请检查上面的步骤是否正确）

**预期结果**：Actions 页面显示绿色 ✓，表示编译成功

---

### 第五步：下载 APK（1分钟）

1. 点击成功的那个工作流运行记录
2. 向下滚动到 **Artifacts** 区域
3. 点击 **gutflow-apk** 下载
4. 解压下载的 zip 文件，里面就是 `app-debug.apk`

**预期结果**：你得到了一个 `app-debug.apk` 文件

---

### 第六步：安装到手机（OPPO Find N6）

#### 方法 A：直接安装（需要电脑）

1. 用 USB 线连接手机和电脑
2. 手机上弹出"允许USB调试" → 点击**允许**
3. 电脑命令行运行：
   ```bash
   adb install app-debug.apk
   ```
4. 手机上看到 GutFlow 图标

#### 方法 B：发送到手机安装（无需电脑）

1. 把 `app-debug.apk` 发送到微信/钉钉/邮件
2. 在手机上打开文件
3. 系统可能提示"未知来源" → 去设置里允许一下
4. 安装完成

**预期结果**：手机桌面上出现了 GutFlow 图标，点击能打开

---

## 功能说明

### 概览页
- 显示今日概览（已记录几餐、症状数、排便数）
- 近7天症状趋势（柱状图）
- 预警提醒（连续症状、饮食风险）
- 最近3天记录摘要

### 日记页
- 日历：有记录的日子显示绿点
- 日记：一天一页，分区块记录（早餐/午餐/晚餐/饮料/大便/症状/每日综合）
- 大便和症状支持多次记录

### 食物库
- 1103种食物，13个类别
- 每个食物标注 FODMAP/GERD/IBS 风险
- 搜索功能

### 设置
- 主题色切换
- 字体大小调整
- Excel/CSV 导入导出
- 数据完全本地存储

---

## 数据说明

- 所有数据存储在手机本地 IndexedDB 中
- 不上传到任何服务器
- 可随时导出 Excel 备份
- 预置15天演示数据

---

## 技术栈

- React 19 + TypeScript + Vite
- Tailwind CSS
- Dexie.js (IndexedDB)
- SheetJS (Excel 导入导出)
- Capacitor (Android 封装)
