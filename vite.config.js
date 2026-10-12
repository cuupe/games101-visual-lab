import { defineConfig } from 'vite';
import {unlinkSync} from 'node:fs';
import {resolve} from 'node:path';
export default defineConfig({
 base:'./',
 plugins:[{name:'hosted-compiler-parts',apply:'build',closeBundle(){
  // Browser workers load the byte-identical 8 MiB parts. Keep the upstream
  // whole-file copy in source for auditing and rebuilding, outside the build.
  unlinkSync(resolve('dist/compiler/clang'));
 }}],
 build: { chunkSizeWarningLimit: 700,rollupOptions:{output:{manualChunks:{math:['katex'],react:['react','react-dom']}}} }, server: { strictPort: true }
});
