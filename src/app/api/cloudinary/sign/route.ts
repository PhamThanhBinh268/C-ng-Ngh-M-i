import { NextResponse } from "next/server";
import crypto from "crypto";

type SignRequest = {
  timestamp?: number;
};

export async function POST(request: Request) {
  const body = (await request.json()) as SignRequest;
  const timestamp = body.timestamp ?? Math.floor(Date.now() / 1000);
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiSecret) {
    return NextResponse.json({ error: "Missing Cloudinary API secret." }, { status: 500 });
  }

  const signatureBase = `timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(signatureBase + apiSecret)
    .digest("hex");

  return NextResponse.json({ signature });
}
