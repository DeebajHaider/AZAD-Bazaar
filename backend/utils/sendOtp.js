// For testing we simply console.log the OTP. Replace this with a real SMS provider later.
async function sendOtp(phone, code) {
  // simulate async sending
  console.log(`[OTP] Send to ${phone}: ${code}`);
  return Promise.resolve();
}

module.exports = { sendOtp };
