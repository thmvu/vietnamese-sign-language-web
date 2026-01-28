import numpy as np
import tensorflow as tf
from preprocess import normalize_landmarks, calculate_cosine_similarity

class SignLanguageInference:
    def __init__(self, model_path, dictionary_path):
        """
        Initialize the inference engine
        
        Args:
            model_path: Path to the trained Keras model
            dictionary_path: Path to the sign dictionary (.npz file)
        """
        try:
            self.model = tf.keras.models.load_model(model_path)
            print(f"✅ Model loaded from {model_path}")
        except Exception as e:
            print(f"⚠️ Warning: Could not load model - {e}")
            self.model = None
        
        try:
            data = np.load(dictionary_path)
            self.sign_dictionary = {
                sign: data[sign] for sign in data.files
            }
            print(f"✅ Dictionary loaded with {len(self.sign_dictionary)} signs")
        except Exception as e:
            print(f"❌ Error loading dictionary: {e}")
            self.sign_dictionary = {}
    
    def predict(self, landmarks):
        """
        Predict sign language from landmarks
        
        Args:
            landmarks: numpy array of shape (21, 3) - hand landmarks
            
        Returns:
            tuple: (predicted_sign, confidence)
        """
        if self.model is None and not self.sign_dictionary:
            return "unknown", 0.0
        
        normalized = normalize_landmarks(landmarks)
        
        if self.model is not None:
            input_data = normalized.reshape(1, -1)
            predictions = self.model.predict(input_data, verbose=0)
            predicted_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_idx])
            
            sign_names = list(self.sign_dictionary.keys())
            predicted_sign = sign_names[predicted_idx] if predicted_idx < len(sign_names) else "unknown"
            
            return predicted_sign, confidence
        
        best_match = None
        best_similarity = 0.0
        
        for sign_name, reference_landmarks in self.sign_dictionary.items():
            similarity = calculate_cosine_similarity(normalized.flatten(), reference_landmarks.flatten())
            
            if similarity > best_similarity:
                best_similarity = similarity
                best_match = sign_name
        
        return best_match if best_match else "unknown", float(best_similarity)