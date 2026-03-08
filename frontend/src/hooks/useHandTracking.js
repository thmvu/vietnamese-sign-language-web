import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook nhận diện ĐA TAY bằng MediaPipe Hands.
 *
 * - Phát hiện tối đa 2 tay, vẽ skeleton cho tất cả tay thấy được.
 * - Mỗi frame → 84 features: [right_hand_42, left_hand_42]
 *   Tay không thấy → pad bằng zeros (42 số 0).
 * - Đủ MODEL_SEQUENCE_LENGTH frame thực → emit frameSequence → clear buffer.
 * - MediaPipe được load từ /mediapipe/ (local, không CDN) → tránh Edge Tracking Prevention.
 *
 * @param {React.RefObject} videoRef
 * @param {React.RefObject} canvasRef
 * @param {boolean}         isActive
 */

const MODEL_SEQUENCE_LENGTH = 60;  // khớp với final_model.keras input shape (None, 60, 201)
const ZEROS_201 = Array(201).fill(0);   // placeholder khi không phát hiện tay
const ZEROS_42 = Array(42).fill(0);     // legacy placeholder

/**
 * Tạo 201-feature vector từ 21 landmarks (x, y, z) theo cách model mới được train:
 * - 63 features: xyz normalized (21 × 3)
 * - 138 features: khoảng cách giữa các cặp landmark đặc trưng
 * Tổng = 63 + 138 = 201
 */
function extractFeatures201(hand) {
    // 1. Lấy xyz của 21 landmarks (MediaPipe cung cấp x, y, z)
    const coords = hand.map(lm => [lm.x, lm.y, lm.z ?? 0.0]);

    // 2. Normalize: trừ centroid, chia max_dist
    const cx = coords.reduce((s, c) => s + c[0], 0) / 21;
    const cy = coords.reduce((s, c) => s + c[1], 0) / 21;
    const cz = coords.reduce((s, c) => s + c[2], 0) / 21;
    const centered = coords.map(([x, y, z]) => [x - cx, y - cy, z - cz]);
    const maxDist = Math.max(...centered.map(([x, y, z]) => Math.sqrt(x * x + y * y + z * z)));
    const normalized = maxDist > 0
        ? centered.map(([x, y, z]) => [x / maxDist, y / maxDist, z / maxDist])
        : centered;

    // 3. Flatten xyz → 63 features
    const xyzFeatures = normalized.flat();

    // 4. Pairwise distances giữa các cặp landmark → 138 features
    // Chọn 138 cặp: dùng vòng lặp i<j với tối đa 138 cặp đầu tiên
    const distances = [];
    outer: for (let i = 0; i < 21; i++) {
        for (let j = i + 1; j < 21; j++) {
            const dx = normalized[i][0] - normalized[j][0];
            const dy = normalized[i][1] - normalized[j][1];
            const dz = normalized[i][2] - normalized[j][2];
            distances.push(Math.sqrt(dx * dx + dy * dy + dz * dz));
            if (distances.length >= 138) break outer;
        }
    }

    // Pad nếu thiếu
    while (distances.length < 138) distances.push(0.0);

    return [...xyzFeatures, ...distances]; // 63 + 138 = 201
}

/** Flatten 21 landmarks [[x,y], ...] → [x0,y0, x1,y1, ...] (42 giá trị) — legacy */
function flattenLandmarks(hand) {
    return hand.flatMap(lm => [lm.x, lm.y]);
}

