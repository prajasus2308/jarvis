import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
type NormalizedLandmark = { x:number; y:number; z:number };

export type HandFrame = { landmarks: NormalizedLandmark[]; confidence: number; gesture: string; palm: { x: number; y: number }; scale: number };
export type VisionSession = { stop(): void };
const distance = (a: NormalizedLandmark, b: NormalizedLandmark) => Math.hypot(a.x - b.x, a.y - b.y);
function classify(points: NormalizedLandmark[]): string {
  const scale = Math.max(distance(points[0], points[9]), .001);
  const pinch = distance(points[4], points[8]) / scale;
  const extended = [8, 12, 16, 20].filter((tip, i) => points[tip].y < points[[6, 10, 14, 18][i]].y).length;
  if (pinch < .36) return 'PINCH';
  if (points[4].y < points[3].y && points[8].y > points[6].y && extended === 0) return 'THUMBS UP';
  if (extended === 0) return 'FIST';
  if (extended === 1 && points[8].y < points[6].y) return 'POINT';
  if (extended >= 4) return 'OPEN PALM';
  return 'HAND DETECTED';
}
export async function startHandTracking(video: HTMLVideoElement, onFrame: (frame: HandFrame | null) => void): Promise<VisionSession> {
  const files = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm');
  const tracker = await HandLandmarker.createFromOptions(files, { baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task', delegate: 'GPU' }, runningMode: 'VIDEO', numHands: 2 });
  let active = true, frameId = 0, last = 0;
  const tick = () => { if (!active) return; if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && performance.now() - last > 33) { last = performance.now(); const result = tracker.detectForVideo(video, last); const points = result.landmarks[0]; onFrame(points ? { landmarks: points, confidence: result.handednesses[0]?.[0]?.score ?? 0, gesture: classify(points), palm: { x: points[0].x, y: points[0].y }, scale: distance(points[0], points[9]) } : null); } frameId = requestAnimationFrame(tick); };
  tick(); return { stop: () => { active = false; cancelAnimationFrame(frameId); tracker.close(); } };
}
