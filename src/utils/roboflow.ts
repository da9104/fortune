import axios from 'axios';

export const detectBubbles = async (imageData: string) => {
  if (!process.env.ROBOFLOW_API_KEY) {
    throw new Error('ROBOFLOW_API_KEY is not set');
  }

  try {
    // Remove the data:image/... prefix if present
    const base64Image = imageData.split(',')[1] || imageData;

    const response = await axios({
      method: 'POST',
      url: 'https://serverless.roboflow.com/speech-bubble-in-comics/2',
      params: {
        api_key: process.env.ROBOFLOW_API_KEY
      },
      data: base64Image,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Roboflow API error details:', error.response?.data);
      throw new Error(`Roboflow API error: ${error.message}`);
    }
    throw error;
  }
}; 
