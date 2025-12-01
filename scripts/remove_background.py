#!/usr/bin/env python3
"""
Remove background from Orby mascot images using rembg
"""
import os
from rembg import remove
from PIL import Image
import io

def remove_bg(input_path, output_path):
    """Remove background from an image and save as PNG with transparency"""
    print(f"Processing: {input_path}")
    
    with open(input_path, 'rb') as f:
        input_data = f.read()
    
    output_data = remove(input_data)
    
    img = Image.open(io.BytesIO(output_data))
    img = img.convert("RGBA")
    
    img.save(output_path, 'PNG')
    print(f"Saved: {output_path}")
    return output_path

if __name__ == "__main__":
    mascot_dir = "client/public/mascot"
    output_dir = "client/public/mascot/clean"
    
    os.makedirs(output_dir, exist_ok=True)
    
    images = [
        "orbit_mascot_cyan_saturn_style_transparent.png",
        "orbit_mascot_pointing_helpful_transparent.png",
        "orbit_mascot_pointing_teaching_transparent.png",
        "orbit_mascot_thinking_pose_transparent.png",
        "orbit_saturn_mascot_waving_transparent.png"
    ]
    
    for img_name in images:
        input_path = os.path.join(mascot_dir, img_name)
        output_name = img_name.replace(".png", "_clean.png")
        output_path = os.path.join(output_dir, output_name)
        
        if os.path.exists(input_path):
            try:
                remove_bg(input_path, output_path)
            except Exception as e:
                print(f"Error processing {img_name}: {e}")
        else:
            print(f"File not found: {input_path}")
    
    print("\nDone! Clean cutout images saved to:", output_dir)
