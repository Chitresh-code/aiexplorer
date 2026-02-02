# Production Deployment Checklist

Use this checklist to ensure a smooth and safe deployment to production.

## Pre-Deployment (1 Week Before)

### Code Quality
- [ ] All tests pass (`npm test`)
- [ ] TypeScript compilation successful (`npm run type-check`)
- [ ] ESLint has no errors (`npm run lint`)
- [ ] Code formatting is correct (`npm run format:check`)
- [ ] No console.log statements left in code
- [ ] No `any` types used
- [ ] No secrets in code

### Documentation
- [ ] README is up-to-date
- [ ] API documentation is current
- [ ] Architecture documentation reflects changes
- [ ] CHANGELOG.md is updated with new features
- [ ] Database schema changes documented
- [ ] Configuration options documented

### Testing
- [ ] Unit tests written for new features
- [ ] Integration tests pass
- [ ] E2E tests pass (critical paths)
- [ ] Manual testing completed
- [ ] Cross-browser testing done
- [ ] Mobile/responsive design tested
- [ ] Accessibility (a11y) checked

### Performance
- [ ] Bundle size reviewed
- [ ] No unexpected dependencies added
- [ ] Images optimized
- [ ] Code splitting working
- [ ] Lazy loading implemented where needed
- [ ] Core Web Vitals check done

### Security
- [ ] Security headers configured correctly
- [ ] Environment variables in secrets management
- [ ] No credentials in code
- [ ] CORS properly configured
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified
- [ ] Input validation comprehensive
- [ ] Dependencies scanned for vulnerabilities (`npm audit`)

## 48 Hours Before Deployment

### Build Process
- [ ] Build completes without errors (`npm run build`)
- [ ] Build size is acceptable
- [ ] No build warnings
- [ ] Artifacts generated correctly

### Environment Setup
- [ ] Production environment variables prepared
- [ ] Database connection string validated
- [ ] API endpoints configured
- [ ] Third-party service credentials ready
- [ ] SSL certificates valid
- [ ] CDN configured (if applicable)

### Monitoring
- [ ] Error tracking configured (e.g., Sentry)
- [ ] Application monitoring enabled
- [ ] Logging configured
- [ ] Alerts set up
- [ ] Dashboard created for monitoring
- [ ] Backup strategy in place

### Backup and Rollback
- [ ] Current production backup created
- [ ] Database backup verified
- [ ] Rollback plan documented
- [ ] Previous version accessible
- [ ] Rollback tested successfully

## Day of Deployment

### Pre-Deployment
- [ ] Latest code pulled from main branch
- [ ] All tests passing one final time
- [ ] Database migrations tested locally
- [ ] Deployment environment verified
- [ ] Team notified of deployment window
- [ ] Chat/Slack channel for updates ready

### Deployment
- [ ] Deploy application
- [ ] Verify application starts
- [ ] Health check endpoint responds
- [ ] API endpoints responding
- [ ] Database connections working
- [ ] Authentication working
- [ ] Third-party integrations working

### Post-Deployment (Immediate)
- [ ] Application loads without errors
- [ ] All critical features working
- [ ] Login/authentication working
- [ ] API calls returning expected data
- [ ] Database queries executing correctly
- [ ] Error logs normal
- [ ] No spike in error rates
- [ ] Monitoring data flowing in

### Post-Deployment (First Hour)
- [ ] Monitor error logs continuously
- [ ] Check performance metrics
- [ ] Verify user reports (if applicable)
- [ ] Confirm email notifications working (if applicable)
- [ ] Test critical workflows manually
- [ ] Monitor server resources (CPU, memory, disk)

### Post-Deployment (First Day)
- [ ] Review error logs for patterns
- [ ] Check application performance metrics
- [ ] Verify all features working as expected
- [ ] Gather user feedback
- [ ] Monitor database performance
- [ ] Verify backups are working
- [ ] Document any issues encountered
- [ ] Create post-deployment notes

