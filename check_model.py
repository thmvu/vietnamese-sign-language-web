import tensorflow as tf
import numpy as np

print("=" * 50)
print("=== MODEL: gesture_embedding_model.keras ===")
print("=" * 50)
model = tf.keras.models.load_model('aiservice/model/gesture_embedding_model.keras')
print(f"Input shape:  {model.input_shape}")
print(f"Output shape: {model.output_shape}")
num_classes_model = model.output_shape[-1]

print("\n" + "=" * 50)
print("=== DICTIONARY: gesture_dictionary.npz ===")
print("=" * 50)
data = np.load('aiservice/model/gesture_dictionary.npz', allow_pickle=True)
print(f"Keys in .npz: {list(data.keys())}")

for key in data.keys():
    arr = data[key]
    print(f"  [{key}] shape={arr.shape}, dtype={arr.dtype}")
    if arr.ndim == 1 and len(arr) <= 30:
        print(f"    values: {list(arr)}")
    elif arr.ndim == 1:
        print(f"    first 10: {list(arr[:10])}")
        print(f"    last  10: {list(arr[-10:])}")

print("\n" + "=" * 50)
print("=== COMPATIBILITY CHECK ===")
print("=" * 50)
if 'labels' in data:
    labels = data['labels']
    num_labels = len(set(labels)) if labels.dtype.kind not in ('U', 'S') else len(labels)
    print(f"Model output classes : {num_classes_model}")
    print(f"Dictionary labels    : {len(labels)}")
    if num_classes_model == len(labels):
        print("✅ MATCH — dictionary hợp lệ với model!")
    else:
        print(f"❌ MISMATCH — Model cần {num_classes_model} classes, dictionary có {len(labels)} labels")
else:
    print("⚠️  Không tìm thấy key 'labels' trong dictionary")
    print("    Hãy kiểm tra tên keys ở trên để biết cách dùng")
