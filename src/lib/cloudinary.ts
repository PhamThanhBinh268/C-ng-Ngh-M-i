export type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
};

export async function uploadImageToCloudinary(file: File) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

  if (!cloudName || !apiKey) {
    throw new Error("Missing Cloudinary config. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_API_KEY.");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signResponse = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timestamp }),
  });

  if (!signResponse.ok) {
    const text = await signResponse.text();
    throw new Error(`Sign failed (${signResponse.status}): ${text || signResponse.statusText}`);
  }

  const signJson = (await signResponse.json()) as { signature: string; timestamp?: number };
  const signature = signJson.signature;
  const usedTimestamp = signJson.timestamp ?? timestamp;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(usedTimestamp));
  formData.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload failed (${response.status}): ${text || response.statusText}`);
  }

  const data = (await response.json()) as CloudinaryUploadResult;
  return data;
}
