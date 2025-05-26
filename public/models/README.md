
# Face-API.js Models

This directory should contain the face-api.js model files. To make face recognition work, you need to download the following model files from the face-api.js repository and place them here:

Required models:
- tiny_face_detector_model-weights_manifest.json
- tiny_face_detector_model-shard1
- face_landmark_68_model-weights_manifest.json
- face_landmark_68_model-shard1
- face_recognition_model-weights_manifest.json
- face_recognition_model-shard1
- face_recognition_model-shard2
- face_expression_model-weights_manifest.json
- face_expression_model-shard1

You can download these from:
https://github.com/justadudewhohacks/face-api.js/tree/master/weights

For a quick setup, you can also use a CDN by modifying the MODEL_URL in src/utils/faceRecognition.ts to:
`https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model`
