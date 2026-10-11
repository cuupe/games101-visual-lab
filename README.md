# GAMES101 图形学实验室

按闫令琪老师 GAMES101 2020 年官方课程的 22 讲组织的独立学习网站。
React + 原生 WebGL + KaTeX，教学文字、算例与练习独立撰写，提供官方讲义页码链接。

## 内容

- 144 个知识点，每点包含基础解释、因果推理、分步案例、实现易错点与迁移问答。
- 188 个算例（144 个随知识点的案例 + 44 个课后算例）。
- 22 个逐步推导工作坊，共 88 步；263 道自测与 144 个知识点检查。
- 22 个主要 WebGL 实验、43 个引导任务、5 个专题实验：频率混叠、透视插值、Loop 细分、二维 IK、积分能量误差。
- 作业 0–8 的官方原始文件与独立的网页工作副本；可编辑、多文件编译、真实 C++17 运行、输出图像/绳索数据、备份与自动保存。

讲解覆盖线性代数、MVP、光栅化、频域采样、着色与纹理、几何表示与网格、求交与 BVH、辐射度量、渲染方程、蒙特卡洛、材质、复杂光传输、相机与光场、颜色、动画及物理模拟。实现补充与官方概览的范围在正文中说明。

## 本地运行

需要 Node.js 20.19+ 或 22.12+。

```sh
npm ci
npm run dev
```

默认地址 `http://127.0.0.1:5178/`。

```sh
npm test
node scripts/check-runtime.cjs
node scripts/check-homework.cjs
npm run build
```

`npm test` 检查课程结构、公式严格解析、官方页码、题目数据、数值算法、PPM 解码与编译器完整性。运行检查通过真实 Clang/LLD/WASI 编译执行 C++；作业模板的 TODO 保留，成功运行不代表作业算法已经完成。部分初始模板输出黑图，作业 8 会提示先实现绳索构造器。

## C++ 环境

浏览器 Worker 内运行 Clang 8.0.1、LLD、WASI libc/libc++；无需远程编译服务器。首次使用下载约 60 MB 工具链，Eigen 另约 5 MB。代码修改保存在当前浏览器的 IndexedDB；建议定期下载工作区备份。

运行时为 120 秒、512 MiB 程序内存和 200 KB 文本输出限制；可立即停止。工具链属于 2019 年版本，不支持原生桌面 GUI、完整 OpenCV、线程、C++ 异常或任意系统软件包。网页适配实现作业使用的图像操作子集，以 PPM 代替桌面窗口；每个项目展示改动说明。

`public/compiler/NOTICE.md` 记录工具链来源、许可、UTF-8/时钟适配和文件读取修复。`scripts/rebuild-memfs.cjs` 使用随站工具链重建修复后的虚拟文件系统。`scripts/chunk-compiler.cjs` 生成托管分片，Worker 重组后验证 SHA-256，编译器原字节不变。

## 官方来源与第三方许可

- [官方课程与 22 讲课件](https://sites.cs.ucsb.edu/~lingqi/teaching/games101.html)。`src/course/sources.json` 记录每份 PDF 的页数、来源与 SHA-256；网站链接官方 PDF，没有托管视频或复制课件页面。
- [GAMES 官方论坛](https://games-cn.org/forums/) 的作业公告与下载包。`public/homework/manifest.json` 和 `official-N.json` 记录原包来源、校验值与原文件；`project-N.json` 是保留教学 TODO 的网页工作副本。作业 3 同时链接官方更正公告，当前副本注明其下载包来源。
- [wasm-clang](https://github.com/binji/wasm-clang)，固定版本及 Apache/LLVM notices 保留于 `public/compiler/`。
- [Eigen 3.3.7](https://gitlab.com/libeigen/eigen/-/tree/3.3.7)，原头文件及 COPYING notices 保留于 `eigen.json`。
- [KaTeX](https://katex.org/)、React、Vite 的许可见各依赖包。

官方课件、作业源文件与模型资产的权利仍归原作者，本站没有把它们重新声明为自己的通用开源授权。本项目为独立学习辅助工具，非官方课程网站。

## 页面验证

桌面与手机布局使用 Codex 浏览器测试。逐讲检查 22 个理论页和 22 个主要实验：知识点完整、公式无解析错误、实验正常输出且无 NaN。交互检查包括阅读目录、推导展开、自测反馈/错题、专题参数、C++ 修改后运行、编译错误、停止循环、源码对照与保存。测试截图和运行日志保留在本地 `qa/`，不随源码发布。
