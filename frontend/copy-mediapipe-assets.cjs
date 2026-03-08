const fs = require('fs-extra');
const path = require('path');

async function copyAssets() {
  try {
    const mediapipeDir = path.join(__dirname, 'node_modules', '@mediapipe');
    const publicMediapipeDir = path.join(__dirname, 'public', 'mediapipe');

    // Create public/mediapipe directory if it doesn't exist
    await fs.ensureDir(publicMediapipeDir);

    // Copy hands assets
    const handsSrc = path.join(mediapipeDir, 'hands');
    const handsDest = path.join(publicMediapipeDir, 'hands');
    if (await fs.pathExists(handsSrc)) {
      await fs.copy(handsSrc, handsDest, {
        filter: (src) => {
          // Only copy necessary files (JS, WASM, etc.)
          const ext = path.extname(src);
          return ['.js', '.wasm', '.bin', '.txt', '.data'].includes(ext) || fs.statSync(src).isDirectory();
        }
      });
      console.log('✓ Copied @mediapipe/hands assets to public/mediapipe/hands');
    }

    // Copy camera_utils assets
    const cameraUtilsSrc = path.join(mediapipeDir, 'camera_utils');
    const cameraUtilsDest = path.join(publicMediapipeDir, 'camera_utils');
    if (await fs.pathExists(cameraUtilsSrc)) {
      await fs.copy(cameraUtilsSrc, cameraUtilsDest);
      console.log('✓ Copied @mediapipe/camera_utils assets to public/mediapipe/camera_utils');
    }

    // Copy drawing_utils assets
    const drawingUtilsSrc = path.join(mediapipeDir, 'drawing_utils');
    const drawingUtilsDest = path.join(publicMediapipeDir, 'drawing_utils');
    if (await fs.pathExists(drawingUtilsSrc)) {
      await fs.copy(drawingUtilsSrc, drawingUtilsDest);
      console.log('✓ Copied @mediapipe/drawing_utils assets to public/mediapipe/drawing_utils');
    }

    console.log('\nMediaPipe assets copied successfully!');
    console.log('Your development server should now be able to load the required files.');
  } catch (error) {
    console.error('Error copying MediaPipe assets:', error);
    process.exit(1);
  }
}

copyAssets();