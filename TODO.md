# SMTP Verification Refactor TODO

## Status: In Progress

**Plan Breakdown:**
1. ✅ Create TODO.md (this file)
2. 🔄 Extract promisified verifySMTP() function from existing transporter.verify callback logic
3. 🔄 Update getTransporter(): await verifySMTP() before caching transporter
4. 🔄 Update /api/config-status to ensure verification runs if needed
5. 🔄 Test: Run server, check /api/config-status returns verified:true, test email endpoint
6. ✅ attempt_completion: Mark task complete

**Next step:** Test changes (run `npm run dev`, check localhost:3000/api/config-status).

