from typing import Tuple, Optional, Any

try:
    import cv2
except ImportError:
    cv2 = None

try:
    import numpy as np
except ImportError:
    np = None

if np is None:
    class MockNP:
        ndarray = Any
    np = MockNP()

class ImagePreprocessor:
    """
    Advanced Image Preprocessing utilities using OpenCV to clean, binarize, 
    and deskew scanned forms, screenshots, printed reports, and tables for subsequent OCR.
    """
    @staticmethod
    def read_image(image_path_or_bytes) -> np.ndarray:
        """
        Loads image file into correct OpenCV format (BGR).
        Handles file paths or raw byte streams.
        """
        if isinstance(image_path_or_bytes, str):
            img = cv2.imread(image_path_or_bytes)
            if img is None:
                raise ValueError(f"Failed to load image from path: {image_path_or_bytes}")
            return img
        else:
            # Assume raw bytes
            nparr = np.frombuffer(image_path_or_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                raise ValueError("Failed to decode image from raw bytes.")
            return img

    @staticmethod
    def to_grayscale(image: np.ndarray) -> np.ndarray:
        """
        Converts BGR image to single channel grayscale.
        """
        if len(image.shape) == 3:
            return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        return image

    @staticmethod
    def denoise(grayscale_image: np.ndarray, strength: int = 10) -> np.ndarray:
        """
        Eliminates salt-and-pepper noise and scan specks with Gaussian bilateral filters.
        """
        return cv2.GaussianBlur(grayscale_image, (3, 3), 0)

    @staticmethod
    def threshold_adaptive(grayscale_image: np.ndarray) -> np.ndarray:
        """
        Applies adaptive OTSU binarization for handling diverse lighting in reports and scanned documents.
        """
        return cv2.threshold(grayscale_image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

    @staticmethod
    def detect_skew_angle(grayscale_image: np.ndarray) -> float:
        """
        Estimates text skew angle in degrees using Radon transform/Hough Lines 
        on binarized text boundaries.
        """
        # Binarize and invert
        bin_img = cv2.bitwise_not(cv2.threshold(grayscale_image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1])
        coords = np.column_stack(np.where(bin_img > 0))
        angle = cv2.minAreaRect(coords)[-1]
        
        # Adjust skew angle according to cv2.minAreaRect behavior
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle
        return angle

    @staticmethod
    def deskew(image: np.ndarray, angle: float) -> np.ndarray:
        """
        Rotates image around the center by the given angle to realign text horizontally.
        """
        if abs(angle) < 0.5:
            return image
        (h, w) = image.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        return rotated

    @classmethod
    def preprocess_pipeline(cls, image_path_or_bytes, apply_deskew: bool = True) -> np.ndarray:
        """
        Runs comprehensive pipeline containing noise filtering, adaptive thresh, 
        and optional deskewing alignment.
        """
        img = cls.read_image(image_path_or_bytes)
        gray = cls.to_grayscale(img)
        denoised = cls.denoise(gray)
        
        if apply_deskew:
            angle = cls.detect_skew_angle(denoised)
            # Only correct if skew is notable but within sensible limits (e.g., <= 45 deg)
            if 0.5 < abs(angle) < 45:
                img = cls.deskew(img, angle)
                gray = cls.to_grayscale(img)
                denoised = cls.denoise(gray)

        binarized = cls.threshold_adaptive(denoised)
        return binarized
