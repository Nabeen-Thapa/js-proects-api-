// Generic helper function for sending responses with status code and message
export const sendResponse = (res, statusCode, success, message) => {
    return res.status(statusCode).json({
        success: success,
        message: message
    });
};

// Specific helper for user already exists
export const sendUserExistsError = (res) => {
    return sendResponse(res, 400, false, 'User with this email, phone, or username already exists.');
};

// Specific helper for invalid request
export const sendInvalidRequestError = (res) => {
    return sendResponse(res, 400, false, 'Invalid request. Please check your input.');
};

// Specific helper for internal server error
export const sendInternalServerError = (res) => {
    return sendResponse(res, 500, false, 'Internal server error. Please try again later.');
};

// Specific helper for successful registration
export const sendRegistrationSuccess = (res) => {
    return sendResponse(res, 201, true, 'User updated successfully.');
};

// Specific helper for unauthorized access
export const sendUnauthorizedError = (res) => {
    return sendResponse(res, 401, false, 'Unauthorized access. Please provide valid credentials.');
};

// Specific helper for forbidden access
export const sendForbiddenError = (res) => {
    return sendResponse(res, 403, false, 'Access forbidden. You do not have the necessary permissions.');
};

// Specific helper for resource not found
export const sendNotFoundError = (res) => {
    return sendResponse(res, 404, false, 'Resource not found.');
};

// Specific helper for logout success
export const sendLogoutSuccess = (res) => {
    return sendResponse(res, 204, true, 'Logout successful.');
};
// Specific helper for email reset success
export const emailSuccess = (res) => {
    return sendResponse(res, 200, true, 'password reset.check your email for the OTP');
};

export const sendBadRequestError= (res) => {
    return sendResponse(res,400, false, 'All fields are required');
};


export const sendSuccess = (res)=>{
    return sendResponse(res,200, true, 'Password has been changed successfully');
}


export const logoutSuccess = (res) => {
    return sendResponse(res, 200, true, 'Successfully logged out');
};
