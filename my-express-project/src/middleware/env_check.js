import logger from '../utils/logger.js'; // Import your logger utility

export const validateEnvAppPort = () => {
    const requiredVars = ['PORT'];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length) {
        const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
        
        // Log the error
        logger.error(errorMessage);

        return {
            error: true,
            message: errorMessage
        };
    }
    // Log a success message when validation passes
    logger.info('Environment variables validated successfully.');

    return { error: false };
};
