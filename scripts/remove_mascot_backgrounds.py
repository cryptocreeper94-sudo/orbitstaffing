#!/usr/bin/env python3
"""
Remove backgrounds from Orbit mascot images using rembg.
Creates transparent PNG versions for use in the app.
"""

import os
from pathlib import Path

try:
    from rembg import remove
    from PIL import Image
    import io
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.check_call(['pip', 'install', 'rembg', 'pillow'])
    from rembg import remove
    from PIL import Image
    import io

# Source and destination directories
SOURCE_DIR = Path("attached_assets/generated_images")
DEST_DIR = Path("client/public/mascot")

# Mascot images to process
MASCOT_IMAGES = [
    "orbit_mascot_cyan_saturn_style.png",      # wave pose
    "orbit_mascot_pointing_helpful.png",        # point pose
    "orbit_mascot_thinking_pose.png",           # think pose
    "orbit_saturn_mascot_waving.png",           # alternate wave
    "orbit_mascot_pointing_teaching.png",       # alternate point
]

def process_image(filename: str) -> bool:
    """Remove background from a single image."""
    source_path = SOURCE_DIR / filename
    
    if not source_path.exists():
        print(f"  ⚠️  Source not found: {filename}")
        return False
    
    # Create output filename
    base_name = filename.replace(".png", "")
    dest_path = DEST_DIR / f"{base_name}_transparent.png"
    
    try:
        # Read source image
        with open(source_path, "rb") as f:
            input_data = f.read()
        
        # Remove background
        output_data = remove(input_data)
        
        # Save transparent version
        with open(dest_path, "wb") as f:
            f.write(output_data)
        
        # Get file sizes for reporting
        orig_size = os.path.getsize(source_path) / 1024
        new_size = os.path.getsize(dest_path) / 1024
        
        print(f"  ✓ {filename}")
        print(f"    Original: {orig_size:.1f}KB → Transparent: {new_size:.1f}KB")
        return True
        
    except Exception as e:
        print(f"  ✗ Error processing {filename}: {e}")
        return False

def main():
    print("🪐 Orbit Mascot Background Removal")
    print("=" * 40)
    
    # Create destination directory
    DEST_DIR.mkdir(parents=True, exist_ok=True)
    print(f"📁 Output directory: {DEST_DIR}")
    print()
    
    # Process each mascot image
    success_count = 0
    for filename in MASCOT_IMAGES:
        print(f"Processing: {filename}")
        if process_image(filename):
            success_count += 1
        print()
    
    print("=" * 40)
    print(f"✅ Processed {success_count}/{len(MASCOT_IMAGES)} images")
    print(f"📁 Transparent images saved to: {DEST_DIR}")

if __name__ == "__main__":
    main()