export function useHandTracking(videoRef, canvasRef, isActive) {
    const [landmarks, setLandmarks] = useState(null);   // 1 tay (debug)
    const [isDetected, setIsDetected] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [frameSequence, setFrameSequence] = useState(null);
    const [sequenceProgress, setSequenceProgress] = useState(0);

    const handsRef = useRef(null);
    const cameraRef = useRef(null);
    const drawConnectorsRef = useRef(null);
    const drawLandmarksRef = useRef(null);
    const handConnectionsRef = useRef(null);
    const frameBufferRef = useRef([]);

    const onResults = useCallback((results) => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;

        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const handsDetected = results.multiHandLandmarks?.length > 0;

        if (handsDetected) {
            // ── Vẽ skeleton cho TẤT CẢ tay phát hiện được ──────────────
            results.multiHandLandmarks.forEach((hand) => {
                if (drawConnectorsRef.current && handConnectionsRef.current) {
                    drawConnectorsRef.current(ctx, hand, handConnectionsRef.current, {
                        color: '#60a5fa',
                        lineWidth: 2,
                    });
                }
                if (drawLandmarksRef.current) {
                    drawLandmarksRef.current(ctx, hand, {
                        color: '#f59e0b',
                        lineWidth: 1,
                        radius: 3,
                    });
                }
            });

            // ── Chọn tay chính: ưu tiên tay phải, nếu không có dùng tay trái ─
            // MediaPipe mirror: "Left" trong kết quả = tay phải của người dùng
            let primaryFeatures = null;

            results.multiHandLandmarks.forEach((hand, i) => {
                const label = results.multiHandedness?.[i]?.label; // "Left" | "Right"
                const flat = flattenLandmarks(hand);
                if (label === 'Left' && primaryFeatures === null) {
                    primaryFeatures = flat; // "Left" = tay phải người dùng (ưu tiên)
                } else if (label === 'Right' && primaryFeatures === null) {
                    primaryFeatures = flat; // fallback: tay trái người dùng
                }
            });

            // Nếu không xác định được handedness, lấy tay đầu tiên
            if (!primaryFeatures) {
                primaryFeatures = flattenLandmarks(results.multiHandLandmarks[0]);
            }

            // frame = 201 features [x0,y0,z0,...,x20,y20,z20, dist01, dist02, ...]
            // Khớp với final_model.keras input shape (None, 60, 201)
            const frameFeatures = extractFeatures201(results.multiHandLandmarks[0]);

            setLandmarks(results.multiHandLandmarks[0].map(lm => [lm.x, lm.y, lm.z]));
            setIsDetected(true);

            // ── Cập nhật buffer ───────────────────────────────────────────
            const buf = frameBufferRef.current;
            buf.push(frameFeatures);

            const progress = Math.min(100, Math.round((buf.length / MODEL_SEQUENCE_LENGTH) * 100));
            setSequenceProgress(progress);

            if (buf.length >= MODEL_SEQUENCE_LENGTH) {
                const sequence = [...buf];
                frameBufferRef.current = [];  // clear → bắt đầu ký hiệu mới
                setSequenceProgress(0);
                setFrameSequence(sequence);
            }

        } else {
            // Không phát hiện tay → reset
            setLandmarks(null);
            setIsDetected(false);
            frameBufferRef.current = [];
            setSequenceProgress(0);
        }
    }, [videoRef, canvasRef]);

    useEffect(() => {
        if (!isActive) {
            if (cameraRef.current) { cameraRef.current.stop(); cameraRef.current = null; }
            setLandmarks(null);
            setIsDetected(false);
            frameBufferRef.current = [];
            setSequenceProgress(0);
            setFrameSequence(null);
            return;
        }

        let cancelled = false;

        /**
         * Load script từ LOCAL (/mediapipe/...) thay vì CDN.
         * File được copy vào public/mediapipe/ qua vite-plugin-static-copy.
         * → Tránh hoàn toàn Edge Tracking Prevention warning.
         */
        const loadScript = (src) => new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });

        Promise.all([
            loadScript('/mediapipe/hands/hands.js'),
            loadScript('/mediapipe/camera_utils/camera_utils.js'),
            loadScript('/mediapipe/drawing_utils/drawing_utils.js'),
        ]).then(() => {
            if (cancelled) return;

            const { Hands, HAND_CONNECTIONS } = window;
            const { Camera } = window;
            const { drawConnectors, drawLandmarks } = window;

            drawConnectorsRef.current = drawConnectors;
            drawLandmarksRef.current = drawLandmarks;
            handConnectionsRef.current = HAND_CONNECTIONS;

            const hands = new Hands({
                // locateFile trỏ về local public/mediapipe/hands/
                locateFile: (file) => `/mediapipe/hands/${file}`,
            });

            hands.setOptions({
                maxNumHands: 2,           // ← phát hiện tối đa 2 tay
                modelComplexity: 1,
                minDetectionConfidence: 0.6,
                minTrackingConfidence: 0.5,
            });

            hands.onResults(onResults);
            handsRef.current = hands;

            if (videoRef.current) {
                const camera = new Camera(videoRef.current, {
                    onFrame: async () => {
                        if (handsRef.current && videoRef.current) {
                            await handsRef.current.send({ image: videoRef.current });
                        }
                    },
                    width: 640,
                    height: 480,
                });

                camera.start().then(() => {
                    if (!cancelled) setIsReady(true);
                });

                cameraRef.current = camera;
            }
        }).catch(err => {
            console.error('[MediaPipe] Không load được file local:', err);
        });

        return () => {
            cancelled = true;
            if (cameraRef.current) { cameraRef.current.stop(); cameraRef.current = null; }
            if (handsRef.current) { handsRef.current.close(); handsRef.current = null; }
            setIsReady(false);
            frameBufferRef.current = [];
        };
    }, [isActive, onResults, videoRef]);

    return { landmarks, isDetected, isReady, frameSequence, sequenceProgress };
}
