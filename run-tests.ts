import { exec, spawn, ChildProcess, ExecOptions } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoUrl: string = 'https://github.com/abh3po/nostr-forms.git';
const repoDir: string = path.join(__dirname, 'nostr-forms');

async function run(cmd: string, opts: ExecOptions = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = exec(cmd, opts, (err, stdout, stderr) => {
      if (err) reject(err);
      else resolve(stdout);
    });
    proc.stdout?.pipe(process.stdout);
    proc.stderr?.pipe(process.stderr);
  });
}

(async (): Promise<void> => {
  try {
    if (!fs.existsSync(repoDir)) {
      console.log('📥 Cloning nostr-forms...');
      await run(`git clone ${repoUrl}`);
    } else {
      console.log('🔄 Pulling latest changes...');
      await run(`git -C ${repoDir} pull`);
    }

    console.log('📦 Installing dependencies...');
    await run('npm install', { cwd: repoDir });

    console.log('🚀 Starting dev server...');
    const appProcess: ChildProcess = spawn('yarn', ['workspace', '@formstr/web-app', 'start'], {
      cwd: repoDir,
      shell: true,
      detached: true,
      stdio: 'ignore'
    });
    appProcess.unref();

    console.log('⏳ Waiting for app to start...');
    await new Promise<void>(res => setTimeout(res, 8000));

    console.log('🧪 Running Playwright tests...');
    await run('npx playwright test', { cwd: __dirname });

    console.log('✅ Done!');
    if (appProcess.pid) {
      process.kill(-appProcess.pid);
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error('❌ Error:', error.message);
  }
})();