import tensorflow as tf

model = tf.keras.models.load_model('aiservice/model/final_model.keras')
print("=== Model Input Shape ===")
print(model.input_shape)   # (None, SEQUENCE_LENGTH, FEATURES_PER_FRAME)
print("=== Model Summary ===")
model.summary()
