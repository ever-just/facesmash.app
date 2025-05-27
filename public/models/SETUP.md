
# Face Recognition Models Setup

## Quick Setup (Recommended)

The application will automatically fall back to CDN loading if local models are not found. However, for the best performance, you should set up local models.

## Download Required Models

Download the following files from the Face-API.js repository and place them in this `/public/models` directory:

### Required Files:
```
tiny_face_detector_model-weights_manifest.json
tiny_face_detector_model-shard1
face_landmark_68_model-weights_manifest.json
face_landmark_68_model-shard1
face_recognition_model-weights_manifest.json
face_recognition_model-shard1
face_recognition_model-shard2
face_expression_model-weights_manifest.json
face_expression_model-shard1
```

### Download Sources:

**Option 1: Official Repository**
Download from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights

**Option 2: CDN Mirror**
You can download from: https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/

### Performance Benefits:

- **3-5x faster loading**: Local models load much faster than CDN
- **Offline capability**: Works without internet connection
- **Better reliability**: No dependency on external CDN availability
- **Reduced bandwidth**: Models are cached locally

### File Structure:
```
public/
└── models/
    ├── tiny_face_detector_model-weights_manifest.json
    ├── tiny_face_detector_model-shard1
    ├── face_landmark_68_model-weights_manifest.json
    ├── face_landmark_68_model-shard1
    ├── face_recognition_model-weights_manifest.json
    ├── face_recognition_model-shard1
    ├── face_recognition_model-shard2
    ├── face_expression_model-weights_manifest.json
    ├── face_expression_model-shard1
    └── SETUP.md (this file)
```

### Verification:

After placing the files, restart your development server. You should see console messages indicating "Loading Face-api.js models from local files..." instead of CDN fallback messages.

### Troubleshooting:

- Ensure all files are in the exact `/public/models` directory
- Check that file names match exactly (case-sensitive)
- Verify files are not corrupted (they should have reasonable file sizes)
- Clear browser cache if you're still seeing CDN loading messages

The application will automatically detect and use local models when available, providing significantly better performance for face recognition operations.
