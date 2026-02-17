/**
 * Local development server
 * Runs the Express app directly (no Lambda/serverless-http wrapper)
 */
import 'dotenv/config'
import app from './app.js'

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`  ➜  Backend: http://localhost:${PORT}`)
})
