// auth.js to accress new accress token through refresh token
export const refreshAccessToken = async (refreshToken) => {
    try {
        const response = await fetch('/login/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: refreshToken }) 
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json();
        console.log(data); // Handle the response data as needed
        return data; // Return data if needed for further use
    } catch (error) {
        console.error('Error:', error); // Handle the error appropriately
    }
};
