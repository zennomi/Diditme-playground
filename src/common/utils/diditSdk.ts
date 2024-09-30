import axios from "axios"
import { createHmac } from "crypto"
import { env } from "./envConfig";

export const getAccessToken = async () => {
    const encodedCredentials = Buffer.from(
        `${env.DIDIT_CLIENT_ID}:${env.DIDIT_CLIENT_SECRET}`,
    ).toString('base64');
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    const { data } = await axios({
        baseURL: "https://apx.didit.me",
        method: "POST",
        url: "/auth/v2/token/",
        headers: {
            Authorization: `Basic ${encodedCredentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: params,
    })
    if (!data.access_token) throw new Error()
    return data.access_token as string
}

// Force dynamic import of environment variables
export const dynamic = "force-dynamic";

export function encodeData(data: any): Buffer {
    const formattedData = JSON.stringify(data);
    return Buffer.from(formattedData, "utf-8");
}

// Function to verify the signature
export function verifySignature(
    encodedData: Buffer,
    receivedSignature: string,
    secret: string
): boolean {
    const computedSignature = createHmac("sha256", secret)
        .update(encodedData)
        .digest("hex");

    const isValid = computedSignature === receivedSignature;
    return isValid;
}

// Function to verify timestamp is within 5 minutes
export function verifyTimestamp(timestamp: number): boolean {
    const now = Math.round(Date.now() / 1000);
    const fiveMinutes = 5 * 60 * 1000;

    return now - timestamp <= fiveMinutes;
}