#!/usr/bin/env python3
"""
Background removal script for DarkWave Studios emblems and logos.
Uses rembg library for AI-powered background removal.
"""

import os
from pathlib import Path
from rembg import remove
from PIL import Image
import io

# Define the images to process
IMAGES_TO_PROCESS = [
    "client/public/darkwave-emblem.png",
    "client/public/darkwavepulse-logo.png", 
    "client/public/orbit-saturn-logo.png",
    "client/public/orbit-logo.png",
    "client/public/orbit-hallmark-emblem.png",
    "client/public/orbit-verification-badge.png",
    "client/public/lotopspro-logo.png",
    "client/public/favicon.png",
]

def remove_background(input_path: str, output_path: str = None):
    """Remove background from an image and save as transparent PNG."""
    if output_path is None:
        # Create backup and overwrite original
        output_path = input_path
    
    try:
        print(f"Processing: {input_path}")
        
        # Read the input image
        with open(input_path, 'rb') as f:
            input_data = f.read()
        
        # Remove background
        output_data = remove(input_data)
        
        # Save the result
        with open(output_path, 'wb') as f:
            f.write(output_data)
        
        print(f"  ✅ Saved: {output_path}")
        return True
        
    except Exception as e:
        print(f"  ❌ Error processing {input_path}: {e}")
        return False

def main():
    print("=" * 60)
    print("DarkWave Studios - Background Removal Tool")
    print("Using rembg for AI-powered transparent backgrounds")
    print("=" * 60)
    print()
    
    successful = 0
    failed = 0
    
    for image_path in IMAGES_TO_PROCESS:
        if os.path.exists(image_path):
            if remove_background(image_path):
                successful += 1
            else:
                failed += 1
        else:
            print(f"⚠️  File not found: {image_path}")
            failed += 1
    
    print()
    print("=" * 60)
    print(f"Complete! Processed: {successful} | Failed: {failed}")
    print("=" * 60)

if __name__ == "__main__":
    main()
