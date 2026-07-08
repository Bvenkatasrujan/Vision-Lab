import os
import cv2
import numpy as np

def create_directory(path):
    if not os.path.exists(path):
        os.makedirs(path)

def seed_all():
    target_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "public", "images")
    create_directory(target_dir)
    print(f"Target directory for seed images: {target_dir}")

    # 1. Test Pattern Grid (gradients, concentric circles, lines)
    # Size: 512x512
    test_pattern = np.zeros((512, 512, 3), dtype=np.uint8)
    # Background gradient
    for y in range(512):
        for x in range(512):
            test_pattern[y, x] = [x // 2, y // 2, (x + y) // 4]
            
    # Concentric circles in center
    cv2.circle(test_pattern, (256, 256), 180, (255, 255, 255), 3)
    cv2.circle(test_pattern, (256, 256), 120, (0, 255, 255), 3)
    cv2.circle(test_pattern, (256, 256), 60, (255, 0, 255), 3)
    cv2.circle(test_pattern, (256, 256), 20, (255, 255, 0), -1)
    
    # Grid lines
    for i in range(32, 512, 64):
        cv2.line(test_pattern, (i, 0), (i, 512), (180, 180, 180), 1)
        cv2.line(test_pattern, (0, i), (512, i), (180, 180, 180), 1)
        
    # High frequency bars
    for i in range(10):
        w = i + 1
        x_start = 50 + i * 15
        cv2.rectangle(test_pattern, (x_start, 50), (x_start + w, 100), (255, 255, 255), -1)
        
    cv2.imwrite(os.path.join(target_dir, "test_pattern.png"), test_pattern)
    print("Seeded test_pattern.png")

    # 2. Coins Simulation (multiple overlapping circles on dark background)
    coins = np.ones((512, 512), dtype=np.uint8) * 30 # Dark background
    # Add circular coins with gradients (metal look)
    coin_positions = [
        ((120, 150), 45, 180),
        ((220, 120), 35, 200),
        ((350, 160), 50, 220),
        ((150, 300), 40, 170),
        ((280, 320), 48, 190),
        ((400, 350), 38, 210),
        ((230, 420), 42, 185)
    ]
    
    for (center, radius, base_brightness) in coin_positions:
        # Draw a coin with gradient to make it look like a 3D sphere
        for r in range(radius, 0, -1):
            factor = (radius - r) / radius
            val = int(base_brightness - 60 * factor)
            cv2.circle(coins, center, r, val, -1)
        # Coin border
        cv2.circle(coins, center, radius, 255, 2)
        
    cv2.imwrite(os.path.join(target_dir, "coins.png"), coins)
    print("Seeded coins.png")

    # 3. Cameraman Simulation (grayscale silhouette against gray sky and building)
    cameraman = np.zeros((512, 512), dtype=np.uint8)
    # Background sky (gradually lighter from bottom to top)
    for y in range(512):
        cameraman[y, :] = int(180 - y * 0.15)
        
    # Ground (dark green/gray field)
    cameraman[350:, :] = 45
    
    # Draw simple building in background
    cv2.rectangle(cameraman, (380, 180), (480, 350), 80, -1)
    # Draw building windows
    for wy in range(200, 330, 30):
        for wx in range(400, 470, 25):
            cv2.rectangle(cameraman, (wx, wy), (wx + 15, wy + 15), 200, -1)
            
    # Draw cameraman silhouette (simple tripod, camera, and person shape)
    # Tripod legs
    cv2.line(cameraman, (220, 220), (140, 350), 15, 4)
    cv2.line(cameraman, (220, 220), (220, 350), 15, 4)
    cv2.line(cameraman, (220, 220), (300, 350), 15, 4)
    
    # Person coat (trapezoid)
    pts = np.array([[220, 200], [270, 200], [300, 350], [210, 350]], np.int32)
    cv2.fillPoly(cameraman, [pts], 20)
    
    # Camera body & lens
    cv2.rectangle(cameraman, (180, 180), (220, 210), 10, -1)
    cv2.rectangle(cameraman, (150, 190), (180, 202), 10, -1) # Lens
    
    # Head & Hood
    cv2.circle(cameraman, (245, 175), 18, 20, -1)
    cv2.ellipse(cameraman, (245, 178), (22, 15), 45, 0, 360, 20, -1)
    
    cv2.imwrite(os.path.join(target_dir, "cameraman.png"), cameraman)
    print("Seeded cameraman.png")

    # 4. Color Chart (Mandrill replacement - primary colors, secondary, text, gradients)
    color_chart = np.zeros((512, 512, 3), dtype=np.uint8)
    # Divide into 4 quadrants
    # Quad 1: RGB circles blending
    cv2.circle(color_chart, (128, 100), 50, (255, 0, 0), -1) # Blue
    cv2.circle(color_chart, (168, 100), 50, (0, 255, 0), -1) # Green
    cv2.circle(color_chart, (148, 130), 50, (0, 0, 255), -1) # Red
    
    # Quad 2: Color checker blocks
    block_w = 40
    colors = [
        (255, 0, 0), (0, 255, 0), (0, 0, 255),
        (255, 255, 0), (255, 0, 255), (0, 255, 255),
        (128, 128, 128), (255, 255, 255), (0, 0, 0),
        (128, 0, 0), (0, 128, 0), (0, 0, 128)
    ]
    for idx, c in enumerate(colors):
        r_idx = idx // 4
        c_idx = idx % 4
        x = 300 + c_idx * 45
        y = 40 + r_idx * 45
        cv2.rectangle(color_chart, (x, y), (x + block_w, y + block_w), c, -1)
        cv2.rectangle(color_chart, (x, y), (x + block_w, y + block_w), (255, 255, 255), 1)

    # Quad 3: Smooth HSV wheel-like sector or gradient grid
    for r_idx in range(256, 512):
        for c_idx in range(0, 256):
            h = int((c_idx / 256) * 180)
            s = int(((512 - r_idx) / 256) * 255)
            v = 255
            # Convert HSV pixel to BGR
            pixel = np.array([[[h, s, v]]], dtype=np.uint8)
            bgr_pixel = cv2.cvtColor(pixel, cv2.COLOR_HSV2BGR)[0, 0]
            color_chart[r_idx, c_idx] = bgr_pixel

    # Quad 4: High resolution textures, lines, grayscale gradient
    for r_idx in range(256, 300):
        val = int(((r_idx - 256) / 44) * 255)
        color_chart[r_idx, 256:512] = [val, val, val]
        
    for i in range(256, 512, 10):
        # Draw colored lines
        cv2.line(color_chart, (i, 320), (i + 5, 480), (0, 255, 255), 2)
        cv2.line(color_chart, (256, i + 64), (512, i + 64), (255, 0, 255), 2)

    cv2.imwrite(os.path.join(target_dir, "color_chart.png"), color_chart)
    print("Seeded color_chart.png")

if __name__ == "__main__":
    seed_all()
