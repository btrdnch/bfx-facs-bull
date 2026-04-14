# Bull Reconnection Test Suite

This suite demonstrates the difference in reconnection behavior between the `master` branch and the `handle-reconnect` feature branch in `bfx-facs-bull`.

## Prerequisites
- Docker & Docker Compose
- Node.js installed locally

## Quick Start Test

### 1. Initialize Docker Redis
```bash
cd reconnection-test-suite
docker-compose up -d
```

### 2. Run Test on MASTER (Expected FAIL)
1. Switch your repository to the `master` branch:
   ```bash
   git checkout master
   ```
2. Run the test script:
   ```bash
   node test-bull-facility.js
   ```
3. **Simulate Outage**: In a separate terminal, run:
   ```bash
   docker-compose stop redis
   ```
4. **Simulate Recovery**: After a few seconds, run:
   ```bash
   docker-compose start redis
   ```
5. **Observation**: On `master`, you will see `[REDIS] Client ready`, but the `[WORKER]` logs will **STOP** and never resume.

### 3. Run Test on FEATURE BRANCH (Expected PASS)
1. Switch your repository to the `handle-reconnect` branch:
   ```bash
   git checkout handle-reconnect
   ```
2. Run the test script again:
   ```bash
   node test-bull-facility.js
   ```
3. Repeat the outage/recovery steps (stop/start Redis).
4. **Observation**: On this branch, you will see `[REDIS] Client ready` followed by `rerun queue`. The `[WORKER]` will **RESUME** processing jobs immediately.

## Cleanup
```bash
docker-compose down
```
