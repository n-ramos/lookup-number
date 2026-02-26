import cron from 'node-cron'
import { spawn } from 'node:child_process'
import process from 'node:process'

const enabled = (process.env.SCHEDULER_ENABLED ?? 'false') === 'true'
const expr = process.env.SCHEDULER_CRON ?? '0 3 * * *'

if (!enabled) {
  console.log('[scheduler] disabled. Set SCHEDULER_ENABLED=true to enable.')
  process.exit(0)
}

console.log(`[scheduler] enabled with cron "${expr}"`)

cron.schedule(expr, () => {
  console.log('[scheduler] running sync:arcep...')
  const p = spawn('node', ['ace', 'sync:arcep'], { stdio: 'inherit' })
  p.on('exit', (code) => console.log('[scheduler] done with code', code))
})
