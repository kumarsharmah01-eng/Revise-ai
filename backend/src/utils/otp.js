// Generate a 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// OTP expires after 10 minutes
export const getOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000);
};

// Check if OTP is expired
export const isOTPExpired = (expiryTime) => {
  return !expiryTime || new Date() > new Date(expiryTime);
};
