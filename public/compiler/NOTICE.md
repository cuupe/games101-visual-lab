# Browser C++ runtime

Clang 8.0.1, LLD, WASI libc/libc++, and memory-filesystem runtime are vendored from
https://github.com/binji/wasm-clang at commit 648c4a89997a351eef75cdaec3ef5b89d4937dec.
See LICENSE, LICENSE.llvm and provenance.json for original notices and checksums.
shared.js preserves the upstream notice and adds the WASI realtime and
monotonic clocks required by assignments 6 and 7, plus UTF-8 standard input/output
handling for Chinese text and split multibyte characters. worker.js is the
locally authored runner. The original checksums in provenance.json describe the
upstream files, before local patches.

memfs-fixed.wasm is rebuilt from binji/llvm-project/binji/memfs.c (Git blob
1f03f338841fe505d99c5120a0967383f6a062a8), with the ReadIovec bounds check fixed:
each read is clamped to its destination buffer and the remaining file length,
including successive iovecs and EOF. Source and rebuild instructions are in
scripts/memfs/ and scripts/rebuild-memfs.cjs. stb_sprintf.h retains its MIT /
public-domain dual license. The compiler's original memfs binary is retained.

Hosted Clang uses four parts of at most 8 MiB, assembled and SHA-256 verified
inside the Worker; its compiler bytes are unchanged. The whole-file upstream
copy is retained in source and omitted from the static build.

Eigen 3.3.7 headers come from https://gitlab.com/libeigen/eigen/-/archive/3.3.7/eigen-3.3.7.zip.
eigen.json retains the upstream COPYING files and source checksum. Eigen's core is
MPL-2.0; individual files and COPYING files contain the applicable terms.

This is an in-browser WASI sandbox, not a remote native Linux installation.
Compilation and execution run in a dedicated Web Worker with an in-memory filesystem.
No shell, host filesystem, network API, native OpenCV, GLFW, threads, package installer,
or debugging backend is exposed to student C++ programs. The parent terminates
program execution after 30 seconds, or the whole job after 120 seconds, and
supports immediate Stop. UTF-8 output is capped at 200 KiB before decoding and
delivered in batches. Programs may only import explicitly allowlisted WASI
functions; memfs internals and Canvas imports are excluded. The runtime filesystem
is separate from the compiler filesystem and contains only project data and
designated output files. sandbox-policy.js validates the editor, backup, stored
changes, Worker requests and returned results.
The program, Clang and LLD each have a 512 MiB linear-memory maximum, applied to
loaded toolchain bytes in memory without altering the upstream copies on disk.
Clang's original bytes are SHA-256 verified before this memory-limit adjustment.
The rebuilt memfs has a 256 MiB memory maximum, a 16 MiB per-file data quota and
64 MiB aggregate file-data quota. Local C patches bound file growth, release
truncated/deleted data, correct the fd upper bound and avoid overreading a
preopened directory name. JS validates guest iovecs and path bounds before C
syscalls. Total browser memory additionally includes compiler buffers and UI.
Supported syntax and standard library are bounded by the bundled 2019 toolchain.

OpenCV-compatible teaching adapters implement only the specific pixel, point, and
image operations used by the assignments, with PPM output instead of desktop windows.
They do not claim to be an OpenCV implementation. Original course source is retained
separately, and each runnable project records its platform adaptations.
