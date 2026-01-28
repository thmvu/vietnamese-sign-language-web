import Video from '../models/Video.js';

export const getVideosByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    // Model implementation already sorts by display_order ASC by default
    const videos = await Video.findAll({
      where: { lesson_id: lessonId }
    });

    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch videos',
      error: error.message
    });
  }
};

export const createVideo = async (req, res) => {
  try {
    const { lesson_id, title, video_url, duration, display_order } = req.body;

    if (!lesson_id || !title || !video_url) {
      return res.status(400).json({
        success: false,
        message: 'Lesson ID, title, and video URL are required'
      });
    }

    const video = await Video.create({
      lesson_id,
      title,
      video_url,
      duration,
      display_order
    });

    res.status(201).json({
      success: true,
      message: 'Video created successfully',
      data: video
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create video',
      error: error.message
    });
  }
};

export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const video = await Video.findByPk(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    await video.update(updates);

    res.json({
      success: true,
      message: 'Video updated successfully',
      data: video
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update video',
      error: error.message
    });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findByPk(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    await video.destroy();

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete video',
      error: error.message
    });
  }
};