const { EventEmitter } = require('events')
const path = require('path')
const BullFacility = require('../index')

const facCaller = new (class FacCaller extends EventEmitter {
  constructor () {
    super()
    this.ctx = { root: __dirname }
  }
})()

const bullFac = new BullFacility(
  facCaller,
  {
    ns: 'bull',
    queue: 'reconnect-test-queue',
    debug: true
  },
  { env: 'test' }
)

async function runTest () {
  console.log('--- Starting Bull Reconnection Test ---')

  await new Promise((resolve, reject) => {
    bullFac._start(err => {
      if (err) return reject(err)
      resolve()
    })
  })

  const queue = bullFac.queue
  console.log('Bull Facility started. Periodic job pusher active.')

  // Add a processor to "work" on the jobs
  queue.process(async job => {
    console.log(
      `[WORKER] Processing job ${job.id} at ${new Date().toISOString()}`
    )
  })

  // Periodically push jobs
  setInterval(async () => {
    try {
      const job = await queue.add({ timestamp: Date.now() })
      console.log(`[PUSHER] Added job ${job.id}`)
    } catch (err) {
      console.error(`[PUSHER] Failed to add job: ${err.message}`)
    }
  }, 5000)

  // Manual listeners for the redis client to track reconnection
  queue.client.on('reconnecting', err => {
    console.log('[REDIS] Client reconnecting...')
  })
  queue.client.on('ready', () => {
    console.log('[REDIS] Client ready (Connection Restored)')
  })

  console.log('\nTEST INSTRUCTIONS:')
  console.log('1. Observe jobs being added and processed.')
  console.log('2. Stop Redis: `docker-compose stop redis`')
  console.log('3. Observe pusher failure and reconnecting logs.')
  console.log('4. Start Redis: `docker-compose start redis`')
  console.log(
    '5. Observe: On FEATURE branch, processing resumes. On MASTER, it remains STALLED.'
  )
}

runTest().catch(err => {
  console.error('Test failed:', err)
  process.exit(1)
})