## Configuration Checklist

### Environment Variables
- [ ] NEXT_PUBLIC_API_URL set correctly
- [ ] NEXT_PUBLIC_MSAL_CLIENT_ID set
- [ ] NEXT_PUBLIC_MSAL_AUTHORITY set
- [ ] NEXT_PUBLIC_MSAL_REDIRECT_URI set
- [ ] DB_SERVER set
- [ ] DB_DATABASE set
- [ ] DB_USERNAME set
- [ ] DB_PASSWORD set (in secrets)
- [ ] POWER_AUTOMATE_APPROVAL_FLOW_URL set (if applicable)
- [ ] NODE_ENV set to "production"

### Security Headers
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] CORS allowed origins configured
- [ ] CSP headers configured

### Database
- [ ] Connection pooling configured
- [ ] Connection timeout set
- [ ] Query timeout set
- [ ] Database backups enabled
- [ ] Indexes created
- [ ] Statistics updated
- [ ] Maintenance jobs scheduled

### Caching
- [ ] Cache headers configured
- [ ] CDN cache rules set
- [ ] Browser cache headers set
- [ ] API response caching configured

### Monitoring and Logging
- [ ] Application logging configured
- [ ] Error tracking enabled
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring enabled
- [ ] Alert thresholds configured

## Rollback Procedure

If issues occur:

1. **Identify Issue**
   - [ ] Check error logs
   - [ ] Verify monitoring alerts
   - [ ] Assess impact scope

2. **Decide on Rollback**
   - [ ] Critical issue? → Rollback immediately
   - [ ] Non-critical? → Decide to continue or rollback

3. **Execute Rollback**
   - [ ] Deploy previous version
   - [ ] Verify application is stable
   - [ ] Confirm data integrity

4. **Post-Rollback**
   - [ ] Notify team
   - [ ] Create incident report
   - [ ] Identify root cause
   - [ ] Plan fix for next deployment

## Post-Deployment (1-7 Days)

- [ ] Monitor application performance
- [ ] Gather user feedback
- [ ] Review all metrics (performance, errors, usage)
- [ ] Verify all features working
- [ ] Performance metrics within targets
- [ ] Error rates normal
- [ ] No critical issues reported

## Success Criteria

Deployment is successful when:

✅ Application is deployed and running  
✅ No critical errors in logs  
✅ All critical features working  
✅ Performance metrics normal  
✅ Error rates acceptable  
✅ Users can access application  
✅ Authentication working  
✅ Database operations normal  
✅ API endpoints responding  
✅ Monitoring and alerts active  

## Emergency Contacts

Deployment emergency contacts:
- [ ] Team Lead: ___________
- [ ] Database Admin: ___________
- [ ] DevOps/Infrastructure: ___________
- [ ] On-Call: ___________

## Post-Deployment Notes

Document any issues or important notes:

```
Date Deployed: ___________
Version: ___________
Notes:
_____________________________________
_____________________________________
_____________________________________
```

## Deployment History

Keep track of deployments:

| Date | Version | Status | Issues | Fixed By |
|------|---------|--------|--------|----------|
|      |         |        |        |          |
|      |         |        |        |          |
|      |         |        |        |          |

## Lessons Learned

After deployment, document:

1. **What went well**
   - _____________________________________
   - _____________________________________

2. **What didn't go well**
   - _____________________________________
   - _____________________________________

3. **What to improve next time**
   - _____________________________________
   - _____________________________________

## Resources

- See `PRODUCTION_REFACTOR.md` for code quality improvements
- See `docs/DEVELOPMENT.md` for development standards
- See `docs/ARCHITECTURE.md` for system architecture
- See `docs/API.md` for API documentation
- See `README.md` for setup and deployment options

---

**Approval Sign-Off**

- [ ] Code Review: __________ Date: __________
- [ ] QA Approval: __________ Date: __________
- [ ] DevOps Approval: __________ Date: __________
- [ ] Product Owner: __________ Date: __________
