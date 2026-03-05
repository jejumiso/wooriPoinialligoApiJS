const axios = require('axios')

const NICEPAY_TIMEOUT_MS = 30000

/**
 * Determines the NicePay base URL based on isRealServe flag.
 */
function getNicepayBaseUrl(isRealServe) {
  return isRealServe
    ? 'https://api.nicepay.co.kr'
    : 'https://sandbox-api.nicepay.co.kr'
}

/**
 * Sends a success response in the standard proxy format.
 */
function sendSuccess(res, data) {
  return res.status(200).json({
    isSuccess: true,
    statusCode: 200,
    data,
    message: data.resultMsg || 'OK',
  })
}

/**
 * Sends an error response in the standard proxy format.
 */
function sendError(res, error) {
  if (error.response) {
    return res.status(error.response.status).json({
      isSuccess: false,
      statusCode: error.response.status,
      data: error.response.data,
      message: error.response.data?.resultMsg || 'Unknown error',
    })
  }
  if (error.request) {
    return res.status(502).json({
      isSuccess: false,
      statusCode: 502,
      error: 'No response from NicePay',
      message: 'No response from NicePay',
    })
  }
  return res.status(500).json({
    isSuccess: false,
    statusCode: 500,
    error: error.message,
    message: error.message,
  })
}

// ─── 1. Billing key registration ───
async function registBillingKey(req, res) {
  try {
    const { isRealServe, ...nicepayBody } = req.body
    const baseUrl = getNicepayBaseUrl(isRealServe)
    const url = `${baseUrl}/v1/subscribe/regist`
    console.log(`[proxy] POST ${url} isRealServe=${isRealServe} body keys: ${Object.keys(nicepayBody).join(',')}`)

    const response = await axios.post(url, nicepayBody, {
      headers: {
        Authorization: req.headers.authorization,
        'Content-Type': 'application/json',
      },
      timeout: NICEPAY_TIMEOUT_MS,
    })

    console.log(`[proxy] registBillingKey response: ${JSON.stringify(response.data)}`)
    return sendSuccess(res, response.data)
  } catch (error) {
    console.error(`[proxy] registBillingKey error:`, error.response?.status, JSON.stringify(error.response?.data))
    return sendError(res, error)
  }
}

// ─── 2. Billing key payment ───
async function executeBillingPayment(req, res) {
  try {
    const { isRealServe, ...nicepayBody } = req.body
    const { bid } = req.params
    const baseUrl = getNicepayBaseUrl(isRealServe)
    const url = `${baseUrl}/v1/subscribe/${bid}/payments`

    const response = await axios.post(url, nicepayBody, {
      headers: {
        Authorization: req.headers.authorization,
        'Content-Type': 'application/json',
      },
      timeout: NICEPAY_TIMEOUT_MS,
    })

    return sendSuccess(res, response.data)
  } catch (error) {
    return sendError(res, error)
  }
}

// ─── 3. Billing key expiry ───
async function expireBillingKey(req, res) {
  try {
    const { isRealServe, ...nicepayBody } = req.body
    const { bid } = req.params
    const baseUrl = getNicepayBaseUrl(isRealServe)
    const url = `${baseUrl}/v1/subscribe/${bid}/expire`

    const response = await axios.post(url, nicepayBody, {
      headers: {
        Authorization: req.headers.authorization,
        'Content-Type': 'application/json',
      },
      timeout: NICEPAY_TIMEOUT_MS,
    })

    return sendSuccess(res, response.data)
  } catch (error) {
    return sendError(res, error)
  }
}

// ─── 4. Payment cancel ───
async function cancelPayment(req, res) {
  try {
    const { isRealServe, ...nicepayBody } = req.body
    const { tid } = req.params
    const baseUrl = getNicepayBaseUrl(isRealServe)
    const url = `${baseUrl}/v1/payments/${tid}/cancel`

    const response = await axios.post(url, nicepayBody, {
      headers: {
        Authorization: req.headers.authorization,
        'Content-Type': 'application/json',
      },
      timeout: NICEPAY_TIMEOUT_MS,
    })

    return sendSuccess(res, response.data)
  } catch (error) {
    return sendError(res, error)
  }
}

// ─── 5. Network cancel ───
async function netcancelPayment(req, res) {
  try {
    const { isRealServe, ...nicepayBody } = req.body
    const baseUrl = getNicepayBaseUrl(isRealServe)
    const url = `${baseUrl}/v1/payments/netcancel`

    const response = await axios.post(url, nicepayBody, {
      headers: {
        Authorization: req.headers.authorization,
        'Content-Type': 'application/json',
      },
      timeout: NICEPAY_TIMEOUT_MS,
    })

    return sendSuccess(res, response.data)
  } catch (error) {
    return sendError(res, error)
  }
}

// ─── 6. Payment status query (GET) ───
async function getPaymentStatus(req, res) {
  try {
    const isRealServe = req.query.isRealServe === 'true'
    const { tid } = req.params
    const baseUrl = getNicepayBaseUrl(isRealServe)
    const url = `${baseUrl}/v1/payments/${tid}`

    const response = await axios.get(url, {
      headers: {
        Authorization: req.headers.authorization,
      },
      timeout: NICEPAY_TIMEOUT_MS,
    })

    return sendSuccess(res, response.data)
  } catch (error) {
    return sendError(res, error)
  }
}

// ─── 7. Find payment by orderId (GET) ───
async function findPaymentByOrderId(req, res) {
  try {
    const isRealServe = req.query.isRealServe === 'true'
    const { orderId } = req.params
    const baseUrl = getNicepayBaseUrl(isRealServe)
    const url = `${baseUrl}/v1/payments/find/${orderId}`

    const response = await axios.get(url, {
      headers: {
        Authorization: req.headers.authorization,
      },
      timeout: NICEPAY_TIMEOUT_MS,
    })

    return sendSuccess(res, response.data)
  } catch (error) {
    return sendError(res, error)
  }
}

module.exports = {
  registBillingKey,
  executeBillingPayment,
  expireBillingKey,
  cancelPayment,
  netcancelPayment,
  getPaymentStatus,
  findPaymentByOrderId,
}
