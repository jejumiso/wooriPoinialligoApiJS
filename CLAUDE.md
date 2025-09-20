# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js Express API server that provides integration services for multiple Korean payment and messaging platforms. The server acts as a middleware layer between client applications and various third-party APIs including Aligo (KakaoTalk messaging), Bootpay (payments), NicePay (payments), and SmartStore (e-commerce).

## Essential Commands

- `npm start` - Start the server on port 8001 (production)
- `node web.js` - Alternative way to start the server directly

## Architecture

### Core Structure
- **Entry Point**: `web.js` - Express server configuration and route mounting
- **Routes**: Route definitions in `/routes` directory, organized by service
- **Handlers**: Business logic in `/handlers` directory, containing actual API interactions
- **Config**: Authentication credentials in `/config/auth.js`
- **Utils**: Shared utilities like encryption helpers in `/utils`

### API Endpoints Structure
All endpoints follow the pattern `/api/{service}/{operation}` where:
- **aligo**: KakaoTalk messaging (alimtalk, friendtalk, templates, profiles)
- **bootpay**: Payment processing and user tokens
- **nicepay**: NicePay payment integration
- **smartstore**: SmartStore e-commerce platform integration
- **encryption**: Data encryption/decryption utilities

### Request/Response Pattern
Most handlers follow a consistent pattern:
1. Accept POST requests with JSON body
2. Merge request data with AuthData from config
3. Call third-party API using dedicated libraries (aligoapi, @bootpay/backend-js, etc.)
4. Return response directly to client with minimal processing

### Key Services Integration

**Aligo API**: Comprehensive KakaoTalk messaging service including:
- Profile management and authentication
- Template CRUD operations
- AlimTalk (business messages) and FriendTalk (promotional messages)
- Message history and delivery tracking

**Bootpay**: Payment processing with user token management and payment cancellation

**SmartStore**: E-commerce integration for order management and dispatch processing

**NicePay**: Payment gateway integration (handlers present but routes may need verification)

## Deployment Notes

Based on `readme.txt`, this project is specifically configured for Cafe24 Node.js hosting:
- Requires Node.js version 14
- Must deploy from `master` branch
- `web.js` must be in root directory
- Uses Cloudflare for HTTPS through custom domain
- Git deployment requires SSH key authentication with Cafe24

## Development Guidelines

### Adding New Endpoints
1. Create handler function in appropriate `/handlers/{service}Handlers.js`
2. Add route definition in `/routes/{service}.js`
3. Import and mount route in `web.js` if new service
4. Follow existing error handling patterns (try/catch with detailed logging)

### Authentication
- API credentials stored in `/config/auth.js`
- All third-party API calls merge request data with AuthData
- No additional authentication layer - relies on API key security

### Logging
- Important operations include timestamp logging (especially alimtalkSend)
- Error responses include both user-friendly messages and technical details
- Console logging used throughout for debugging

## Security Considerations

- API keys are stored in plaintext in config files
- CORS is enabled for all origins
- No input validation beyond what third-party APIs provide
- Sensitive data may be logged - review before production deployment