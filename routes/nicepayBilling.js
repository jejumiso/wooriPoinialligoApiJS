const express = require('express')
const router = express.Router()
const {
  registBillingKey,
  executeBillingPayment,
  expireBillingKey,
  cancelPayment,
  netcancelPayment,
  getPaymentStatus,
  findPaymentByOrderId,
} = require('../handlers/nicepayBillingHandlers')

// POST handlers
router.post('/v1/subscribe/regist', registBillingKey)
router.post('/v1/subscribe/:bid/payments', executeBillingPayment)
router.post('/v1/subscribe/:bid/expire', expireBillingKey)
router.post('/v1/payments/:tid/cancel', cancelPayment)
router.post('/v1/payments/netcancel', netcancelPayment)

// GET handlers — /find/:orderId must be before /:tid to avoid route conflict
router.get('/v1/payments/find/:orderId', findPaymentByOrderId)
router.get('/v1/payments/:tid', getPaymentStatus)

module.exports = router
