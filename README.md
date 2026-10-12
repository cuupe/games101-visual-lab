# GAMES101 图形学实验室

按闫令琪老师 GAMES101 2020 年官方课程的 22 讲组织的独立学习网站。
React + 原生 WebGL + KaTeX，教学文字、算例与练习独立撰写，提供官方讲义页码链接。

## 内容

- 144 个知识点，每点包含基础解释、因果推理、分步案例、实现易错点与迁移问答。
- 432 幅原创 SVG 教学图，每个知识点三幅步骤、参数对比或反例；支持图解速览、点击放大、键盘切图、手机滑动和原图下载。每讲首页提供图像预览导航。
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
npm run illustrations
node scripts/check-runtime.cjs
node scripts/check-sandbox.cjs
node scripts/check-homework.cjs
npm run build
```

`npm test` 检查课程结构、公式严格解析、官方页码、题目数据、数值算法、PPM 解码与编译器完整性。运行检查通过真实 Clang/LLD/WASI 编译执行 C++；作业模板的 TODO 保留，成功运行不代表作业算法已经完成。部分初始模板输出黑图，作业 8 会提示先实现绳索构造器。

`npm run illustrations` 从 `scripts/illustrations/` 的数学与绘图代码重新生成全部图解和课程图片索引。SVG 为独立资源，图片按阅读位置延迟加载；图文模式保留完整讲解，图解速览只展示各知识点的三图与读图提示。图像是独立编写的教学示意，不是官方课件截图；曲线、插值、光学关系与积分轨迹按图中参数计算。

## C++ 环境

浏览器 Worker 内运行 Clang 8.0.1、LLD、WASI libc/libc++；无需远程编译服务器。首次使用下载约 60 MB 工具链，Eigen 另约 5 MB。代码修改保存在当前浏览器的 IndexedDB；建议定期下载工作区备份。

用户 C++ 只在浏览器内执行，没有远程执行接口。程序仅能导入明确允许的 WASI 系统调用；无法调用 shell、进程、网络、DOM、浏览器存储或虚拟文件系统内部函数。编译器与程序使用独立内存文件系统，运行环境只包含本次项目文件、模型/纹理资产及约定输出，不继承编译器头文件、库和对象文件。此处依赖浏览器和 WebAssembly 的隔离机制，未声称防御浏览器引擎自身漏洞。原理参考 [WebAssembly 安全模型](https://webassembly.org/docs/security/) 与 [导入机制](https://webassembly.org/docs/portability/)。

程序运行最多 30 秒，编译与运行总计最多 120 秒；主线程看门狗或“停止”按钮会销毁 Worker。程序、Clang 和 LLD 的线性内存各限 512 MiB，虚拟文件系统模块限 256 MiB；这不是整个浏览器进程的总内存额度。虚拟文件单个限 16 MiB，合计文件数据限 64 MiB。标准输出在 UTF-8 解码前按字节计数，最多 200 KiB，分批传给页面。项目最多 96 个文件/32 个 C++ 入口、总计 24 MiB，单个输入文件最多 8 MiB；标准输入最多 64 KiB，参数最多 32 个/合计 8 KiB。路径、Base64、导入备份、浏览器保存数据和 Worker 请求均经过结构与资源校验。结果总量最多 16 MiB，图像最多 400 万像素，CSV 预览最多 512 KiB/20000 点，错误结果可下载但不会无限展开。

`node scripts/check-sandbox.cjs` 通过真实 Clang/LLD 编译资源攻击和正常控制程序：单次大输出、UTF-8 小消息洪泛、超大文件、累计文件耗尽、超限内存增长、非法系统调用指针与过长路径。每个测试另有独立 Worker 超时保护。`npm test` 检查能力白名单拒绝内部/网络/Canvas 导入、输入验证、CSV 边界、内存最大值、停止与看门狗清理。浏览器另实测死循环被自动终止并能重新运行；官方作业 0–8 保持真实编译执行。

工具链属于 2019 年版本，不支持原生桌面 GUI、完整 OpenCV、线程、C++ 异常或任意系统软件包。网页适配实现作业使用的图像操作子集，以 PPM 代替桌面窗口；每个项目展示改动说明。

`public/compiler/NOTICE.md` 记录工具链来源、许可、UTF-8/时钟适配和文件读取修复。`scripts/rebuild-memfs.cjs` 使用随站工具链重建修复后的虚拟文件系统。`scripts/chunk-compiler.cjs` 生成托管分片，Worker 重组后验证 SHA-256，编译器原字节不变。

## GitHub Pages 托管

这是纯静态网站，GitHub Pages 只分发 HTML/JS/WASM/作业资产，学生代码不会提交到 Actions 或服务器运行。Vite 使用相对资源路径，适用于仓库子目录。生产构建约 88 MiB（实际大小以 dist 为准），低于 Pages 的 1 GiB 网站限制；首次 C++ 使用仍会下载较大的工具链。

仓库当前为私有；GitHub Free 的 Pages 仅支持公开仓库，私有仓库需要 Pro/Team/Enterprise 等受支持方案。Pages 网站通常公开可访问，即使源码仓库保持私有；仓库与网站可见性是两个不同设置。参见 [官方可用方案与限制](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)。

部署配置已在 `.github/workflows/pages.yml` 准备好，只能手动触发。确认账户支持和网站访问范围后，在仓库 Settings → Pages 将 Source 设为 GitHub Actions，再在 Actions 中手动运行 “Publish learning site to GitHub Pages”。工作流先测试沙箱和构建，再发布 dist；无需 C++ 后端、访问令牌或数据库密钥。

## 官方来源与第三方许可

- [官方课程与 22 讲课件](https://sites.cs.ucsb.edu/~lingqi/teaching/games101.html)。`src/course/sources.json` 记录每份 PDF 的页数、来源与 SHA-256；网站链接官方 PDF，没有托管视频或复制课件页面。
- [GAMES 官方论坛](https://games-cn.org/forums/) 的作业公告与下载包。`public/homework/manifest.json` 和 `official-N.json` 记录原包来源、校验值与原文件；`project-N.json` 是保留教学 TODO 的网页工作副本。作业 3 同时链接官方更正公告，当前副本注明其下载包来源。
- [wasm-clang](https://github.com/binji/wasm-clang)，固定版本及 Apache/LLVM notices 保留于 `public/compiler/`。
- [Eigen 3.3.7](https://gitlab.com/libeigen/eigen/-/tree/3.3.7)，原头文件及 COPYING notices 保留于 `eigen.json`。
- [KaTeX](https://katex.org/)、React、Vite 的许可见各依赖包。

官方课件、作业源文件与模型资产的权利仍归原作者，本站没有把它们重新声明为自己的通用开源授权。本项目为独立学习辅助工具，非官方课程网站。

## 页面验证

桌面与手机布局使用 Codex 浏览器测试。逐讲检查 22 个理论页和 22 个主要实验：知识点完整、公式无解析错误、实验正常输出且无 NaN。交互检查包括阅读目录、推导展开、自测反馈/错题、专题参数、C++ 修改后运行、编译错误、停止循环、源码对照与保存。测试截图和运行日志保留在本地 `qa/`，不随源码发布。
