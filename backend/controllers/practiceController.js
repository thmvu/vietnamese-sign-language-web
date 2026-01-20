const axios = require('axios');

const evaluatePractice = async (req, res) => {
  try {
    const { landmarks } = req.body;

    if (!landmarks || !Array.isArray(landmarks)) {
      return res.status(400).json({
        success: false,
        message: 'Landmarks array is required'
      });
    }

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000/predict';

    const aiResponse = await axios.post(aiServiceUrl, {
      landmarks: landmarks
    }, {
      timeout: 10000
    });

    const { predicted_sign, confidence } = aiResponse.data;

    res.json({
      success: true,
      data: {
        predicted_sign,
        confidence,
        is_correct: confidence > 0.75,
        feedback: confidence > 0.75 
          ? 'Excellent! Your sign is accurate.' 
          : 'Try again. Make sure your hand position matches the reference.'
      }
    });

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'AI service unavailable',
        error: 'Cannot connect to AI inference service'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Practice evaluation failed',
      error: error.message
    });
  }
};

module.exports = {
  evaluatePractice
};