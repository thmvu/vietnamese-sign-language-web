import os
import json
import numpy as np
import tensorflow as tf

# Number of frames per sequence (must match model training)
SEQUENCE_LENGTH = 100
# Features per frame: 21 landmarks × 2 (x, y only) = 42  ← confirmed by model input shape
FEATURES_PER_FRAME = 42


class SignLanguageInference:
    def __init__(self, model_path, dictionary_path, labels_path=None):
        """
        Initialize the inference engine.

        Args:
            model_path: Path to the trained Keras model (.keras)
            dictionary_path: Path to the embedding dictionary (.npz)
                             (Legacy: used if labels_path is missing)
            labels_path: Path to labels.json (optional but recommended)
        """
        # ------------------------------------------------------------------
        # Load model
        # ------------------------------------------------------------------
        try:
            self.model = tf.keras.models.load_model(model_path)
            print(f"[OK] Model loaded from {model_path}")
        except Exception as e:
            print(f"[WARN] Could not load model - {e}")
            self.model = None

        # ------------------------------------------------------------------
        # Load labels mapping
        # ------------------------------------------------------------------
        self.label_names = []

        # 1. Try labels_path if provided
        if not labels_path:
            # Fallback: look for labels.json next to dictionary or model
            possible_labels = [
                os.path.join(os.path.dirname(model_path), "labels.json"),
                os.path.join(os.getcwd(), "aiservice", "model", "labels.json")
            ]
            for p in possible_labels:
                if os.path.exists(p):
                    labels_path = p
                    break

        if labels_path and os.path.exists(labels_path):
            try:
                with open(labels_path, "r", encoding="utf-8") as f:
                    self.label_names = json.load(f)
                print(f"[OK] Labels loaded from {labels_path} ({len(self.label_names)} classes)")
            except Exception as e:
                print(f"[WARN] Error loading labels.json: {e}")

        # 2. Fallback to dictionary labels if needed
        if not self.label_names:
            try:
                data = np.load(dictionary_path, allow_pickle=True)
                raw_labels = data['labels']
                if raw_labels.dtype.kind in ('U', 'S', 'O'):
                    self.label_names = list(raw_labels)
                else:
                    unique_ids = sorted(set(raw_labels.astype(int).tolist()))
                    self.label_names = [str(uid) for uid in unique_ids]
                print(f"[OK] Dictionary labels used as fallback ({len(self.label_names)} classes)")
            except Exception:
                print("[WARN] No label information found.")
                self.label_names = []

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def predict_from_sequence(self, frame_sequence):
        """
        Predict sign language from a sequence of hand-landmark frames.

        Args:
            frame_sequence: numpy array, shape (100, 42)
                            Each row = 21 landmarks flattened as [x0,y0, x1,y1, ...]

        Returns:
            (predicted_sign: str, confidence: float)
        """
        if self.model is None:
            return "unknown", 0.0

        # Validate shape
        if frame_sequence.shape != (SEQUENCE_LENGTH, FEATURES_PER_FRAME):
            raise ValueError(
                f"Expected sequence shape ({SEQUENCE_LENGTH}, {FEATURES_PER_FRAME}), "
                f"got {frame_sequence.shape}"
            )

        # Model expects batch dimension: (1, 100, 42)
        batch = frame_sequence[np.newaxis, ...]               # (1, 100, 42)
        output = self.model.predict(batch, verbose=0)          # (1, num_classes)
        probs = output[0]                                      # (num_classes,)

        predicted_idx = int(np.argmax(probs))
        confidence = float(probs[predicted_idx])

        # Map index to name
        if self.label_names and predicted_idx < len(self.label_names):
            sign_name = self.label_names[predicted_idx]
        else:
            sign_name = str(predicted_idx)

        return sign_name, confidence

    @staticmethod
    def normalize_frame(landmarks_xy):
        """
        Translate + scale landmarks so they are position/size invariant.

        Args:
            landmarks_xy: (21, 2) array of (x, y) normalised coords [0-1]

        Returns:
            Flattened (42,) array
        """
        lm = np.array(landmarks_xy, dtype=np.float32)     # (21, 2)
        centroid = lm.mean(axis=0)
        centred = lm - centroid
        scale = np.linalg.norm(centred, axis=1).max()
        if scale > 0:
            centred /= scale
        return centred.flatten()                            # (42,)