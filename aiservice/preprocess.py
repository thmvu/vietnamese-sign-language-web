import numpy as np

def normalize_landmarks(landmarks):
    """
    Normalize hand landmarks to be translation and scale invariant
    
    Args:
        landmarks: numpy array of shape (21, 3) - hand landmarks (x, y, z)
        
    Returns:
        normalized landmarks
    """
    if landmarks.shape != (21, 3):
        raise ValueError(f"Expected landmarks shape (21, 3), got {landmarks.shape}")
    
    centroid = np.mean(landmarks, axis=0)
    
    centered = landmarks - centroid
    
    max_dist = np.max(np.linalg.norm(centered, axis=1))
    
    if max_dist > 0:
        normalized = centered / max_dist
    else:
        normalized = centered
    
    return normalized

def calculate_cosine_similarity(vec1, vec2):
    """
    Calculate cosine similarity between two vectors
    
    Args:
        vec1: First vector
        vec2: Second vector
        
    Returns:
        Cosine similarity (0 to 1)
    """
    vec1 = np.array(vec1).flatten()
    vec2 = np.array(vec2).flatten()
    
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    similarity = dot_product / (norm1 * norm2)
    
    return max(0.0, min(1.0, similarity))

def extract_hand_features(landmarks):
    """
    Extract additional features from hand landmarks
    
    Args:
        landmarks: numpy array of shape (21, 3)
        
    Returns:
        Feature vector
    """
    normalized = normalize_landmarks(landmarks)
    
    distances = []
    for i in range(len(normalized)):
        for j in range(i + 1, len(normalized)):
            dist = np.linalg.norm(normalized[i] - normalized[j])
            distances.append(dist)
    
    angles = []
    for i in range(1, len(normalized) - 1):
        v1 = normalized[i] - normalized[i-1]
        v2 = normalized[i+1] - normalized[i]
        
        cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-8)
        angles.append(cos_angle)
    
    features = np.concatenate([
        normalized.flatten(),
        distances,
        angles
    ])
    
    return features