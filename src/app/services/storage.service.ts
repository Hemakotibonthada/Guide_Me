import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage = inject(Storage);

  async capturePhoto(): Promise<string> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      return image.dataUrl || '';
    } catch (error) {
      console.error('Error capturing photo:', error);
      throw error;
    }
  }

  async selectPhoto(): Promise<string> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      return image.dataUrl || '';
    } catch (error) {
      console.error('Error selecting photo:', error);
      throw error;
    }
  }

  async uploadPhoto(dataUrl: string, path: string): Promise<string> {
    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Upload to Firebase Storage
      const storageRef = ref(this.storage, path);
      await uploadBytes(storageRef, blob);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  }

  async uploadTripPhoto(userId: string, tripId: string, dataUrl: string): Promise<{ url: string, thumbnailUrl: string }> {
    const timestamp = Date.now();
    const photoPath = `users/${userId}/trips/${tripId}/photos/${timestamp}.jpg`;
    const thumbnailPath = `users/${userId}/trips/${tripId}/photos/thumb_${timestamp}.jpg`;

    // For now, using same image for both. In production, you'd generate a thumbnail
    const url = await this.uploadPhoto(dataUrl, photoPath);
    const thumbnailUrl = await this.uploadPhoto(dataUrl, thumbnailPath);

    return { url, thumbnailUrl };
  }

  async deletePhoto(path: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  }

  getPhotoUrl(path: string): Promise<string> {
    const storageRef = ref(this.storage, path);
    return getDownloadURL(storageRef);
  }
}
